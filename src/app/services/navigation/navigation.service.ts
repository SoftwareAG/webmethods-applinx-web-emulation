/*
 * Copyright 2022 Software AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ 
 import {Injectable} from '@angular/core';
import { GXUtils } from 'src/utils/GXUtils'
import {BehaviorSubject, Observable} from 'rxjs';
import { ScreenLockerService } from '../screen-locker.service';
import { Router } from '@angular/router';
import { UserExitsEventThrowerService } from '../user-exits-event-thrower.service';
import { NGXLogger } from 'ngx-logger';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { MessagesService } from '../messages.service';
import { Position, Size, InputField, Cursor, ScreenService, InfoService, SendKeysRequest, GetInfoResponse, GetScreenResponse, ReturnScreen, GetScreenRequest } from '@softwareag/applinx-rest-apis';
import { TabAndArrowsService } from './tab-and-arrows.service';
import { StatusCodes } from 'http-status-codes';
import { GetScreenNumberResponse } from '@softwareag/applinx-rest-apis/lib/model/getScreenNumberResponse';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
 
  
  private routingHandler: RoutingHandler;
  private screenId: number;
  private screenSize: Size;
  private sendableFields: Map<string, InputField>;
  private cursorPosition: Cursor;
  CHECK_HOST_SCREEN_UPDATE_INTERVAL:number = 5000;
  CHECK_HOST_SCREEN_UPDATE_TIMEOUT:number = 500;
  isScreenUpdated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  screenObjectUpdated: BehaviorSubject<GetScreenResponse> = new BehaviorSubject(null);

  constructor(private screenService: ScreenService, 
              private screenLockerService: ScreenLockerService, private router: Router,
              private infoService: InfoService, 
              private logger: NGXLogger,
              private storageService: StorageService,
              private tabAndArrowsService: TabAndArrowsService,
              private userExitsEventThrower: UserExitsEventThrowerService,
              private messages: MessagesService) {
    this.sendableFields = new Map<string, InputField>();
    this.setRoutingHandler();
    this.checkHostScreenUpdate();
  }

  checkHostScreenUpdate (): void {
    setInterval( () => { 
      this.checkScreenUpdated();
       
   }, this.CHECK_HOST_SCREEN_UPDATE_INTERVAL);
  }

  checkScreenUpdated () {
    const req = new GetScreenRequest();                           
    if (this.getScreenId()){
      this.getHostScreenNumber().subscribe (
        screenNumberResponse => {
          if (screenNumberResponse.screenNumber >  this.getScreenId() ) {      
            this.isScreenUpdated.next(true);                      
          }
        },
        (error: HttpErrorResponse) => {
          this.logger.error(this.messages.get("FAILED_TO_GET_SCREEN_FROM_REST_API"));
          this.userExitsEventThrower.fireOnGetScreenError(error);
        });
    }
  }


  getHostScreenNumber (): Observable<GetScreenNumberResponse>{         
    return this.screenService.getScreenNumber(this.storageService.getAuthToken());    
  }

  sendKeys(sendKey: string): void {
    if (this.screenLockerService.isLocked()) {
      return; // windows is loading...
    }

    this.getHostScreenNumber().subscribe (
      screenNumberResponse => {
        if (screenNumberResponse.screenNumber  > this.getScreenId()) {
          //Host screen id is newer than current screen, probably intermidiate screen , updating the current screen without sending key
          this.isScreenUpdated.next(true); 
          return;
        }
        this.sendKeysInternal (sendKey)
      },
    );
  }

  checkForIntermidateScreen() {
    setTimeout( () => { 
      this.checkScreenUpdated();
       
     }, this.CHECK_HOST_SCREEN_UPDATE_TIMEOUT);
  }

  sendKeysInternal (sendKey: string): void {
    this.screenLockerService.setScreenIdUpdated(false);
    this.screenLockerService.setLocked(true);
    const shouldReturnScreen = true;
    const returnScreen = new ReturnScreen (shouldReturnScreen);
    const sendKeysRequest = new SendKeysRequest(sendKey, this.cursorPosition, this.screenSize, Array.from(this.sendableFields.values()),returnScreen);//,returnScreen
    this.userExitsEventThrower.firePreSendKey(sendKeysRequest); 
    this.screenService.updateScreen(sendKeysRequest, this.screenId, this.storageService.getAuthToken()).subscribe(newScreen => {
      this.tearDown();      
      this.userExitsEventThrower.firePostSendKey(newScreen);
      this.screenObjectUpdated.next (newScreen);      
      this.checkForIntermidateScreen();
      
    }, errorResponse => {
      this.logger.error(errorResponse);
      if (errorResponse.status === StatusCodes.GONE || errorResponse.error.message.indexOf("Session was disconnected by Host") > 0) {
          this.storageService.setNotConnected();
      }
      this.userExitsEventThrower.fireOnSendKeyError(errorResponse);   
      this.screenLockerService.setLocked(false);
    });
  }

  /**
   * Set content to unprotected field (input).
   * @param id - distinct id of the element.
   * @param value - the content to set.
   */
  public fillInput(id: string, value: any): void {
    if (!id) return;
    const el = document.getElementById(id) as HTMLInputElement;
    if (!el) return;
    el.value = value;
    const inputField = new InputField();
    inputField.name = id;
    inputField.value = value;
    this.setSendableField(inputField);
  }

  public getScreenId(): number {
    return this.screenId;
  }
  
  setScreenId(id: number): void {
    this.screenId = id;
    this.screenLockerService.setScreenIdUpdated(true);
  }

  setScreenSize(size: Size): void {
    this.screenSize = size;
  }

  setSendableField(inputField: InputField): void {
    this.sendableFields.set(this.getFieldId(inputField), inputField);
  }

  private getFieldId(inputField: InputField): string {
    return inputField.name || GXUtils.posToString(inputField.position);
  }

  setCursorPosition(cursor: Cursor, positionInWindow?: Position): void {
    this.cursorPosition = cursor;
    if (positionInWindow || cursor.position) {
      this.tabAndArrowsService.setMatrixPosition(positionInWindow || cursor.position);
    }
  }

  getCursorPosition(): Cursor {
    return this.cursorPosition;
  }

  getRoutingHandler(): RoutingHandler {
    return this.routingHandler;
  }

  private setRoutingHandler(): void {
    this.routingHandler = new RoutingHandler();
    const routes = new Set<string>();
    for (let i = 0; i < this.router.config.length; i++) {
      routes.add(GXUtils.removeSlash(this.router.config[i].path));
    }
    this.routingHandler.routes = routes;
  }

  redirectToSamePath(uri: string): void {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate([uri]));
  }
  
  handleScreenIdMismatch(errorResponse: HttpErrorResponse): void {
    this.infoService.getInfo(this.storageService.getAuthToken()).subscribe((response: GetInfoResponse) => {
      if (response.sessionConnected && this.getScreenId() !== response.screenId) {
          this.logger.info(this.messages.get("SCREENID_MISMATCH_OCCURED_DURING_SENDKEYS_CALL"));
          this.setScreenId(response.screenId);
          this.tearDown();
          this.isScreenUpdated.next(true);
      } else {
        this.logger.error(errorResponse.message, errorResponse.error);
      }
    });
  }
  tearDown(): void {
    this.sendableFields.clear();
    this.tabAndArrowsService.tearDown();
  }
}

class RoutingHandler {
  routes: Set<string>;
  
  hasRoute(route: string): boolean {
    return this.routes.has(route);
  }
}
