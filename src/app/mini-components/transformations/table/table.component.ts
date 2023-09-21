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
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {TableTransformation, InputField} from '@softwareag/applinx-rest-apis';
import {NavigationService} from '../../../services/navigation/navigation.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {

  @Input() transform: TableTransformation;

  constructor(private navigationService: NavigationService) { }

  onInputValueChange(inputField: InputField): void {
    this.navigationService.setSendableField(inputField);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngOnInit(){
    console.log("transform : ", this.transform);
    let colDetails = this.transform.table.cols;
    let rowDetails = this.transform.table.rows[0].items;
    rowDetails.forEach((element,index) => {
      let colCaption = colDetails[index].caption;
      let colDataLength = element.length;
      if(colCaption.length > colDataLength){
        colDetails[index].caption = colDetails[index].caption.substr(0, 1);
        colDetails[index]["tooltip"] = colCaption;
      }else{
        colDetails[index]["tooltip"] = colDetails[index].caption;
      }
    })
  }
}
