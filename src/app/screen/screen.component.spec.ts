import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScreenComponent } from './screen.component';
import { NavigationService } from '../services/navigation/navigation.service'; // replace with the actual path=
import { NGXLogger } from 'ngx-logger';
import { MessagesService } from '../services/messages.service';
import { SharedService } from '../services/shared.service';
import { ScreenHolderService } from '../services/screen-holder.service';
import { UserExitsEventThrowerService } from '../services/user-exits-event-thrower.service';
import { ScreenProcessorService } from '../services/screen-processor.service';
import { ScreenLockerService } from '../services/screen-locker.service';
import { ScreenService } from '@softwareag/applinx-rest-apis';
import { GetScreenRequest, GetScreenResponse ,InputField, InfoService} from '@softwareag/applinx-rest-apis';
import { BehaviorSubject, of } from 'rxjs';
import { HostListener } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientXsrfModule } from '@angular/common/http';
import { ModalService, PlaceholderService } from 'carbon-components-angular';
import { IJSFunctionService } from 'src/common/js-functions/ijs-functions.service';
import { JSMethodsService } from 'src/common/js-functions/js-methods.service';
import { KeyboardMappingService } from '../services/keyboard-mapping.service';
 
 
describe('ScreenComponent', () => {
  let component: ScreenComponent;
  let fixture: ComponentFixture<ScreenComponent>;
  let navigationService: NavigationService;
  let screenService: ScreenService;
  let messages: MessagesService;
  let sharedService: SharedService;
  let screenHolderService: ScreenHolderService;
  let userExitsEventThrower: UserExitsEventThrowerService;
  let screenProcessorService: ScreenProcessorService;
  let screenLockerService: ScreenLockerService;
  let logger: NGXLogger;
  let isScreenUpdated$: BehaviorSubject<boolean>;
  let screenObjectUpdated$: BehaviorSubject<any>;
 
 
beforeEach(async () => {
  isScreenUpdated$ = new BehaviorSubject<boolean>(false);
  screenObjectUpdated$ = new BehaviorSubject<any>(null);
  let keyboardMappingServiceStub={clearJSKeyboardMappings:jasmine.createSpy('clearJSKeyboardMappings')}
  await TestBed.configureTestingModule({
    declarations: [ScreenComponent],
    imports: [
      HttpClientTestingModule, // Add this line
      // other imports...
    ],
    providers: [
      NavigationService,
      ScreenService,
      MessagesService,
      SharedService,
      ScreenHolderService,
      UserExitsEventThrowerService,
      ScreenProcessorService,
      ScreenLockerService,
      ModalService,
      InfoService,
      JSMethodsService,
      PlaceholderService,
      KeyboardMappingService,
      { provide: NGXLogger, useValue: {} },
      {provide:HttpClientXsrfModule, useClass:HttpClientTestingModule},
      { provide: 'IJSFunctionService', useClass: JSMethodsService },
      {provide:KeyboardMappingService,useValue:keyboardMappingServiceStub}
    ],
   
  }).compileComponents();
  const keyboardMappingService = TestBed.inject(KeyboardMappingService);
  keyboardMappingService.clearJSKeyboardMappings();
});
 
 
  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenComponent);
    component = fixture.componentInstance;
    navigationService = TestBed.inject(NavigationService);
    screenService = TestBed.inject(ScreenService);
    messages = TestBed.inject(MessagesService);
    sharedService = TestBed.inject(SharedService);
    screenHolderService = TestBed.inject(ScreenHolderService);
    userExitsEventThrower = TestBed.inject(UserExitsEventThrowerService);
    screenProcessorService = TestBed.inject(ScreenProcessorService);
    screenLockerService = TestBed.inject(ScreenLockerService);
    logger = TestBed.inject(NGXLogger);
 
    spyOn(navigationService, 'setSendableField').and.callThrough();
    spyOn(screenService, 'getScreen').and.returnValue(of());
    spyOn(screenHolderService, 'setRuntimeScreen').and.callThrough();
    spyOn(screenHolderService, 'setRawScreenData').and.callThrough();
    spyOn(screenProcessorService, 'processTable').and.callThrough();
    spyOn(screenLockerService, 'setLocked').and.callThrough();
  });
 
  it('should call getScreen when ngOnInit is called', () => {
    component.ngOnInit();
    expect(screenService.getScreen).toHaveBeenCalled();
  });
 
 
  it('should call postGetScreen when screenId is different from current screenId & newScreenId', () => {
    const incomingScreen: GetScreenResponse = {
      screenId: 2, 
      name: 'newScreen',
      screenSize: {},
      cursor: { position: { row: 1, column: 1 } },
      fields: [],
      transformations: []
    };
 
    component.m_screen = { screenId: 1 } as GetScreenResponse;
    spyOn(component as any, 'postGetScreen');
 
    // Manually trigger the BehaviorSubject
    navigationService.screenObjectUpdated = new BehaviorSubject<GetScreenResponse>(null);
    component.ngOnInit(); 
    navigationService.screenObjectUpdated.next(incomingScreen); 
 
    expect((component as any).postGetScreen).toHaveBeenCalledWith(incomingScreen);
  });
});
 