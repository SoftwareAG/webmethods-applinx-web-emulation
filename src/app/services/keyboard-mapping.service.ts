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
import { Injectable } from '@angular/core';
import { GXKeyboardMapping } from '@softwareag/applinx-rest-apis';
import { MessagesService } from './messages.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GXAdditionalKey, GXObjectTypes } from './enum.service';
import { NavigationService } from './navigation/navigation.service';
import { IJSFunctionService } from '../../common/js-functions/ijs-functions.service';
import { Inject } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})

export class KeyboardMappingService {

	public static JsonServerKeyboardMappings: Map<string, GXKeyboardMapping>;//second priority. reloads for each session.
	public static JSKeyboardMappings: Map<string, GXKeyboardMapping>;//first priority. reloads for each page.
	private jsFunc: IJSFunctionService;
	
  constructor(private httpClient: HttpClient , public messagesService: MessagesService, 
	private logger: NGXLogger,private messages: MessagesService,
	private navigationService: NavigationService, @Inject('IJSFunctionService') jsFunctions: IJSFunctionService ) {
	  this.jsFunc = jsFunctions;
   }
  
	private getJSON(): Observable<any> {
		return this.httpClient.get("./assets/config/KeyboardMappings.json");
	}

   	public initMapping(keyList : any) : void{
	KeyboardMappingService.JsonServerKeyboardMappings = new Map<string, GXKeyboardMapping>();
	KeyboardMappingService.JSKeyboardMappings = new Map<string, GXKeyboardMapping>();
	for(let key in keyList){				
		this.loadKeyboardMappings(keyList[key]);
	} 
	
    this.getJSON().subscribe(data => {
		let map = data['GXKeyboardMappings'];
      for(let key in map){
		let keyboardMapping: GXKeyboardMapping; 
		let item: any = map[key]
		
		keyboardMapping = new GXKeyboardMapping( item['additionalKey'], null, item['targetFunction'], item['keyCode']);
		
        KeyboardMappingService.JsonServerKeyboardMappings.set(KeyboardMappingService.mapKey(item['keyCode'],item['additionalKey']), keyboardMapping);
       } });
	}
	private static  mapKey(keyCode: any, additionalKey: string): string{
		return keyCode+'-'+additionalKey
	}

	public addKeyboardMapping(additionalKey: string,keyCode: string,functionElement: any,overrideExisting: boolean,cancelMapFunction: any): void{
		if(KeyboardMappingService.JSKeyboardMappings == null){
			return;
		}
		let keyboardMapping: GXKeyboardMapping;
		if(overrideExisting || !overrideExisting && !KeyboardMappingService.JsonServerKeyboardMappings.has(KeyboardMappingService.mapKey(keyCode,additionalKey))){
			keyboardMapping = new GXKeyboardMapping(additionalKey, cancelMapFunction, functionElement, keyCode);
			KeyboardMappingService.JSKeyboardMappings.set(KeyboardMappingService.mapKey(keyCode, additionalKey), keyboardMapping);
		}
	}
	public clearJSKeyboardMappings(){
		KeyboardMappingService.JSKeyboardMappings.clear();
	}

  	public checkKeyboardMappings(event: KeyboardEvent, activateMapping: boolean, keyCode: number): boolean {
		let gx_event = event;
		let additionalKey = GXAdditionalKey.NONE;
		if(gx_event.altKey){
			additionalKey = GXAdditionalKey.ALT;
		}else if(gx_event.ctrlKey){
			additionalKey = GXAdditionalKey.CTRL;
		}else if(gx_event.shiftKey){
			additionalKey = GXAdditionalKey.SHIFT;
		}

		let keyMap = null;
		if(KeyboardMappingService.JsonServerKeyboardMappings != null){
			//the priorties are: 1) injected JS functions 2) JSon configuration 3) Server definitions(from the designer)
			keyMap = KeyboardMappingService.JSKeyboardMappings.get(KeyboardMappingService.mapKey(gx_event.keyCode, additionalKey));
			if(keyMap == null){
				keyMap = KeyboardMappingService.JsonServerKeyboardMappings.get(KeyboardMappingService.mapKey(gx_event.keyCode, additionalKey));
			}
		}

		if (keyMap == null) {
			return true;
		}

		if (keyMap.cancelMapFunction != null) {
			let cancelMap = keyMap.cancelMapFunction(event);
			if (cancelMap){
				return true; 
			}
		}

		let keyFunc = keyMap.targetFunction;

		if (!this.hasValue(keyFunc)) {
			let details = "\n\tfunction: " + keyFunc + "\n\tadditionalKey: " + additionalKey + "\n\tkeyCode: " + keyCode + "\n";
			let msg = this.messagesService.get("ERR_INVALID_KEYBOARD_MAPPING") + details;	
			this.logger.error(msg);			
			return true;
		}

		this.logger.debug(this.messages.get("EXECUTING_KEYBOARD_MAPPING") + keyFunc.toString());
				
		if (activateMapping /*&& !this.engineService.formLocked*/) {
			// the functionElement can be one of 3:
			// 1. Actual javascript function object
			// 2. javascript function name
			// 3. javascript command
			// If is a string then evaluate it. If it returns a result
			// and it is a function, so activate it
			let result: any;
			if (typeof(keyFunc) == GXObjectTypes.STRING) {
				let beginBracket = keyFunc.indexOf("(");
			    if (beginBracket != -1) {
				    let methodName = keyFunc.substring(0, beginBracket);
				    if(this.jsFunc[methodName]) {
				     	// method exists in the component
				    	let param = keyFunc.substring(beginBracket+1, keyFunc.length-1);
				    	result = this.jsFunc[methodName](param); // call it
				    }else{
					     this.logger.error(this.messages.get("NO") + methodName + this.messages.get("SUCH_FUNCTION_FOR_KEYCODE") + keyMap.keyCode + this.messages.get("ADDITIONALKEY") + keyMap.additionalKey);
				    }			
			    }else{
						this.navigationService.sendKeys(keyFunc);
			    }				
			    if (result != null) {
			    	keyFunc = result;				
			    }
		    }
			if (keyFunc != null && typeof(keyFunc) == GXObjectTypes.FUNCTION) {
				keyFunc(gx_event);
			}
		}		
		return false;
	  }
  
	loadKeyboardMappings(keyMapping: any){
		if (keyMapping == null) {
			this.logger.error(this.messages.get("INVALID_MAPPING_SOURCE_UNDIFINED"));
			return;
		}	
				
		KeyboardMappingService.JsonServerKeyboardMappings.set(KeyboardMappingService.mapKey(keyMapping['keyCode'],keyMapping['additionalKey']), keyMapping);			
	}
	hasValue(value): boolean {
		if (value == null) {
			return false;
		}

		if (typeof(value) == GXObjectTypes.STRING) {
			let v = value.replace(/^\s+|\s+$/g, '');
			return v.length != 0;
		}

		let type = typeof(value);
		return type == GXObjectTypes.FUNCTION;
	}
}
