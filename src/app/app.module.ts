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
 
import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatFormFieldModule} from '@angular/material/form-field';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatSliderModule} from '@angular/material/slider';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
//import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppComponent } from './app.component';
import { ApiModule, Configuration, ConfigurationParameters} from '@softwareag/applinx-rest-apis'
import { ScreenComponent } from './screen/screen.component';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { WebLoginComponent } from './webLogin/webLogin.component';
//import { TopnavModule } from '@softwareag/dln';
import { environment} from '../environments/environment';
import { FieldComponent } from './mini-components/field/field.component';
import { ClickableComponent } from './mini-components/transformations/clickable/clickable.component';
import { TableComponent } from './mini-components/transformations/table/table.component';
import { MultipleOptionsComponent } from './mini-components/transformations/multiple-options/multiple-options.component';
import { TextComponent } from './mini-components/transformations/text/text.component';
import { MenuComponent } from './mini-components/transformations/menu/menu.component';
import { ModalpopupComponent } from './mini-components/transformations/modalpopup/modalpopup.component';
import { TransformGeneratorComponent } from './mini-components/transformations/transform-generator/transform-generator.component';
import { InputFieldComponent } from './mini-components/input-field/input-field.component';
import { NavigationService} from './services/navigation/navigation.service';
import { KeyboardMappingService} from './services/keyboard-mapping.service';
import { MessagesService} from './services/messages.service';
import { TabAndArrowsService} from './services/navigation/tab-and-arrows.service';
import { UserExitsEventThrowerService } from './services/user-exits-event-thrower.service';
import { HostKeysTemplateComponent } from './mini-components/host-keys-template/host-keys-template.component';
import { StorageService} from './services/storage.service';
import { ScreenLockerService} from './services/screen-locker.service';
import { CalendarComponent } from './mini-components/transformations/calendar/calendar.component';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { LineComponent } from './mini-components/transformations/line/line.component';
import { CheckboxComponent } from './mini-components/transformations/checkbox/checkbox.component';
import { JSMethodsService } from '../common/js-functions/js-methods.service';
import { LoggerModule, NGXLogger, NgxLoggerLevel, TOKEN_LOGGER_SERVER_SERVICE } from 'ngx-logger';
import { RouterModule, Routes } from '@angular/router';
import { ScreenHolderService } from './services/screen-holder.service';
import { OAuth2HandlerService } from './services/oauth2-handler.service';
import { RouteGuardService } from './services/route-guard.service';
import { ScreenProcessorService } from './services/screen-processor.service';
import { MacroComponent } from './macro/macro.component';
import { SharedService } from './services/shared.service';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { HttpHeaders } from '@angular/common/http';
import { AuthTokenServerService } from './services/logger.service'

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.basePath,
    withCredentials: false,
  };
  return new Configuration(params);
}

export const generatedPages: any[] = [
  
];

const routes: Routes = [
  { path: 'webLogin', component: WebLoginComponent, canActivate: [RouteGuardService] },
  { path: 'instant', component: ScreenComponent, canActivate: [RouteGuardService] },
  { path: '**',   redirectTo: 'instant', pathMatch: 'full' }
]; 

@NgModule({
  declarations: [
    AppComponent,
    ScreenComponent,
    WebLoginComponent,
    FieldComponent,
    ClickableComponent,
    TableComponent,
    MultipleOptionsComponent,
    TextComponent,
    MenuComponent,
    ModalpopupComponent,
    TransformGeneratorComponent,
    InputFieldComponent,
    HostKeysTemplateComponent,
    CalendarComponent,
    LineComponent,
    CheckboxComponent,
    MacroComponent,
  ].concat(generatedPages),
  imports: [
    ApiModule.forRoot(apiConfigFactory),
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'}),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    // TopnavModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,    
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSliderModule,
    MatSelectModule,
    MatInputModule,
    ScrollingModule,
    // MatSnackBar,
    MatSnackBarModule,
    OverlayModule,
    MatMenuModule,
    MatRadioModule,
    MatTooltipModule,
    MatCheckboxModule,  
    // MatDialog,
    LoggerModule.forRoot(
      {serverLoggingUrl: environment.basePath+'/logger', 
      level: NgxLoggerLevel.ERROR, 
      serverLogLevel: NgxLoggerLevel.ERROR,
    },
    {
      serverProvider: {
        provide: TOKEN_LOGGER_SERVER_SERVICE, useClass: AuthTokenServerService
      }
    }
    )
  ],  
  providers: [NavigationService, 
    StorageService, 
    TabAndArrowsService, 
    MessagesService, 
    KeyboardMappingService,     
    ScreenLockerService,
    ScreenHolderService,
    UserExitsEventThrowerService,    
    JSMethodsService,
    NGXLogger, 
    OAuth2HandlerService,
    RouteGuardService,
    ScreenProcessorService,
    SharedService,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    {provide: 'IJSFunctionService', useClass: JSMethodsService}
  ],  
  exports: [RouterModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    StorageService.injector = this.injector;
  }
}
