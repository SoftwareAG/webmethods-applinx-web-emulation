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
import { Component, HostListener, OnDestroy, OnInit} from '@angular/core';
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
import { HostKeyTransformation, Cursor, SessionService, InfoService } from '@softwareag/applinx-rest-apis';
import { MatDialog } from '@angular/material/dialog';
import { ModalpopupComponent } from './mini-components/transformations/modalpopup/modalpopup.component';
import { GXUtils } from 'src/utils/GXUtils';

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

  errorMessage: string;

  disconnectSubscription: Subscription;
  hostKeysEmitterSubscription: Subscription;
  screenInitializedSubscription: Subscription;
  hostConnectionSubscription: Subscription;
  themeColors: string[] = ['black', 'white', 'green'];
  themecolorConfig: any = {
    'black' : {
      'bg-color' : 'black',
      'text-color' : 'white',
      'input-text-pw': '#ff0000',
      'input-text': '#00ff00',
      'btn-color' : '#B3B2B2',
      'btn-hover-color' : '#E57200',
      'login-screen-color': '#59b0ca',
      'menu-content-color': 'white',
      'table-header-background': '#006992',
      'table-header-border-color': '#042237',
      'table-header-text-color': 'white',
      'table-body-border-color':'#042237',
      'table-body-alternating1': '#042237',
      'table-body-alternating2': 'black' ,
      'table-body-text-color': '#59b0ca',
      'table-body-select-border-color': 'black',
      'table-body-select-background-color': '#042237',
      'table-body-select-color': '#59b0ca'
    },
    'white' : {
      'bg-color' : 'white',
      'text-color' : 'black',
      'input-text': '#00ff00',
      'input-text-pw': '#ff0000',
      'btn-color' : '#233356',
      'btn-hover-color' : '#068CB2',
      'login-screen-color': '#59b0ca',
      'menu-content-color': 'black',
      'table-header-background': '#093655',
      'table-header-border-color': '#d4f0f7',
      'table-header-text-color': 'white',
      'table-body-border-color': '#d4f0f7',
      'table-body-alternating1': 'white',
      'table-body-alternating2': '#d4f0f7' ,
      'table-body-text-color': '#006d93',
      'table-body-select-border-color': 'black',
      'table-body-select-background-color': 'white',
      'table-body-select-color': 'black'
    },
    'green' :  {
      'bg-color' : 'black',
      'text-color' : 'green',
      'input-text': '#ff0000',
      'input-text-pw': '#00ff00',
      'btn-color' : '#B3B2B2',
      'btn-hover-color' : '#E57200',
      'login-screen-color': '#59b0ca',
      'menu-content-color' : '#00ff00',
      'table-header-background': '#093655',
      'table-header-border-color': '#d4f0f7',
      'table-header-text-color': 'white',
      'table-body-border-color': '#d4f0f7',
      'table-body-alternating1': '#042237',
      'table-body-alternating2': 'black' ,
      'table-body-text-color': '#006d93',
      'table-body-select-border-color': 'black',
      'table-body-select-background-color': 'white',
      'table-body-select-color': 'black'
    }
  }
  zoomDefault: number;
  zoomMinValue: number = GXUtils.zoomMinValue;
  zoomMaxValue: number = GXUtils.zoomMaxValue;
  zoomStep: number = GXUtils.zoomStep;
  isOpenThemeStyle: boolean = false;
  themeColor: string = "white";

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
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
    private infoService: InfoService) {
    this.userExitsEventThrower.clearEventListeners();
    this.userExitsEventThrower.addEventListener(new LifecycleUserExits(infoService, navigationService, storageService, keyboardMappingService, logger));
    this.getLoggerConfiguration();
      if(window.innerWidth <= 992){
        this.zoomDefault = 10;
      }else if(window.innerWidth >= 992 && window.innerWidth <= 1200) {
        this.zoomDefault = 12;

      }else if(window.innerWidth > 1200 && window.innerWidth <= 1400) {
        this.zoomDefault = 14;
        
      }
      else if(window.innerWidth > 1400 && window.innerWidth <= 1800) {
        this.zoomDefault = 17;
        
      }else if(window.innerWidth > 1800) {
        this.zoomDefault = 20;
      }
      document.documentElement.style.setProperty('--text-font-size', this.zoomDefault+'px');
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
  }

  reload(): void {
    this.navigationService.isScreenUpdated.next(true);
  }

  logout(): void {
    if (!this.storageService.isConnected()) {
      return;
    }
    this.userExitsEventThrower.firePreDisconnect();
    this.disconnectSubscription = this.sessionService.disconnect(this.storageService.getAuthToken())
      .subscribe(
        res => this.userExitsEventThrower.firePostDisconnect(res),
        error => this.userExitsEventThrower.fireOnDisconnectError(error)
      );
    this.disconnectSubscription.add(() => this.storageService.setNotConnected())
  }

  print(){
    this.getScreenData(true); 
  }

  copy() {
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
      obj["visible"] = element ? element.visible : "";
      objArray.push(obj);
    });
      }
      
  getScreenData(printFlag) {
    let rawData = this.screenHolderService.getRawScreenData();
    let objArray = [];
    let formattedArray = [];
    let maxLine = 0;
    this.generateObjectArray(rawData.fields, objArray)
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
    this.formatCopyPage(formattedArray,printFlag);
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
  }

  formatLineText(lineDetails){
    let stringMaster = "                                                                                ";
    lineDetails.forEach(entry => {
      if(entry.data){
        stringMaster = GXUtils.replaceString(stringMaster,entry.col,entry.data);  
      }
      
    })
    return stringMaster;
  }

  setHostKeys(hostkeys: HostKeyTransformation[]): void {
    this.hostKeyTransforms = hostkeys;
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
    }
  }

  onDeactivate() {
    this.displayScreen = false;
  }

  isSmallScreen(): boolean {
    return screen.width <= AppComponent.MAX_SMALL_SCREEN_WIDTH && window.innerHeight < window.innerWidth;
  }

  formatLabel(value: number): string {
    return `${value+'px'}`;
  }

  changeTheme() {
    this.isOpenThemeStyle = !this.isOpenThemeStyle;
  }

  onZoomChange(value: number) {
    if (this.zoomDefault !== value) {
      this.zoomDefault = value;
      document.documentElement.style.setProperty('--text-font-size', this.zoomDefault+'px');
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


  changeBackgroundColor(color: string) {
    this.themeColor = color;
    this.isOpenThemeStyle = false;
    document.documentElement.style.setProperty('--bs-body-bg', this.themecolorConfig[color]['bg-color']);
    document.documentElement.style.setProperty('--primary-color', this.themecolorConfig[color]['bg-color']);
    document.documentElement.style.setProperty('--primary-text-color', this.themecolorConfig[color]['text-color']);
    document.documentElement.style.setProperty('--btn-color', this.themecolorConfig[color]['btn-color']);
    document.documentElement.style.setProperty('--btn-hover-color', this.themecolorConfig[color]['btn-hover-color']);
    document.documentElement.style.setProperty('--input-table-text', this.themecolorConfig[color]['input-text']);
    document.documentElement.style.setProperty('--input-table-text-pw', this.themecolorConfig[color]['input-text-pw']);
    document.documentElement.style.setProperty('--login-screen-color', this.themecolorConfig[color]['login-screen-color']);
    document.documentElement.style.setProperty('--menu-content-color', this.themecolorConfig[color]['menu-content-color']);
    document.documentElement.style.setProperty('--table-header-background', this.themecolorConfig[color]['table-header-background']);
    document.documentElement.style.setProperty('--table-header-border-color', this.themecolorConfig[color]['table-header-border-color']);
    document.documentElement.style.setProperty('--table-header-text-color', this.themecolorConfig[color]['table-header-text-color']);
    document.documentElement.style.setProperty('--table-body-border-color', this.themecolorConfig[color]['table-body-border-color']);
    document.documentElement.style.setProperty('--table-body-alternating1', this.themecolorConfig[color]['table-body-alternating1']);
    document.documentElement.style.setProperty('--table-body-alternating2', this.themecolorConfig[color]['table-body-alternating2']);
    document.documentElement.style.setProperty('--table-body-text-color', this.themecolorConfig[color]['table-body-text-color']);
    document.documentElement.style.setProperty('--table-body-select-border-color', this.themecolorConfig[color]['table-body-select-border-color']);
    document.documentElement.style.setProperty('--table-body-select-background-color', this.themecolorConfig[color]['table-body-select-background-color']);
    document.documentElement.style.setProperty('--table-body-select-color', this.themecolorConfig[color]['table-body-select-color']);

    //this is for delite button hover
    // document.documentElement.style.setProperty('--dlt-color-interactive-primary-hover', this.themecolorConfig[color]['btn-hover-color']);
  }

  setDefaultZoom() {
    if(window.innerWidth <= 992){
      this.zoomDefault = 10;
    }else if(window.innerWidth >= 992 && window.innerWidth <= 1200) {
      this.zoomDefault = 12;

    }else if(window.innerWidth > 1200 && window.innerWidth <= 1400) {
      this.zoomDefault = 14;
      
    }
    else if(window.innerWidth > 1400 && window.innerWidth <= 1800) {
      this.zoomDefault = 17;
      
    }else if(window.innerWidth > 1800) {
      this.zoomDefault = 20;
    }
    document.documentElement.style.setProperty('--text-font-size', this.zoomDefault+'px');
  }


}


