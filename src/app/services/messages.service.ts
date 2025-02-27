/*
 * Copyright IBM Corp. 2024, 2025
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
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
@Injectable({
  providedIn: 'root'
})
export class MessagesService implements OnInit{
 
  public static messages: Map<string, string>;
 
  constructor(private httpClient: HttpClient, private logger: NGXLogger ) {
    this.ngOnInit();    
  }
  ngOnInit(): void {
    MessagesService.messages = new Map<string, string>();
    this.getJSON().subscribe(data => {
      for(let key in data){
        MessagesService.messages.set(key, data[key]);
       }        
      });
  }

  get(key: string): string{
    return MessagesService.messages.get(key);
  }

  private getJSON(): Observable<any> {
    return this.httpClient.get("./assets/messages/messages.json");
  }
}

