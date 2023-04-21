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

import { Position } from "@softwareag/applinx-rest-apis";

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
    
}
