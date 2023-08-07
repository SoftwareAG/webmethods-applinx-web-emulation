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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GetScreenResponse } from '@softwareag/applinx-rest-apis'
@Injectable({
  providedIn: 'root'
})
export class ScreenHolderService {

  private _runtimeScreen: GetScreenResponse;
  private _previousScreen: any;
  private _rawScreenData: GetScreenResponse;

  public screenInitialized: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }

  public setRuntimeScreen(screen: GetScreenResponse): void {
    this._previousScreen = this._runtimeScreen;
    this._runtimeScreen = screen;
  }
  public getRuntimeScreen(): GetScreenResponse {
    return this._runtimeScreen;
  }
  public getRuntimeScreenName(): string {
    return this._runtimeScreen ? (this._runtimeScreen.name || '') : null;
  }
  public setPreviousScreen(screen: any): void {
    this._previousScreen = screen;
  }
  public getPreviousScreen(): any {
    return this._previousScreen;
  }
  public isCurrentScreenWindow(): boolean {
    return this._runtimeScreen.windows?.length > 0;
  }
  public setRawScreenData(screen: GetScreenResponse){
    this._rawScreenData = screen;
  }
  public getRawScreenData(){
    return this._rawScreenData;
  }
}
