import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {CalendarTransformation, Cursor, Field, InputField } from '@softwareag/applinx-rest-apis';
import {NavigationService} from '../../../services/navigation/navigation.service';
declare var $: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('datepickerIcon') datepickerIcon: ElementRef;
  @Input() transform: CalendarTransformation;
  sendableField: InputField;
  field: Field;
  toggleId: string;

  constructor(private navigationService: NavigationService) { }

  ngAfterViewInit(): void {
    $(".dlt-date-picker").datepicker({
      // Hide the datepicker automatically when picked
      autoHide: true,
      trigger: this.datepickerIcon.nativeElement,
      format: this.transform.dateInputFields[0].format,
    });

    $(".dlt-date-picker").on('change', (e) => {
      this.sendableField.setValue(e.target.value);
      this.navigationService.setSendableField(this.sendableField);
    });
    $('i').on('click', () => {
      $('[data-view="month prev"]').text('');
      $('[data-view="month next"]').text('');
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.field = changes.transform.currentValue.dateInputFields[0].field;
    this.sendableField = new InputField();
    this.sendableField.setValue(this.field.content);
    this.sendableField.setPosition(this.field.position);
    this.sendableField.setIndex(this.field.index);
    this.sendableField.setName(this.field.name);
  }

  onFocus(): void {
    this.navigationService.setCursorPosition(new Cursor(this.sendableField.position, this.sendableField.name, this.sendableField.index));
  }
}