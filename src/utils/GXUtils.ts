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

import { Position } from "@softwareag/applinx-rest-apis";
import {BlackTheme, WhiteTheme, GreenTheme} from "./GXColorTheme"

enum FOREGROUND_COLOR {
    BLACK = 'gx_blk',
    BLUE = 'gx_bl',
    GREEN = 'gx_grn',
    PURPLE = 'gx_ppl',
    YELLOW = 'gx_ylw',
    CYAN = 'gx_aq',
    RED = 'gx_rd',
    AQUA = 'gx_aq',
    MAGENTA = 'gx_ppl',
    BROWN = 'gx_blk',
    WHITE = 'gx_lwt',
    GRAY = 'gx_gr',
    LIGHT_BLUE = 'gx_lbl',
    LIGHT_GREEN = 'gx_lgrn',
    LIGHT_CYAN = 'gx_laq',
    LIGHT_RED = 'gx_lrd',
    LIGHT_MAGENTA = 'gx_lppl',
    LIGHT_YELLOW = 'gx_ylw',
    LIGHT_WHITE = 'gx_lwt',
    LIGHT_PURPLE = 'gx_lppl',
    LIGHT_AQUA = 'gx_laq'
  }

enum BACKGROUND_COLOR {
    BLACK = 'gx_blk',
    BLUE = 'gx_bbl',
    GREEN = 'gx_bgrn',
    PURPLE = 'gx_bppl',
    YELLOW = 'gx_bylw',
    CYAN = 'gx_baq',
    RED = 'gx_brd',
    AQUA = 'gx_baq',
    MAGENTA = 'gx_bppl',
    BROWN = 'gx_blk',
    WHITE = 'gx_bwt',
    GRAY = 'gx_bgr',
    LIGHT_BLUE = 'gx_blbl',
    LIGHT_GREEN = 'gx_blgrn',
    LIGHT_CYAN = 'gx_blaq',
    LIGHT_RED = 'gx_blrd',
    LIGHT_MAGENTA = 'gx_blppl',
    LIGHT_YELLOW = 'gx_bylw',
    LIGHT_AQUA = 'gx_blaq',
    LIGHT_PURPLE = 'gx_blppl',
    LIGHT_WHITE = 'gx_blwt'
  }

export class GXUtils {

    public static getBgCssClass(bgColor: string): string {
        bgColor = bgColor.toLowerCase();
        let bgClass;
        switch(bgColor) {
            case 'blue':
              bgClass = BACKGROUND_COLOR.BLUE;
              break;
            case 'green':
              bgClass = BACKGROUND_COLOR.GREEN;
              break;
            case 'cyan':
              bgClass = BACKGROUND_COLOR.CYAN;
              break;
            case 'red':
              bgClass = BACKGROUND_COLOR.RED;
              break;
            case 'magenta':
              bgClass = BACKGROUND_COLOR.MAGENTA;
              break;
            case 'brown':
              bgClass = BACKGROUND_COLOR.BROWN;
              break;
            case 'white':
              bgClass = BACKGROUND_COLOR.WHITE;
              break;
            case 'gray':
              bgClass = BACKGROUND_COLOR.GRAY;
              break;
            case 'lightblue':
              bgClass = BACKGROUND_COLOR.LIGHT_BLUE;
              break;
            case 'lightgreen':
              bgClass = BACKGROUND_COLOR.LIGHT_GREEN;
              break;
            case 'lightcyan':
              bgClass = BACKGROUND_COLOR.LIGHT_CYAN;
              break;
            case 'lightred':
              bgClass = BACKGROUND_COLOR.LIGHT_RED;
              break;
            case 'lightmagenta':
              bgClass = BACKGROUND_COLOR.LIGHT_MAGENTA;
              break;
            case 'lightyellow':
              bgClass = BACKGROUND_COLOR.LIGHT_YELLOW;
              break;
            case 'lightwhite':
              bgClass = BACKGROUND_COLOR.LIGHT_WHITE;
              break;
            case 'undefined':
              bgClass = undefined;
              break;
            default:
              bgClass = undefined;
              break;
          }      
        return bgClass;
    }

    public static getFgCssClass(fgColor: string, isIntensified: boolean): string {
        fgColor = fgColor.toLowerCase();
        let fgClass;
        switch(fgColor) {
            case 'black':
              fgClass = isIntensified ? 'gx_intf' : FOREGROUND_COLOR.BLACK;
              break;
            case 'blue':
              fgClass = FOREGROUND_COLOR.BLUE;
              break;
            case 'green':
              fgClass = FOREGROUND_COLOR.GREEN;
              break;
            case 'cyan':
              fgClass = FOREGROUND_COLOR.CYAN;
              break;
            case 'red':
              fgClass = FOREGROUND_COLOR.RED;
              break;
            case 'magenta':
              fgClass = FOREGROUND_COLOR.MAGENTA;
              break;
            case 'brown':
              fgClass = FOREGROUND_COLOR.BROWN;
              break;
            case 'white':
              fgClass = FOREGROUND_COLOR.WHITE;
              break;
            case 'gray':
              fgClass = FOREGROUND_COLOR.GRAY;
              break;
            case 'lightblue':
              fgClass = FOREGROUND_COLOR.LIGHT_BLUE;
              break;
            case 'lightgreen':
              fgClass = FOREGROUND_COLOR.LIGHT_GREEN;
              break;
            case 'lightcyan':
              fgClass = FOREGROUND_COLOR.LIGHT_CYAN;
              break;
            case 'lightred':
              fgClass = FOREGROUND_COLOR.LIGHT_RED;
              break;
            case 'lightmagenta':
              fgClass = FOREGROUND_COLOR.LIGHT_MAGENTA;
              break;
            case 'lightyellow':
              fgClass = FOREGROUND_COLOR.LIGHT_YELLOW;
              break;
            case 'lightwhite':
              fgClass = FOREGROUND_COLOR.LIGHT_WHITE;
              break;
            case 'undefined':
              fgClass = undefined;
              break;
            default:
              fgClass = undefined;
              break;
          }
        return (!fgClass && isIntensified) ? 'gx_intf' : fgClass;
    }

    public static isNumber(val: any): boolean {
      return val !== null && val !== undefined && !Number.isNaN(val);
    }

    public static isPositiveNumber(val: any): boolean {
      return GXUtils.isNumber(val) && (val > 0);
    }

    public static isStringEmptyWithTrim(str: string): boolean {
      return (!str || 0 === str.trim().length);
    }
    
    public static posToString(pos: Position): string {
      return pos.row + ',' + pos.column;
    }

    /* Remove first occurrence of slash or backslash */
    public static removeSlash(str: string): string {
      return str.replace(/\\|\//g,'');
    }

    /* Remove first occurrence of slash or backslash */
    public static removeEndingSlash(str: string): string {
      return (str.slice(-1) == '/') ?  str.substring(0, str.length - 1) : str;
    }
    public static zoomMinValue = 10;
    public static zoomMaxValue = 24;
    public static zoomStep = 1;
    public static copyFlag : boolean = false;
    
    public static replaceString(str, index, replacement) {
      return (
        str.slice(0, index) +
        replacement +
        str.slice(index + replacement.length)
      );
    }
		
    public static replaceBetween (str, start, end, what) {
      return str.substring(0, start) + what + str.substring(end);
    };
    public static setCopyFlag(flag){
      this.copyFlag = flag;
    }

    public static getCopyFlag(){
      return this.copyFlag;
    }

    public static nationalityWin = "NationalityWin";
    public static themeColorsList = ['Black', 'White', 'Green'];
    public static defaultThemeColor = 'White';
    public static themecolorConfig = {Black: BlackTheme, White: WhiteTheme, Green: GreenTheme}
	  public static copyInstruction = "For Copying, select the text that needs to be copied with mouse, the copied text background color will change to  ";
    public static copyInstruction_bgcolor = "Blue";
    public static showHostKeyFlag = false;
    public static MENU = "Menu";
    public static UNKNOWN = "UNKNOWN";
    public static RecordMacro = 'record';
    public static ViewMacro = 'view';
    public static PlayMacro = 'play';
    public static RenameMacro = 'rename';
    public static MacroExitsMsg = "The Macro name already exists, Please enter a new Macro Name";
    public static DeleteMacro = 'remove';
    public static ENTER = "Enter";
    public static NUMPADENTER ="NumpadEnter"
    public static BACKSPACE = "Backspace";
    public static TAB = "Tab";
    public static IMPLICITTAB = "ImplicitTab";
    public static FUNCTIONARRAY = ["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"];
    public static ARROWKEYARRAY = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp","PageUp", "PageDown"];
    public static IGNOREKEYARRAY = ["ControlLeft","ControlRight","ShiftRight","ShiftLeft","AltRight","AltLeft","Home", "End", "Insert","Delete","CapsLock"];
    public static ARROWRIGHT = "ArrowRight"; 
    public static ARROWLEFT = "ArrowLeft";
    public static ARROWDOWN = "ArrowDown";
    public static ARROWUP = "ArrowUp";
    public static PAGEUP = "PageUp";
    public static PAGEDOWN = "PageDown";
    public static DELETE = "Delete";
    public static ENABLETYPEAHEADFLAG = true; // Variable to enable/disable type ahead
    public static fieldOrder = 0;
    public static typeAheadCharacterArray : any = [];
    public static typeAheadStringArray: any = [];
    public static pagesArray: any = [];
    public static pageNo: number = 0;
    public static typeAhead = "TYPEAHEAD" 
    public static currentPage = "CURRENTPAGE" 
    public static implicitFlag = false;
    public static dataTypes = {
      ALPHANUMERIC : 'ALPHANUMERIC',
      NUMERIC : 'NUMERIC',
      ALPHA_ONLY : 'ALPHA_ONLY', //(AS/400)
      DIGITS_ONLY : 'DIGITS_ONLY',  //(AS/400)
      SIGNED_NUMERIC : 'SIGNED_NUMERIC',  //(AS/400)
      KATAKANA_SHIFT : 'KATAKANA_SHIFT',  //(AS/400 Japanese katakana only field)
      DBCS_ONLY : 'DBCS_ONLY',
      DBCS_CAN_CREATE_SISO : 'DBCS_CAN_CREATE_SISO',
      REVERSED : 'REVERSED'  //(AS/400 Hebrew field)
    }

    public static appendTypeAheadChar(typeAheadChar){
      this.typeAheadCharacterArray.push(typeAheadChar);
    }

    public static getTypeAheadCharsArray(){
      return this.typeAheadCharacterArray;
  }
  public static getTypeAheadStringArray(){
    return this.typeAheadStringArray;
}

  public static createWord(){
    let strObj = {};
    strObj["value"] = this.typeAheadCharacterArray.length>0?this.typeAheadCharacterArray.toString().replaceAll(",", ""):null;
    strObj["active"] = true;
    strObj["fieldOrder"] = this.fieldOrder++;
    console.log("strObj['value'] : ", strObj["value"])
    return strObj
  }

  public static createPage(nextPageFlag){
      let pageObj = {}
      pageObj["inputs"] = this.typeAheadStringArray;
      pageObj["visited"] = false;
      pageObj["pageNo"] = this.pageNo++;
      pageObj["nextPage"] = nextPageFlag;
      return pageObj;
  }

  public static appendTypeAheadPageArray(){
    console.log("@appendTypeAheadPageArray : ", 1)
    this.pagesArray.push(this.createPage(false));  
    this.typeAheadStringArray = [];
  }

  public static getPageArray(){
    return this.pagesArray;
  }

  public static appendTypeAheadStringArray(event) {
    console.log("Event @ appendTypeAheadStringArray : ", event)
    let implicitTabFlag = false;
    if (event.code == GXUtils.IMPLICITTAB) {
        this.typeAheadStringArray.push(this.createWord());
        implicitTabFlag = true;
        this.setImplicitFlag(true);
    } else if (event.code == GXUtils.TAB) {
        this.typeAheadStringArray.push(this.createWord());
        implicitTabFlag = false;
    } else if (event.code == GXUtils.ENTER || event.key == GXUtils.NUMPADENTER) {
        implicitTabFlag = false;
        this.typeAheadStringArray.push(this.createWord());
        this.pagesArray.push(this.createPage(true));
        this.fieldOrder = 0;
        this.typeAheadStringArray = [];
    }
    if (implicitTabFlag) {
      console.log("@implicit tab ", 2)
      this.pagesArray.push(this.createPage(false));
      this.typeAheadStringArray = [];
      implicitTabFlag = false;
    }
    this.typeAheadCharacterArray = [];
  }

  public static getImplicitFlag(){
    return this.implicitFlag;
  }

  public static setImplicitFlag(value){
    this.implicitFlag = value;
  }

  public static MACRO_BASE_URL = "http://localhost:2380/";
  public static GET_MACROLIST_URL = "applinx/rest/macro/list";
  public static MACRO_URL = "applinx/rest/macro";

  public static MACRO = {
    play : "Play Macro",
    record : "Record Macro",
    view: "View Macro",
    remove: "Remove Macro",
    stop: "Stop Record Macro"
  }
  public static MACRO_FILE_ALREADY_EXISTS = "File already exists";
}
