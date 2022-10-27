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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';
import { GXUtils } from 'src/utils/GXUtils';
import { NavigationService } from './navigation/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private _applicationName: string;
  private _connectionPool: string;
  private _sessionOptions: { [key: string]: string; };
  private _autoLogin: boolean;
  isConfigurationLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(private httpClient: HttpClient, private logger: NGXLogger, private navigationService: NavigationService) { 
    this.loadConfig();
  }

  private loadConfig(): void {
    this.httpClient.get<any>(GXUtils.removeEndingSlash(this.url) + "/assets/config/sessionConfig.json")
      .subscribe(
        config => {
          this._applicationName = config.applicationName;
          this._connectionPool = config.connectionPool;
          this._autoLogin = config.autoLoginIfDisabledAuth;
          this.initSessionOptions(config.sessionOptions);
          this.navigationService.setIsAutoLogin(this._autoLogin);
          this.isConfigurationLoaded.next(true);
        },
        error => {
          this.logger.error(error);
        })
  }

  public getConfigObservable() {
    return this.httpClient.get<any>(GXUtils.removeEndingSlash(this.url)+ "/assets/config/sessionConfig.json");
  }

  private get url(): string {
    let url = location.protocol + '//' + location.host;
    const pathname = GXUtils.removeSlash(location.pathname);
    if (pathname !== 'instant' && !this.navigationService.getRoutingHandler().hasRoute(pathname)) {
      url += location.pathname;
    }
    return url;
  }
  
  private isValidVariable(variableKey: any, variableValue: any): boolean {
    return (variableKey && typeof variableKey === 'string' && variableKey.length > 0 && variableKey.startsWith('GX_VAR')
                   && variableValue && typeof variableValue === 'string' && variableValue.length > 0);
  }

  private initSessionOptions(options: any): void {
    this._sessionOptions = {};
    if (options) {
      for (let key of Object.keys(options)) {
        if (this.isValidVariable(key, options[key])) {
          this.sessionOptions[key] = options[key];
        }
      }
    } 
  }

  get applicationName(): string {
    return this._applicationName;
  }
  get autoLogin(): boolean {
    return this._autoLogin;
  }
  get connectionPool(): string {
    return this._connectionPool;
  }
  get sessionOptions(): any {
    return this._sessionOptions;
  }

  ngOnDestroy(): void {
    if (this.isConfigurationLoaded) {
      this.isConfigurationLoaded.unsubscribe();
    }
  }
  
}
