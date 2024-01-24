import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GXUtils } from 'src/utils/GXUtils';
import { StorageService } from './storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MacroService } from '@softwareag/applinx-rest-apis';
import { MatDialog } from '@angular/material/dialog';
import { MacroComponent } from '../macro/macro.component';
// import { ConfigurationService } from '../services/configuration.service';

@Injectable()
export class SharedService {
   private sharedData: any;
   private updatedData: any;
   private recMacroTitle: any;

   private dataSubject = new BehaviorSubject<any>(null);
   public data$ = this.dataSubject.asObservable();
   public macroRecordFlag = false;
   public macroRecordArray: any = [];
   public macroName: string;
   public simulateDelayFlag: boolean;
   public macroDetails: any;
   public macroObj: any = {};
   public macroSaveSubscription: Subscription;
   public applicationName: string = "";
   public snackBarReference : any;
   public snackBarFlag : boolean = false;
   public snackBarRef: any;
   public popUpFlag: boolean = false;

   constructor(private httpClient: HttpClient, private storageService: StorageService, private _snackBar: MatSnackBar,
      private macroService: MacroService, private matDialog: MatDialog,// private fileService: ConfigurationService
   ) { }
   setSharedData(data: any) {
      this.sharedData = data;
   }

   getSharedData(): any {
      return this.sharedData;
   }

   setUpdatedData(updatedData: any) {
      this.updatedData = updatedData;
   }

   getUpdatedData(): any {
      return this.updatedData;
   }

   setRecMacroTitle(data: any) {
      this.recMacroTitle = data;
   }

   getRecMacroTitle(): any {
      return this.recMacroTitle;
   }

   sendData(data: any) {
      this.dataSubject.next(data);
   }

   setMacroRecordFlag(flag) {
      this.macroRecordFlag = flag;
      console.log("Macro Record Flag : ", this.macroRecordFlag)
   }

   setMacroDetails(name) {
      this.macroDetails = name;
      this.macroName = this.macroDetails["txtRecordMacro"];
   }

   renameMacroRecording(name) {
      this.macroName = name.txtRenameMacro;
      this.stopMacroRecording(this.applicationName);
   }

   stopMacroRecording(applicationName) {
      this.applicationName = applicationName;
      let tempUserName = sessionStorage.getItem('userName');
      let userName = tempUserName.substr(1, tempUserName.length - 2);
      // this.macroObj["simulateDelay"] = this.macroDetails.chkboxSimulateDelay;
      this.macroObj["steps"] = this.macroRecordArray;
      console.log(this.macroObj);
      let token = this.storageService.getAuthToken();
      // if (this.macroName) {
         this.macroSaveSubscription = this.macroService
            .saveMacro(this.macroObj, this.macroName + ".json", userName, applicationName, token)
            .subscribe(response => {
               console.log(response);
               this.macroRecordArray = [];
               //this.openSnackBar("The Macro '" + this.macroName + "' is Successfully Created")
               this.snackBarRef = this._snackBar.open("The Macro '" + this.macroName + "' is Successfully Created", "OK",
               {
                  //    duration: 3000,
                  horizontalPosition: "right",
                  verticalPosition: "top"
               });
               this.setSnackBarRef(this.snackBarRef);
            },
               err => {
                  console.log(err);
                  let errorMsg = err.error.message;
                  if (errorMsg == GXUtils.MACRO_FILE_ALREADY_EXISTS) {
                     console.log(this.macroObj, this.macroName + ".json", userName, token)
                     let paramType = GXUtils.RenameMacro;
                     this.snackBarRef  = this.matDialog.open(MacroComponent,
                        {
                           data: { paramType },
                           height: 'auto',
                           width: '40%',
                        });
                     this.setSnackBarRef(this.snackBarRef);
                  }
               });
      // }else{
      //    console.log("Macro Name @ Else : ", this.macroName);
      //    console.log("Macro Obj @ Else : ", this.macroObj);
      // }
   }

   getMacroRecordFlag() {
      return this.macroRecordFlag;
   }

   recordMacro(sendKeysRequest) {
      console.log(sendKeysRequest);
      console.log(sendKeysRequest.sendKey)
      console.log(sendKeysRequest.fields)

      let obj = {};
      obj["fields"] = sendKeysRequest.fields;
      obj["sendKey"] = sendKeysRequest.sendKey;
      obj["cursor"] = sendKeysRequest.cursor;
      obj["screenSize"] = sendKeysRequest.screenSize;
      console.log("Object while Save : ", obj);
      this.macroRecordArray.push(obj);
   }

   clearMacroObj(){
      this.macroRecordArray = [];
      this.macroObj = {}
   }
   
  setSnackBarRef(snackBarRef){
   console.log("@ Storage Service - setSnackBarRef : ", snackBarRef)
   this.snackBarReference = snackBarRef;
   this.snackBarFlag = true;
 }

 closeSnackBar(){
   console.log("@ Storage Service : ", this.snackBarReference)
   this.snackBarReference.dismiss();
 }

 isSnackBarPresent(){
   return this.snackBarFlag;
 }

 setPopUpFlag(flag){
   this.popUpFlag = flag;
 }

 getPopUpFlag(){
   return this.popUpFlag;
 }
}