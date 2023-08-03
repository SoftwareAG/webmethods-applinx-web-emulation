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
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ApiModule,SessionService,InfoService } from '@softwareag/applinx-rest-apis';
import { HttpClientModule } from '@angular/common/http';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ScreenLockerService } from 'src/app/services/screen-locker.service'
import { DatePipe } from '@angular/common';
import { LoggerConfig } from 'ngx-logger'
import { MessagesService } from 'src/app/services/messages.service'
import { IJSFunctionService } from 'src/common/js-functions/ijs-functions.service'
import { JSFunctionsService } from 'src/common/js-functions/js-functions.service'
import { StorageService } from 'src/app/services/storage.service';
import { LifecycleUserExits } from 'src/app/user-exits/LifecycleUserExits';
import { UserExitsEventThrowerService } from './services/user-exits-event-thrower.service';

describe('AppComponent', () => {
	
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ApiModule,
        HttpClientModule
		],
      declarations: [
        AppComponent
      ],
	  providers: [
		SessionService,
		NavigationService,
		LoggerTestingModule,
		ScreenLockerService,
		DatePipe,
		StorageService,
		UserExitsEventThrowerService,
		LifecycleUserExits,	
		InfoService,
    {provide: LoggerConfig, useClass: class {}},
		{provide: 'IJSFunctionService', useClass: JSFunctionsService}
		
	  ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'ApplinX-Framework'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ApplinX-Framework');
  });

});
