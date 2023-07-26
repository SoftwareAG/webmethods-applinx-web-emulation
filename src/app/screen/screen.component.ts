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
import {  ElementRef, HostListener, OnDestroy, ViewChildren } from '@angular/core';
import { QueryList } from '@angular/core';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit, Output,
  SimpleChanges,
} from '@angular/core';
import { GXAdditionalKey, GXKeyCodes } from '../services/enum.service';
import { KeyboardMappingService } from '../services/keyboard-mapping.service';
import {NavigationService} from '../services/navigation/navigation.service';
import { TabAndArrowsService } from '../services/navigation/tab-and-arrows.service';
import {StorageService} from '../services/storage.service';
import {popup} from '../../assets/JSfunctions/scripts';
import {cancel} from '../../assets/JSfunctions/scripts';
import {GXUtils} from 'src/utils/GXUtils'
import { Field, GetScreenRequest,
  GetScreenResponse,
  HostKeyTransformation,
  ScreenService, InputField, ScreenBounds } from '@softwareag/applinx-rest-apis';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ScreenHolderService } from '../services/screen-holder.service';
import { UserExitsEventThrowerService } from '../services/user-exits-event-thrower.service';
import { NGXLogger } from 'ngx-logger';
import { MessagesService } from '../services/messages.service';
import { ScreenProcessorService } from '../services/screen-processor.service';
import { ScreenLockerService } from '../services/screen-locker.service'

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.css']
})
export class ScreenComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @HostListener('input', ['$event'])
  handleInput(event: any): void {
    const ignore = ['app-multiple-options', 'app-input-field'];
    if (ignore.includes(event.path?.[1]?.tagName?.toLowerCase()) || ignore.includes(event.path?.[3]?.tagName?.toLowerCase())) {
      return;
    } 
    const tag = event.target.tagName;
    const id = event.target.id;
    const val = event.target.value;
    if (tag?.toLowerCase() === 'input' && id?.length > 0) {
      const input = new InputField();
      input.setName(id);
      input.setValue(val);
      this.navigationService.setSendableField(input);
    }
  }

  @Input('screen') m_screen: GetScreenResponse; // The final processed screen that should be displayed
  @Input() isChildWindow = false;
  @Input() isLastChildWindow = false;
  @Input() index: number;
  @Output() hostKeysEmitter = new EventEmitter<HostKeyTransformation[]>();
  @Output() generatedPageEmitter = new EventEmitter<GetScreenResponse>();
  @ViewChildren('gridContainer') grid:  QueryList<any>;

  @Input() isGeneratedPage = false;
  hostKeyTransforms: HostKeyTransformation[] = [];
  childWindows: GetScreenResponse[] = [];
  screenWidthArray: Array<any>;

  getScreenSubscription: Subscription;
  isScreenUpdatedSubscription: Subscription;
  screenObjectUpdatedSubscription: Subscription;
  gridChangedSubscription: Subscription;
  firstFieldfocusFlag : boolean = false;

  constructor(private screenService: ScreenService, private navigationService: NavigationService,
              private storageService: StorageService, private tabAndArrowsService: TabAndArrowsService,
              private keyboardMappingService: KeyboardMappingService, private userExitsEventThrower: UserExitsEventThrowerService,
              private ref: ElementRef, private router: Router, private screenHolderService: ScreenHolderService,
              private logger: NGXLogger, private messages: MessagesService,         
              private screenProcessorService: ScreenProcessorService, private screenLockerService: ScreenLockerService ) {}
              
  ngAfterViewInit(): void {
    if (!this.isChildWindow) {
      this.gridChangedCallback();
      this.gridChangedSubscription = this.grid.changes.subscribe(() => this.gridChangedCallback());
    }
  }

  private gridChangedCallback() {
    setTimeout(() => {
      const screenArea = this.ref.nativeElement.querySelector('#gx_screenArea');
      if (screenArea) {
        const elements = screenArea.querySelectorAll('input, select');
        this.tabAndArrowsService.buildNavigationMatrix(elements, this.m_screen.screenSize, this.navigationService.getCursorPosition().position);
      }
      if (!this.isGeneratedPage) {
        setTimeout(() => this.hostKeysEmitter.emit(this.hostKeyTransforms));
        this.screenHolderService.screenInitialized.next(true);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((this.isChildWindow || this.isGeneratedPage) && this.m_screen) {
      this.onScreenInit(this.m_screen);
    }
  }

  ngOnInit(): void {
    if (!this.isChildWindow) {
      this.isScreenUpdatedSubscription = this.navigationService.isScreenUpdated.subscribe(value => {
        if (value === true) {
          this.navigationService.isScreenUpdated.next(false);
          this.getScreen();
        }
      });
    }

    this.screenObjectUpdatedSubscription = this.navigationService.screenObjectUpdated.subscribe(newScreen => {
      if (newScreen) {     
        this.navigationService.screenObjectUpdated.next(null);
        this.postGetScreen (newScreen);
        this.getRawScreenData();
      }
    });


    if (!this.isChildWindow && !this.isGeneratedPage) {
      const currentScreen: GetScreenResponse = this.screenHolderService.getRuntimeScreen();
      if (!currentScreen) {
        this.getScreen();
      } else {
        this.onScreenInit(currentScreen);
      }
    }
  }

  getScreen(): void {    
    const req = new GetScreenRequest();
    this.userExitsEventThrower.firePreGetScreen(req);
    this.getScreenSubscription = this.screenService
    .getScreen(this.storageService.getAuthToken(), req)
    .subscribe(
      screen => {
        this.postGetScreen(screen);
        this.screenHolderService.setRawScreenData(screen)   
      },    
      error => {
        this.logger.error(this.messages.get("FAILED_TO_GET_SCREEN_FROM_REST_API"));
        this.userExitsEventThrower.fireOnGetScreenError(error);
      });
  }

  getRawScreenData(): void {    
    const req = new GetScreenRequest();
    this.userExitsEventThrower.firePreGetScreen(req);
    this.getScreenSubscription = this.screenService.getScreen(this.storageService.getAuthToken(), req).subscribe(
      screen => this.screenHolderService.setRawScreenData(screen),   
      error => {
        this.logger.error(this.messages.get("FAILED_TO_GET_SCREEN_FROM_REST_API"));
        this.userExitsEventThrower.fireOnGetScreenError(error);
      });
  }

  private checkForTypeAheadChars(){
    let typeAheadStringArray = GXUtils.getTypeAheadStringArray();
    let typeAheadCharsArray = GXUtils.getTypeAheadCharsArray();
    if (typeAheadCharsArray.length>0 || typeAheadStringArray.length>0){
      let event = {};
      event["code"] = GXUtils.IMPLICITTAB;
      GXUtils.appendTypeAheadStringArray(event);
    }
  }

  private getTypeAheadFields(screen){
    return screen.fields.filter(entry => {
      // return entry.protected == false && entry.autoCursorJump == true && entry.visible == true && entry.datatype == "ALPHANUMERIC"
      if(entry){
        return entry.protected == false && entry.datatype == "ALPHANUMERIC";
      }
    }); 
  }

  private readTypeAhead(typeAheadArray, length){
    for (var i=0;i<length;i++){
      if(typeAheadArray[i].value == '[Enter]'){
        this.navigationService.setIsTypeAheadFlag(true);
        this.navigationService.sendKeys('[enter]');
      }
      typeAheadArray[i].activeFlag = false;  
    } 
  }

  private setTypeAheadFocus(screen, typeAheadArray, textFieldArray){
    let textboxArayLength = textFieldArray.length;
    let typeAheadArrayLength = typeAheadArray[0].inputFields.length-1;
    if(typeAheadArrayLength > -1){
        if (textboxArayLength > typeAheadArrayLength){
       //   console.log(">")
            screen.cursor.fieldName = textFieldArray[typeAheadArrayLength].name;
            screen.cursor.position = textFieldArray[typeAheadArrayLength].position;
        }else if (textboxArayLength == typeAheadArrayLength){
       //   console.log("=")
            screen.cursor.fieldName = textFieldArray[0].name;
            screen.cursor.position = textFieldArray[0].position;
        }else if (textboxArayLength < typeAheadArrayLength){
       //   console.log("<")
            let focusIndex = typeAheadArrayLength%textboxArayLength;
            screen.cursor.fieldName = textFieldArray[focusIndex].name;
            screen.cursor.position = textFieldArray[focusIndex].position;
        }
      }
  }

  private sortTextFieldList(textFieldArray, isTabbingRTL){
    if (isTabbingRTL){
      textFieldArray.sort((a, b) => a.position.row - b.position.row ||b.position.column - a.position.column); // RTL
    }else{
      textFieldArray.sort((a, b) => a.position.row - b.position.row ||a.position.column - b.position.column);  // LTR
    } 
  }

  private postGetScreen(screen: GetScreenResponse): void {
    this.hostKeyTransforms = [];
    this.userExitsEventThrower.firePostGetScreen(screen);
    this.screenHolderService.setRuntimeScreen(screen);
    const screenName = screen.name;
    this.logger.debug(this.messages.get("GET_SCREEN") + screenName);
    let enterFlag = false;

    if (!GXUtils.isStringEmptyWithTrim(screenName) && this.navigationService.getRoutingHandler().hasRoute(screenName))
      this.redirectToRoute(screenName);
    else if (this.isGeneratedPage && !this.screenHolderService.isCurrentScreenWindow())
      this.router.navigate(['instant']);
    else {
      this.processScreen(screen);
    }
  }

  private processScreen(screen: GetScreenResponse): void {
      if (this.screenHolderService.isCurrentScreenWindow() && !this.isChildWindow && 
           !(this.screenHolderService.getPreviousScreen().name == GXUtils.MENU && screen.name == GXUtils.UNKNOWN)) {
      this.shiftFieldsToMainWindow(screen);
      if (screen.windows.length === 1) {
        this.childWindows = [screen];
      } else {
        this.getChildWindows().push(screen);
      }
    } else {
      if (this.hasChildWindows()) this.childWindows = [];
      if (!this.isChildWindow) this.onScreenInit(screen);
    }

    if(GXUtils.ENABLETYPEAHEADFLAG){
      // Check for type ahead chars without Enter/Tab and append it to the array
      const isTabbingRTL = screen.language?.tabDirectionRTL;
      this.checkForTypeAheadChars(); 

      // Get the TypeAhead Fields
      let textFieldArray = this.getTypeAheadFields(screen); 
      let textFieldLength = textFieldArray.length;
      
      // Get the typeAhead Object array
      let typeAheadArray = GXUtils.getTypeAheadObjArray().filter(element => element.executed == false);  
     // console.log(">>>>>>>>>>>>>",GXUtils.getTypeAheadObjArray())
      let typeAheadLength = GXUtils.getTypeAheadObjArray().length
      if (typeAheadArray.length > 0){
          this.navigationService.setIsTypeAheadFlag(true);
       //   let typeAheadArrayLength = typeAheadArray[0].inputFields.length;
          if (textFieldLength == 0){
            typeAheadArray[0].executed = true;
          }else{
            this.sortTextFieldList(textFieldArray, isTabbingRTL);
          //  let typeaheadInputFields = typeAheadArray[0].inputFields;
            this.setFirstValue(screen, typeAheadArray, textFieldArray);
            typeAheadArray[0].executed = true;
            this.setTypeAheadFocus(screen, typeAheadArray, textFieldArray)
          }
         if (typeAheadArray[0]["objOrder"] < typeAheadLength){
            // Logic to navigae to next page....
            this.navigationService.sendKeys('[enter]'); 
          }
      }
      // else{
      //   console.log ("Page Load complete ->->->->->->->->->->->->")
      // }
    } 
  }

  private setFirstValue(screen, typeAheadArray, textFieldArray){
    // console.log("screen:",JSON.stringify(screen));
    // console.log("typeAheadArray:", JSON.stringify(typeAheadArray));
    // console.log("textFieldArray:",JSON.stringify(textFieldArray));
    let indexCount = 0;
    let textFieldCount = textFieldArray.length;
    let typeAheadCount = typeAheadArray[0].inputFields.length;
    let typeAheadObjArray = [];
    let maxIndex = textFieldCount-1;
    let currentIndex = 0;
    let firstFieldFlag = false;
    let firstTypeAheadObj = typeAheadArray[0].inputFields.filter(element => element.active==true)[0];
      if(firstTypeAheadObj && screen.cursor.fieldName && !firstFieldFlag){
        currentIndex = textFieldArray.findIndex(element => element.name == screen.cursor.fieldName);
        textFieldArray[currentIndex].content = firstTypeAheadObj.value; 
        firstFieldFlag = true;
        firstTypeAheadObj.active = false;
      }
    do{
      typeAheadObjArray = typeAheadArray[0].inputFields.filter(element => element.active==true);
      if (typeAheadObjArray.length>0){
          if(currentIndex < maxIndex){
            currentIndex++;
          }else if(currentIndex == maxIndex){
            currentIndex = 0;
          }
          textFieldArray[currentIndex].content = typeAheadObjArray[0].value;
          typeAheadObjArray[0].active = false;
          indexCount++;
      }
    }while (indexCount < typeAheadCount-1)
  }

  private redirectToRoute(screenName: string): void {
    if (this.screenHolderService.isCurrentScreenWindow()) {
      /**
       * This is a workaround, when getting to generated page window we should send
       * another getScreen request with the 'GX_VAR_HOST_WINDOW_ENABLED' baseObjectConstant
       * set to 'true'.
       */    
      const req = new GetScreenRequest();
      req.options.GX_VAR_HOST_WINDOW_ENABLED = 'true';
      this.screenService
       .getScreen(this.storageService.getAuthToken(), req)
       .subscribe(
         screen => this.screenHolderService.setRuntimeScreen(screen),
         error => this.logger.error(error),
         () => this.redirect(screenName));
    } else {
      this.redirect(screenName);
    }
  }

  private redirect(screenName: string): void {
    if (GXUtils.removeSlash(this.router.url) === screenName) {
      this.navigationService.redirectToSamePath(screenName);
    } else {
      this.router.navigate([screenName]);
    }
  }

  onScreenInit(screen: GetScreenResponse): void {
    screen = screen || this.screenHolderService.getRuntimeScreen();
    this.keyboardMappingService.clearJSKeyboardMappings();//JSKeyboardMapping have to be clean for each page.
    screen.transformations.forEach((transform) => {
      if (transform.type.startsWith('HostKey'))
        this.hostKeyTransforms.push(transform);
      else if (transform.type.startsWith('Table')) 
        this.screenProcessorService.processTable(screen.fields, screen.transformations || [], transform);
    });
    this.screenWidthArray = new Array(screen.screenSize.columns);
    this.storageService.setLanguage(screen.language);
    this.navigationService.setScreenId(screen.screenId);
    this.navigationService.setScreenSize(screen.screenSize);
    this.navigationService.setCursorPosition(screen.cursor);
    screen.fields = this.screenProcessorService.processRegionsToHide(screen.fields, screen.transformations);
    this.m_screen = screen;
    this.screenLockerService.setLocked(false);
    //Example of injecting keyboard mapping
    // this.keyboardMappingService.addKeyboardMapping(GXAdditionalKey.NONE, GXKeyCodes.F3, popup, true, cancel);
  }

  /**
   * Find fields (like messageLine) which are out of child-window bounds. their position is in main screen.
   * Shift these fields to the main screen.
  **/
   private shiftFieldsToMainWindow(screen: GetScreenResponse): void {
    const lastWindowIndex = screen.windows.length - 1;
    const windowBounds = screen.windows[lastWindowIndex].bounds;
    const mainScreenFields = new Map<string, number>();
    const currentWindowName = screen.name;
    this.m_screen.fields = this.m_screen.fields.filter(f => f);
    this.m_screen.fields.forEach((fld, i) => mainScreenFields.set(this.fieldToString(fld), i));

    // NEED TO FIX TABLE ITEMS POSITION AND MAYBE OTHER TRANSFORMATIONS
    screen.fields.forEach((field, i, fields) => {
      if (this.isFieldOutOfBounds(field, windowBounds)) {
            const index = mainScreenFields.get(this.fieldToString(field));
            if (!isNaN(index)) {
              this.m_screen.fields[index] = null;
            }
            this.m_screen.fields.push(field);
            fields[i] = null;
      } else {
        const fld = fields[i];
        fld.positionInWindow = {row: fld.position.row - windowBounds.startRow + 1,  
                                column: fld.position.column - windowBounds.startCol + 1};
      }
    });
    if (currentWindowName != GXUtils.nationalityWin) {
          screen.transformations.forEach((transform) => {
            if(transform.position){    
                transform.position = {row: transform.position.row - windowBounds.startRow + 1, 
                                      column: transform.position.column - windowBounds.startCol +1};
            }  
            transform.regionsToHide?.forEach(region => {
              region.topLeft.row = 0;
              region.topLeft.column = 0;
              region.bottomRight.row = 0;
              region.bottomRight.column = 0;
              transform.regionsToHide.push(region);
        });
        });
}
   }
  
  private isFieldOutOfBounds(field: Field, bounds: ScreenBounds): boolean {
    return field.position.row < bounds.startRow || 
            field.position.row > bounds.endRow || 
            field.position.column < bounds.startCol ||  
           (field.position.column+field.length > bounds.endCol+1)
  }

  getChildWindows(): GetScreenResponse[] {
    if (!this.childWindows) {
      this.childWindows = [];
    }
    return this.childWindows;
  }

  hasChildWindows(): boolean {
    return (this.childWindows && this.childWindows.length > 0);
  }
  
  get titlePosition() {
    const template = {
      'grid-row': '1 / 1', 
    }
    template['grid-column-start'] = Math.round(this.m_screen.windows[this.index].bounds.cols/2 - this.m_screen.windows[this.index].title.length/2);
    template['grid-column-end'] = Math.round(this.m_screen.windows[this.index].bounds.cols/2 - this.m_screen.windows[this.index].title.length/2 + this.m_screen.windows[this.index].title.length);
    return template;
  }

  public set screen(screen: GetScreenResponse) {
    if (screen == null || screen == undefined) {
      console.error(`Cannot set screen value of ${screen}`);
      return;
    }
    this.m_screen = screen;
  }

  private fieldToString(fld: Field): string {
    return fld.position.row + ',' + fld.position.column
  }

  ngOnDestroy(): void {
    if (this.getScreenSubscription) {
      this.getScreenSubscription.unsubscribe();
    }
    if (this.isScreenUpdatedSubscription) {
      this.isScreenUpdatedSubscription.unsubscribe();
    }
    if (this.screenObjectUpdatedSubscription) {
      this.screenObjectUpdatedSubscription.unsubscribe();
    }

    if (this.gridChangedSubscription) {
      this.gridChangedSubscription.unsubscribe();
    }
    if (this.navigationService.getScreenId()) {
      clearInterval(this.navigationService.getScreenId())
    }
    if (!this.isChildWindow) this.hostKeysEmitter.emit(null);
  }

}
