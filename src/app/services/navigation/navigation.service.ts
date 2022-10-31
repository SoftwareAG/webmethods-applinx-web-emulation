import {Injectable} from '@angular/core';
import { GXUtils } from 'src/utils/GXUtils'
import {BehaviorSubject} from 'rxjs';
import { ScreenLockerService } from '../screen-locker.service';
import { Router } from '@angular/router';
import { UserExitsEventThrowerService } from '../user-exits-event-thrower.service';
import { NGXLogger } from 'ngx-logger';
import { HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { MessagesService } from '../messages.service';
import { Position, Size, InputField, Cursor, ScreenService, InfoService, SendKeysRequest, GetInfoResponse, GetScreenResponse, ReturnScreen } from '@softwareag/applinx-rest-apis';
import { TabAndArrowsService } from './tab-and-arrows.service';
import { StatusCodes } from 'http-status-codes';
import { GXConst } from '../enum.service';


@Injectable({
  providedIn: 'root'
})
export class NavigationService {
 
  errorMessage: string;
  isAutoLogin: boolean;
  authMethod: string;
  private routingHandler: RoutingHandler;
  private screenId: number;
  private screenSize: Size;
  private sendableFields: Map<string, InputField>;
  private cursorPosition: Cursor;
  isConnectedtoHost: BehaviorSubject<boolean> = new BehaviorSubject(true); // if false - shows disconnection message or redirects to login page
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
    this.getAuthMethod();
  }

  setIsAutoLogin (isAutoLogin:boolean): void {
    this.isAutoLogin = isAutoLogin;
  }

  sendKeys(sendKey: string): void {
    if (this.screenLockerService.isLocked()) {
      return; // windows is loading...
    }
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
    }, errorResponse => {
      this.logger.error(errorResponse.error.message);
      if (errorResponse.status === StatusCodes.GONE || errorResponse.error.message.indexOf("Disconnected by host") > -1
      || errorResponse.error.message.indexOf("Session was disconnected by Host") > -1
      || errorResponse.error.message.indexOf("Not connected to Server (Software caused connection abort: recv failed)") > -1
      ) {
        console.log(errorResponse.error.message);
        if ((this.isAuthDisabled() && this.isAutoLogin) ) { // show disconnect message
          this.errorMessage = 'The session has been disconnected from the host.';          
          this.isConnectedtoHost.next(false);
        }
        else { // redirect to webLogin
          this.storageService.setNotConnected();
        }
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

  getAuthMethod(): void {
    this.infoService.getInfo().subscribe((response: GetInfoResponse) => {
        this.authMethod = response.auth;
    });
  }

  isAuthDisabled (): boolean {
    return (this.authMethod == GXConst.DISABLED);
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
