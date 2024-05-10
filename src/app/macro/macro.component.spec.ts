import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MacroComponent } from './macro.component';

describe('MarcoComponent', () => {
  let component: MacroComponent;
  let fixture: ComponentFixture<MacroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MacroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
