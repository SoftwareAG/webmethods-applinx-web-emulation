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
import {Component, Input, OnInit} from '@angular/core';
import {NavigationService} from '../../services/navigation/navigation.service';
import {HostKeyTransformation} from '@softwareag/applinx-rest-apis';
import { GXUtils } from 'src/utils/GXUtils';

@Component({
  selector: 'app-host-keys-template',
  templateUrl: './host-keys-template.component.html',
  styleUrls: ['./host-keys-template.component.css']
})
export class HostKeysTemplateComponent implements OnInit {

  @Input() transformations: HostKeyTransformation[];
  @Input() themeColor: string;

  constructor(public navigationService: NavigationService) { }

  ngOnInit(): void {
  }

  onClick(actionValue: string): void {
    this.navigationService.sendKeys(actionValue);
  }

  onEnter(){
    if(GXUtils.setTypeAheadEnterFlag){
      this.onClick('[enter]');
    }
  }
}
