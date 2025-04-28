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
export enum GXConst {
  APPLINX = 'applinx',
  LDAP = 'ldap',
  OPEN_ID_CONNECT = 'oidc',
  NATURAL = 'hostAuth',
  DISABLED = 'disabled'
}

export enum GXEventType{
  /** init */
   INIT = "init",
  
  /** load */
   LOAD = "load",
  
  /** unload */
   UNLOAD = "unload",
  
  /** b4 unload */
   BEFORE_UNLOAD = "beforeunload",
  
  /** focus */
   FOCUS = "focus",
   BLUR = "blur",
   CHANGE = "change",
  
   KEYDOWN = "keydown",
   KEYPRESS = "keypress",
   KEYUP = "keyup",
   HELP = "help",
   CLICK = "click",
   DOUBLE_CLICK = "dblclick",
   SELECT_START = "selectstart",
   PASTE = "paste",
  
   POSTBACK = "postback",
  
   INPUT = "input",
   SELECT = "select"
}

export enum GXReservedTags{
   ACTION_KEY 		  = "GX_ActionKey",
   PATH_NAME 			  = "GX_Path",
   CURSOR_POSITION 	  = "GX_CursorPos",
   CARET_POSITION 	  = "GX_CaretPos",
   FONT_SIZE_BY_RES 	  = "GX_fontByRes",
   SCREEN_AREA  		  = "gx_screenArea",
   HOSTKEY_BUTTON 	  = "gx_HostKey",
   COLORS_CSS 		  = "gx_colorsCss",

   CSS_NAME_DISPLAY	  = "gx_css_name",
   FONT_SIZE_DISPLAY	  = "gx_font_size_tag",

   DIRTY_FIELDS 		  = "GX_ChangedFields",
   SEQ_SCREEN_NUMBER 	  = "GX_SeqScreenNumber",

   PREVIOUS_LOAD_TIME   = "GX_PrevLoadTime",
   SUBMIT_TIME 		  = "GX_SubmitTime",
   DOWNLOAD_TIME 		  = "GX_DownLoadTime",
   WINDOW_FRAME 		  = " windowServiceFrame",
   BLINKING_CARET		  = "gx_caret",

   SCREEN_DIRECTION	  = "GX_Direction",
   SCREEN_DIR_TRG	  	  = "gx_changeDirectionTrigger",
   SCREEN_DIR_BTN		  = "gx_changeDirBtn",
  
   CLASS_FOR_CALC_DIMENSION = "styleForCalc"
  
}

export enum GXKeyCodes{
  BACKSPACE = "8",
   TAB 		  = "9",
   ENTER 		= "13",	
   SHIFT 		= "16",	
   CTRL 		= "17",
   ALT 		  = "18",	
   CAPSLOCK = "20",	
   ESC		  = "27",	
   PAGEUP		= "33",	
   PAGEDOWN	= "34",	
   END 	  	= "35",	
   HOME 		= "36",	
   LEFT 		= "37",
   UP 	  	= "38",
   RIGHT 		= "39",
   DOWN 		= "40",
   PLUS		  = "107",	
   INSERT		= "45",	
   DELETE		= "46",	

   F1  = "112",
   F2  = "113",
   F3  = "114",
   F4  = "115",
   F5  = "116",
   F6  = "117",
   F7  = "118",
   F8  = "119",
   F9  = "120",
   F10 = "121",
   F11 = "122",
   F12 = "123",

   TILDE = "192"
  
   //KEY_CODE_NAME = {13 : "ENTER", 16 : "SHIFT", 17 : "CTRL", 18 : "ALT"}
}
  
export enum GXAdditionalKey{
  NONE  = "0",
  CTRL  = "1",
  ALT   = "2",
  SHIFT = "3"
}

export enum GXObjectTypes{
  STRING = "string",
  FUNCTION = "function",
  NUMBER = "number"
}

export enum GXPages{
  container = "z_container.",
  logoff = "logoff.",
  printScreen = "printScreen.",
  macroDialog = "z_emulationDialogs/z_macroDialog.",
  resourceReader = "z_resourceReader.",
  slider = "z_slider.",
  keyboardMappings = "z_keyboardMappings.",
  seqNumber = "z_screenSeqNumber.",
}

export enum GXModules{
  ENGINE = "z_engine.js",
  EMULATOR = "z_emulator.js",
  WINDOWS = "z_window.js",
  TYPE_AHEAD = "z_typeAhead.js",
  COMPATIBILITY = "z_compatibility.js",
  NDT = "z_ndt.js",
  JAPANESE = "z_japanese.js",
  TABLES = "z_tables.js",
  CALENDAR = "z_calendar.js",
  JS_FUNCS = "z_jsFuncs.js"
}

export enum GXEngineConstants{
  MAIN_WINDOW_PREFIX = "gxmain",
  CHILD_WINDOW_PREFIX = "gxwindow" 
}
