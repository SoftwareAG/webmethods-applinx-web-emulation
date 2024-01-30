/*
 * Copyright 2023 Software AG
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
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from './services/navigation/navigation.service';
import { StorageService } from './services/storage.service';
import { WebLoginComponent } from './webLogin/webLogin.component';
import { GridPosition, TabAndArrowsService } from './services/navigation/tab-and-arrows.service';
import { ScreenLockerService } from './services/screen-locker.service';
import { KeyboardMappingService } from './services/keyboard-mapping.service';
import { range, Subscription } from 'rxjs';
import { ScreenHolderService } from './services/screen-holder.service';
import { ScreenComponent } from './screen/screen.component';
import { GXGeneratedPage } from './generated-pages/GXGeneratedPage';
import { LoggerConfig, NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { LifecycleUserExits } from './user-exits/LifecycleUserExits';
import { UserExitsEventThrowerService } from './services/user-exits-event-thrower.service';
import { OAuth2HandlerService } from './services/oauth2-handler.service';
import { MessagesService } from './services/messages.service';
import { HostKeyTransformation, Cursor, SessionService, InfoService, MacroService } from '@softwareag/applinx-rest-apis';
import { MatDialog } from '@angular/material/dialog';
import { ModalpopupComponent } from './mini-components/transformations/modalpopup/modalpopup.component';
import { GXUtils } from 'src/utils/GXUtils';
import { MacroComponent } from './macro/macro.component';
import { SharedService } from './services/shared.service';
import { ConfigurationService } from './services/configuration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  static readonly MAX_SMALL_SCREEN_WIDTH = 812;
  static readonly LOGGER_ELEMENT = 'logger';
  readonly title = 'ApplinX-Framework';

  hostKeyTransforms: HostKeyTransformation[];
  loginComponent: WebLoginComponent;
  displayScreen = false;
  hostKeysBool: boolean = false;
  showHostKeyFlag : boolean = GXUtils.showHostKeyFlag;
  errorMessage: string;

  disconnectSubscription: Subscription;
  hostKeysEmitterSubscription: Subscription;
  screenInitializedSubscription: Subscription;
  hostConnectionSubscription: Subscription;
  themeColors: string[] = GXUtils.themeColorsList;
  themecolorConfig: any = GXUtils.themecolorConfig;
  zoomDefault: number;
  zoomMinValue: number = GXUtils.zoomMinValue;
  zoomMaxValue: number = GXUtils.zoomMaxValue;
  zoomStep: number = GXUtils.zoomStep;
  isOpenThemeStyle: boolean = false;
  themeColor: string = GXUtils.defaultThemeColor;
  macroButtonCol: string
  recMacroTitle: any;
  changeRecColor: boolean = false;
  recordStop: boolean = false;
  macroEvents = GXUtils.MACRO;
  macroFileListSubscription: Subscription;
  macroList: any;
  listFlag: any;
  // popupFlag : boolean = false;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if(!this.sharedService.getPopUpFlag()){
      if (this.screenLockerService.isLocked()) {
        return; // windows is loading...
      }
      if (!this.keyboardMappingService.checkKeyboardMappings(event, true, event.keyCode)) {
        event.preventDefault();
      }
      if (event.key === 'Enter' && !this.storageService.isConnected()) {
        this.loginComponent.onConnect();
        event.preventDefault();
      } else if (this.storageService.isConnected() && this.tabAndArrowsService.handleArrows(event)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('focusin', ['$event'])
  handleFocus(event: any): void {
    // For generated pages which users might add custom input elements.
    // Handle focus for non-ApplinX HTML 'input' and 'select' elements.
    // ApplinX's app-input-field component has his own focus handling. 
    const ignore = ['app-multiple-options', 'app-input-field'];
    if (ignore.includes(event.path?.[1]?.tagName?.toLowerCase()) || ignore.includes(event.path?.[3]?.tagName?.toLowerCase())) {
      return;
    }
    const tag = event.target.tagName;
    const id = event.target.id;
    const tags = ['input', 'select'];
    if (tags.includes(tag?.toLowerCase())) {
      const gp = new GridPosition(event.target);
      const pos = { row: gp.rowStart, column: gp.colStart };
      this.navigationService.setCursorPosition(new Cursor(pos, id));
    }
  }

  @HostListener('window:beforeunload')
  onBrowserClose(): void {
    if (!this.oAuth2handler.isRedirectToIDP) {
      this.logout();
    }
  }

  constructor(private sessionService: SessionService, private navigationService: NavigationService,
    public storageService: StorageService, private tabAndArrowsService: TabAndArrowsService,
    private keyboardMappingService: KeyboardMappingService, public screenLockerService: ScreenLockerService,
    private screenHolderService: ScreenHolderService, private userExitsEventThrower: UserExitsEventThrowerService,
    private logger: NGXLogger, private httpClient: HttpClient, private messages: MessagesService,
    private oAuth2handler: OAuth2HandlerService, private matDialog: MatDialog,
    private sharedService: SharedService, private configurationService: ConfigurationService,
    private infoService: InfoService,private macroService: MacroService,) {
    this.userExitsEventThrower.clearEventListeners();
    this.userExitsEventThrower.addEventListener(new LifecycleUserExits(infoService, navigationService, storageService, keyboardMappingService, logger));
    this.getLoggerConfiguration();
    if (window.innerWidth <= 992) {
      this.zoomDefault = 10;
    } else if (window.innerWidth >= 992 && window.innerWidth <= 1200) {
      this.zoomDefault = 12;

    } else if (window.innerWidth > 1200 && window.innerWidth <= 1400) {
      this.zoomDefault = 14;

    }
    else if (window.innerWidth > 1400 && window.innerWidth <= 1800) {
      this.zoomDefault = 17;

    } else if (window.innerWidth > 1800) {
      this.zoomDefault = 20;
    }

    this.sharedService.data$.subscribe(data => {
      // Handle the data received from the modal component
      this.changeRecColor = data !== '' && data !== null ? true : false;
    });

    let macTitle = this.sharedService;
    this.recMacroTitle = macTitle.getRecMacroTitle;
    document.documentElement.style.setProperty('--text-font-size', this.zoomDefault + 'px');
  }

  getLoggerConfiguration() {
    const jsonDefault: LoggerConfig = this.logger.getConfigSnapshot();
    this.httpClient.get<LoggerConfig>('./assets/config/sessionConfig.json').subscribe(data => {
      let json = data[AppComponent.LOGGER_ELEMENT];
      let jsonKeys: any[] = Object.keys(jsonDefault);
      jsonKeys.forEach(element => {
        if (json[element] === undefined) {
          json[element] = jsonDefault[element];
        }
      });
      this.logger.updateConfig(json);
    });
  }

  ngOnInit(): void {
    this.changeBackgroundColor(this.themeColor);
    this.logger.debug(this.messages.get("INITIALIZING_WEB_APPLICATION"));
    this.screenInitializedSubscription = this.screenHolderService.screenInitialized.subscribe(initialized => {
      if (initialized) {
        setTimeout(() => {
          this.displayScreen = true;
          this.screenLockerService.setLocked(false);
          this.userExitsEventThrower.fireAfterViewInit();
        });
      }
    });
    this.hostConnectionSubscription = this.navigationService.isConnectedtoHost.subscribe(hostConnection => {
      if (!hostConnection) {
        this.errorMessage = this.navigationService.errorMessage;
        this.showDisconnectionMessage();
      }
    })

  }
  public range: number = 1;

  zoom1 = false;
  zoom() {

    this.zoom1 = !this.zoom1;
  }


  showDisconnectionMessage(): void {
    const targetModal = document.getElementById('readonly_modal');
    targetModal.classList.add('dlt-modal-window__open');
  }

  reconnect(): void {
    const targetModal = document.getElementById('readonly_modal');
    targetModal.classList.remove('dlt-modal-window__open')
    this.storageService.setNotConnected();
    this.clearMacroDetails();
    this.matDialog.closeAll();
  }

  reload(): void {
    this.navigationService.isScreenUpdated.next(true);
  }

  logout(): void {
    if (!this.storageService.isConnected()) {
      return;
    }
    this.clearMacroDetails();
    this.userExitsEventThrower.firePreDisconnect();
    this.disconnectSubscription = this.sessionService.disconnect(this.storageService.getAuthToken())
      .subscribe(
        res => this.userExitsEventThrower.firePostDisconnect(res),
        error => this.userExitsEventThrower.fireOnDisconnectError(error)
      );
    this.disconnectSubscription.add(() => this.storageService.setNotConnected())
  }

  clearMacroDetails(){
    this.changeRecColor = false;
    this.recordStop = false; 
    this.sharedService.setMacroRecordFlag(false);
    this.sharedService.clearMacroObj();
  }

  print() {
    GXUtils.setCopyFlag(false);
    this.getScreenData(true);
  }

  copy() {
    GXUtils.setCopyFlag(true);
    this.getScreenData(false);
  }
  
    generateObjectArray(values, objArray) {
    values.forEach(element => {
        let obj = {};
        obj["row"] = element?element.position.row:"";
        obj["col"] = element?element.position.column:"";
        obj["size"] = element?element.length:"";
        obj["data"]= element?element.content:"";
        obj["protected"] = element?element.protected:"";
        if (!element.visible){
          let strLen = element.content.length;
          obj["data"]= new Array(strLen).join(' ') 
        }else{
          obj["data"]= element?element.content:"";
        }
        obj["visible"] = element ? element.visible : "";
        objArray.push(obj);
    });
      }
	  
      formatTranformationOfPopupLines(windowDetails, objArray){
        let windowCount = windowDetails.length;
        let winStartRow = windowDetails[windowCount-1].bounds.startRow;
        let winEndRow = windowDetails[windowCount-1].bounds.endRow;
        let winStartCol = windowDetails[windowCount-1].bounds.startCol;
        let nonPopupLines = objArray.filter(element => element.row < winStartRow || element.row > winEndRow);
        let maxColEntry : any;
        // get lines Matching Header lines
        for (let i=0;i<windowDetails.length-1;i++){
          let temp = nonPopupLines.filter(element => windowDetails[i].bounds.startRow == element.row 
              && windowDetails[i].bounds.startCol >= element.col 
              && windowDetails[i].bounds.startCol <= element.col + element.size);
          if(temp.length > 0){
            let position = Math.floor(temp[0].data.length/2)
            temp[0].data = new Array(position).join(' ')+windowDetails[i].title;
          }
        }
        let windowLines = objArray.filter(element => element.row >= winStartRow  && element.row <= winEndRow
                && element.col < winStartCol )
        while (winStartRow <= winEndRow){
          let rowLines = windowLines.filter(entry => entry.row == winStartRow);
          if(rowLines.length>0){
            maxColEntry = rowLines.reduce((maxCol, selectedCol ) =>{
              return selectedCol.col > maxCol.col? selectedCol: maxCol;
            })
            let headerStrlength = winStartCol - maxColEntry.col;
            maxColEntry.data = maxColEntry.data.slice(0,headerStrlength);
          }
          winStartRow++;
        }
      }
      
      formatTransformationOfWindows(windowDetails, objArray){
        this.formatTranformationOfPopupLines(windowDetails, objArray);
        let windowCount = windowDetails.length;
        let endcol = windowDetails[windowCount-1].bounds.startCol;
        windowDetails.forEach(windowData => {
          let obj = objArray.filter(entry => entry.row == windowData.bounds.startRow && 
              (entry.col > windowData.bounds.startCol));
              if (obj.length>0){
                if(windowData.index == windowCount - 1){
                  obj[0].data =  windowData.title;
                }else{
                  let headerStrlength = endcol - obj[0].col;
                  obj[0].data =  windowData.title.slice(0,headerStrlength);
                }
                let paddingLength = Math.ceil(((windowData.bounds.endCol-windowData.bounds.startCol) 
                                                  - (windowData.title?windowData.title.length:0))/2)
                obj[0].col =  windowData.bounds.startCol+paddingLength;
            }
        });
      }
	 
      formatTransformation(values, objArray) {
        values.forEach(element => {
          if (element.type == 'HostKeyTransformation' && this.showHostKeyFlag) {
            let hostKeyList = element.hostKeys
            hostKeyList.forEach(hostKeyElement => {
              let actionObj = {};
              let displayObj = {};
              actionObj["row"] = hostKeyElement.actionPosition.row;
              actionObj["col"] = hostKeyElement.actionPosition.column;
              actionObj["data"] = hostKeyElement.action;
              objArray.push(actionObj);
              displayObj["row"] = hostKeyElement.displayPosition.row;
              displayObj["col"] = hostKeyElement.displayPosition.column;
              displayObj["data"] = hostKeyElement.displayText;
              objArray.push(displayObj);
            });
          } else if (element.type == "TextTransformation") {
            let displayObj = {};
            displayObj["row"] = element.position.row;
            displayObj["col"] = element.position.column;
            displayObj["data"] = element.text;
            objArray.push(displayObj);
          } else if (element.type == "LineTransformation") {
            let displayObj = {};
            displayObj["row"] = element.caption.position.row;
            displayObj["col"] = element.caption.position.column;
            displayObj["data"] = element.caption.text;
            objArray.push(displayObj);
          } else if (element.type == "MultipleOptionsTransformation") {
            let displayObj = {};
            displayObj["row"] = element.field.position.row;
            displayObj["col"] = element.field.position.column;
            displayObj["data"] = element.field.content;
            objArray.push(displayObj);
          }else if (element.type == "MenuTransformation"){
            let menuList = element.items;
            menuList.forEach(menuItem => {
              let displayObj = {}; 
              displayObj["row"] = menuItem.textPosition.row;
              displayObj["col"] = menuItem.textPosition.column;
              displayObj["data"] = menuItem.text;
              objArray.push(displayObj);
            });
          }
        });
      }

    getScreenData(printFlag) {
    let rawData = this.screenHolderService.getRawScreenData();
    let objArray = [];
    let formattedArray = [];
    let maxLine = 0;
    this.generateObjectArray(rawData.fields, objArray);
    this.formatTransformation(rawData.transformations, objArray);
    if (rawData && rawData.windows){
      this.formatTransformationOfWindows(rawData.windows, objArray);
      // this.drawBorderForPopUp(rawData.windows, objArray)
    }
    console.log(objArray);
    let lineNo = 0;
    objArray.sort((a, b) => {
      return a.row - b.row;
        });
    maxLine = objArray[objArray.length-1].row+1;
    do{
      let lineDetails = objArray.filter(item => item.row == lineNo);
      let temp = this.formatLineText(lineDetails);
      formattedArray.push(temp);
      lineNo++
    } while (lineNo < maxLine);
    if(!printFlag){
      this.formatCopyPage(formattedArray,printFlag);
    }else{
      this.formatPrintPage(formattedArray);
    }
  }
  
  formatPrintPage(formattedArray){
      let printDetails = formattedArray;
      let height = window.screen.availHeight-400;
      let width = window.screen.availWidth-750;
      const popupWindow = window.open('','',`height=${height},width=${width},top=${height/2},left=${width/2}`);
      popupWindow.document.open();
      popupWindow.document.write('<div class="copyWrapper crosshair" style="white-space: pre !important;"><pre>');
      printDetails.forEach(element => {
        popupWindow.document.write("<div>"+element +"</div>");
      })
      popupWindow.document.write('</pre></div>')
      popupWindow.print();
      popupWindow.close();
  }

    formatCopyPage(formattedArray,printFlag){
      let divElement = document.createElement("div");
      let lineIdentifier = 0;
      formattedArray.forEach(element =>{
        let paraElement = document.createElement("span");
        paraElement.innerText = element;
        paraElement.id = "gx_text";
        paraElement.tabIndex = lineIdentifier++;
        divElement.appendChild(paraElement);
        let lineBreakElement = document.createElement("br");
        divElement.appendChild(lineBreakElement);  
        divElement.tabIndex = lineIdentifier++;
      });
      const dialogRef = this.matDialog.open(ModalpopupComponent, {
        data: {
          content: divElement.innerHTML,
          typeFlag: printFlag
        }, height: '100%',
        width: '90%',
      });
      this.sharedService.setPopUpFlag(true);
      dialogRef.afterClosed().subscribe(result => {
        this.sharedService.setPopUpFlag(false);
      });
  }

  formatLineText(lineDetails) {
    let stringMaster = "                                                                                ";
    lineDetails.forEach(entry => {
      if (entry.data) {
        stringMaster = GXUtils.replaceString(stringMaster, entry.col, entry.data);
      }

    })
    return stringMaster;
  }

  setHostKeys(hostkeys: HostKeyTransformation[]): void {
    this.hostKeyTransforms = hostkeys;
    if(hostkeys !== null) {
      if(hostkeys[0]?.hostKeys?.length>12) {
        this.hostKeysBool = true;
      }
    }
  }

  onActivate(component) {
    if (component instanceof ScreenComponent || component instanceof GXGeneratedPage) {
      if (this.hostKeysEmitterSubscription) {
        this.hostKeysEmitterSubscription.unsubscribe();
      }
      this.hostKeysEmitterSubscription = component.hostKeysEmitter.subscribe(e => this.setHostKeys(e));
    }
    if (component instanceof ScreenComponent) {
      this.userExitsEventThrower.clearEventListeners();
      this.userExitsEventThrower.addEventListener(new LifecycleUserExits(this.infoService, this.navigationService, this.storageService, this.keyboardMappingService, this.logger));
    } else if (component instanceof WebLoginComponent) {
      this.loginComponent = component;
      this.changeBackgroundColor('White');
    }
  }

  onDeactivate() {
    this.displayScreen = false;
  }

  isSmallScreen(): boolean {
    return screen.width <= AppComponent.MAX_SMALL_SCREEN_WIDTH && window.innerHeight < window.innerWidth;
  }

  formatLabel(value: number): string {
    return `${value + 'px'}`;
  }

  changeTheme() {
    this.isOpenThemeStyle = !this.isOpenThemeStyle;
  }

  onZoomChange(value: number) {
    if (this.zoomDefault !== value) {
      this.zoomDefault = value;
      document.documentElement.style.setProperty('--text-font-size', this.zoomDefault + 'px');
    }
  }


  ngOnDestroy(): void {
    if (this.disconnectSubscription) {
      this.disconnectSubscription.unsubscribe();
    }
    if (this.hostKeysEmitterSubscription) {
      this.hostKeysEmitterSubscription.unsubscribe();
    }
    if (this.screenInitializedSubscription) {
      this.screenInitializedSubscription.unsubscribe();
    }
    if (this.hostConnectionSubscription) {
      this.hostConnectionSubscription.unsubscribe();
    }
  }

 macro(){
    this.recordStop = this.sharedService.getMacroRecordFlag();
  }

  openMacro(paramType: string) {
    let viewFlag = this.listFlag;
    const dialogRef = this.matDialog.open(MacroComponent,
      {
        data: {paramType, viewFlag},
        height: 'auto',
        width: '40%',
      });
      this.sharedService.setPopUpFlag(true);
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      this.sharedService.setPopUpFlag(false);
      this.changeRecColor = this.sharedService.getMacroRecordFlag(); // Changing the color of macro icon when it is in record mode
    });
  }

  stopRecord() {
    this.sharedService.setMacroRecordFlag(false);
    this.sharedService.stopMacroRecording(this.configurationService.applicationName);
    this.changeRecColor = this.sharedService.getMacroRecordFlag();
  }

  changeBackgroundColor(color: string) {
    this.themeColor = color;
    this.isOpenThemeStyle = false;
    document.documentElement.style.setProperty('--color-theme', this.themeColor.toLocaleLowerCase() === 'green' ? 'lime' : this.themeColor.toLocaleLowerCase());
    document.documentElement.style.setProperty('--bs-body-bg', this.themecolorConfig[color]['bg-color']);
    document.documentElement.style.setProperty('--primary-color', this.themecolorConfig[color]['bg-color']);
    document.documentElement.style.setProperty('--input-text-bg-color', this.themecolorConfig[color]['input-text-bg-color']);
    document.documentElement.style.setProperty('--input-text-border-bottom', this.themecolorConfig[color]['input-text-border-bottom']);
    document.documentElement.style.setProperty('--primary-text-color', this.themecolorConfig[color]['text-color']);
    document.documentElement.style.setProperty('--screen-btn-color', this.themecolorConfig[color]['screen-btn-color']);
    document.documentElement.style.setProperty('--screen-btn-text-color', this.themecolorConfig[color]['screen-btn-text-color']);
    document.documentElement.style.setProperty('--btn-regular-color', this.themecolorConfig[color]['btn-regular-color']);
    document.documentElement.style.setProperty('--btn-outline-color', this.themecolorConfig[color]['btn-outline-color']);
    document.documentElement.style.setProperty('--btn-hover-color-screen', this.themecolorConfig[color]['btn-hover-color-screen']);
    document.documentElement.style.setProperty('--btn-hover-color', this.themecolorConfig[color]['btn-hover-color']);
    document.documentElement.style.setProperty('--enter-btn-hover-color', this.themecolorConfig[color]['enter-btn-hover-color']);
    document.documentElement.style.setProperty('--enter-btn-text-hover-color', this.themecolorConfig[color]['enter-btn-text-hover-color']);
    document.documentElement.style.setProperty('--input-table-text', this.themecolorConfig[color]['input-text']);
    document.documentElement.style.setProperty('--input-table-text-pw', this.themecolorConfig[color]['input-text-pw']);
    document.documentElement.style.setProperty('--login-screen-color', this.themecolorConfig[color]['login-screen-color']);
    document.documentElement.style.setProperty('--menu-content-color', this.themecolorConfig[color]['menu-content-color']);
    document.documentElement.style.setProperty('--table-header-background', this.themecolorConfig[color]['table-header-background']);
    document.documentElement.style.setProperty('--table-header-border-color-left', this.themecolorConfig[color]['table-header-border-color-left']);
    document.documentElement.style.setProperty('--table-header-border-color-right', this.themecolorConfig[color]['table-header-border-color-right']);
    document.documentElement.style.setProperty('--table-header-border-color-top', this.themecolorConfig[color]['table-header-border-color-top']);
    document.documentElement.style.setProperty('--table-header-border-color-botton', this.themecolorConfig[color]['table-header-border-color-botton']);
    document.documentElement.style.setProperty('--table-header-text-color', this.themecolorConfig[color]['table-header-text-color']);
    document.documentElement.style.setProperty('--table-body-border-color', this.themecolorConfig[color]['table-body-border-color']);
    document.documentElement.style.setProperty('--table-body-alternating1', this.themecolorConfig[color]['table-body-alternating1']);
    document.documentElement.style.setProperty('--table-body-alternating2', this.themecolorConfig[color]['table-body-alternating2']);
    document.documentElement.style.setProperty('--table-body-text-color', this.themecolorConfig[color]['table-body-text-color']);
    document.documentElement.style.setProperty('--table-body-select-border-color', this.themecolorConfig[color]['table-body-select-border-color']);
    document.documentElement.style.setProperty('--table-body-select-background-color', this.themecolorConfig[color]['table-body-select-background-color']);
    document.documentElement.style.setProperty('--table-body-select-color', this.themecolorConfig[color]['table-body-select-color']);
    document.documentElement.style.setProperty('--table-text-shadow', this.themecolorConfig[color]['table-text-shadow']);
    document.documentElement.style.setProperty('--input-bottom-border-gx-lgrn', this.themecolorConfig[color]['input-bottom-border-gx-lgrn']);
    document.documentElement.style.setProperty('--cross-text-color', this.themecolorConfig[color]['cross-text-color']);
    document.documentElement.style.setProperty('--gx-line', this.themecolorConfig[color]['gx-line']);
    document.documentElement.style.setProperty('--gx-blwt-text-color', this.themecolorConfig[color]['gx-blwt-text-color']);
    document.documentElement.style.setProperty('--gx-lbl', this.themecolorConfig[color]['gx-lbl']);
    document.documentElement.style.setProperty('--gx-lgrn', this.themecolorConfig[color]['gx-lgrn']);
    document.documentElement.style.setProperty('--gx-lrd', this.themecolorConfig[color]['gx-lrd']);
    document.documentElement.style.setProperty('--gx-blbl', this.themecolorConfig[color]['gx-blbl']);
    document.documentElement.style.setProperty('--gx-blbl-text-color', this.themecolorConfig[color]['gx-blbl-text-color']);
    document.documentElement.style.setProperty('--gx-blrd', this.themecolorConfig[color]['gx-blrd']);
    document.documentElement.style.setProperty('--gx-lppl', this.themecolorConfig[color]['gx-lppl']);
    document.documentElement.style.setProperty('--gx-laq', this.themecolorConfig[color]['gx-laq']);
    document.documentElement.style.setProperty('--gx-ylw', this.themecolorConfig[color]['gx-ylw']);
    document.documentElement.style.setProperty('--gx-blgrn', this.themecolorConfig[color]['gx-blgrn']);
    document.documentElement.style.setProperty('--gx-blgrn-text-color', this.themecolorConfig[color]['gx-blgrn-text-color']);
    document.documentElement.style.setProperty('--gx-blaq', this.themecolorConfig[color]['gx-blaq']);
    document.documentElement.style.setProperty('--gx-blaq-text-color', this.themecolorConfig[color]['gx-blaq-text-color']);
    document.documentElement.style.setProperty('--gx-bylw', this.themecolorConfig[color]['gx-bylw']);
    document.documentElement.style.setProperty('--gx-bylw-text-color', this.themecolorConfig[color]['gx-bylw-text-color']);
    document.documentElement.style.setProperty('--gx-intf', this.themecolorConfig[color]['gx-intf']);
    document.documentElement.style.setProperty('--text-shadow-gx-lrd-intf', this.themecolorConfig[color]['text-shadow-gx-lrd-intf']);
    document.documentElement.style.setProperty('--text-shadow-gx-lwt-gx-intf', this.themecolorConfig[color]['text-shadow-gx-lwt-gx-intf']);

    //this is for delite button hover
    // document.documentElement.style.setProperty('--dlt-color-interactive-primary-hover', this.themecolorConfig[color]['btn-hover-color']);
  }

  setDefaultZoom() {
    if (window.innerWidth <= 992) {
      this.zoomDefault = 10;
    } else if (window.innerWidth >= 992 && window.innerWidth <= 1200) {
      this.zoomDefault = 12;

    } else if (window.innerWidth > 1200 && window.innerWidth <= 1400) {
      this.zoomDefault = 14;

    }
    else if (window.innerWidth > 1400 && window.innerWidth <= 1800) {
      this.zoomDefault = 17;

    } else if (window.innerWidth > 1800) {
      this.zoomDefault = 20;
    }
    document.documentElement.style.setProperty('--text-font-size', this.zoomDefault + 'px');
  }

  getColor(color: string): string {
    if (color === 'Green') {
      color = 'lime'
    }
    return color.toLowerCase();
  }

}




