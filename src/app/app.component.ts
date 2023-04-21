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
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from './services/navigation/navigation.service';
import { StorageService } from './services/storage.service';
import { WebLoginComponent } from './webLogin/webLogin.component';
import { GridPosition, TabAndArrowsService } from './services/navigation/tab-and-arrows.service';
import { ScreenLockerService } from './services/screen-locker.service';
import { KeyboardMappingService } from './services/keyboard-mapping.service';
import { Subscription } from 'rxjs';
import { ScreenHolderService } from './services/screen-holder.service';
import { ScreenComponent } from './screen/screen.component';
import { GXGeneratedPage } from './generated-pages/GXGeneratedPage';
import { LoggerConfig, NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { LifecycleUserExits } from './user-exits/LifecycleUserExits';
import { UserExitsEventThrowerService } from './services/user-exits-event-thrower.service';
import { OAuth2HandlerService } from './services/oauth2-handler.service';
import { MessagesService } from './services/messages.service';
import { HostKeyTransformation, Cursor, SessionService ,InfoService } from '@softwareag/applinx-rest-apis';

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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.screenLockerService.isLocked()) {
        return; // windows is loading...
    }
    if(!this.keyboardMappingService.checkKeyboardMappings(event, true, event.keyCode)){
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
      const pos = {row: gp.rowStart, column: gp.colStart};
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
    private oAuth2handler: OAuth2HandlerService,
	  private infoService: InfoService) {
    this.userExitsEventThrower.clearEventListeners();
    this.userExitsEventThrower.addEventListener(new LifecycleUserExits(infoService,navigationService,storageService,keyboardMappingService,logger));
    this.getLoggerConfiguration();
  }
    
	getLoggerConfiguration() {   
    const jsonDefault: LoggerConfig = this.logger.getConfigSnapshot();
    this.httpClient.get<LoggerConfig>('./assets/config/sessionConfig.json').subscribe(data => {
      let json = data[AppComponent.LOGGER_ELEMENT];         
      let jsonKeys : any[] = Object.keys(jsonDefault);
      jsonKeys.forEach(element => {
        if(json[element] === undefined) {            
          json[element] = jsonDefault[element];
        }
      });
      this.logger.updateConfig(json);
    });
	}

  ngOnInit(): void {
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
      this.userExitsEventThrower.addEventListener(new LifecycleUserExits(this.infoService,this.navigationService,this.storageService,this.keyboardMappingService,this.logger));
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
}
