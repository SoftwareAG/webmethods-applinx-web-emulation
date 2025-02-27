import { Injectable, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ModalService } from 'carbon-components-angular/modal';
import { GXUtils } from '../../utils/GXUtils'
  
@Injectable(
    {    providedIn: 'root'  } // This makes it available application-wide
      )
export class SharedService {
   private dataSubject = new BehaviorSubject<any>(null);
   public data$ = this.dataSubject.asObservable();
   public macroRecordFlag = false;
   public macroRecordArray: any = [];
   public macroName: string;
   public macroDetails: any;
   public macroObj: any = {};
   public macroSaveSubscription: Subscription;
   public applicationName: string = "";
   public snackBarReference : any;
   public snackBarFlag : boolean = false;
   public snackBarRef: any;
   public popUpFlag: boolean = false;
   public playMacroFlag : boolean = false;
   public macroFlag: boolean = false;
   public macroRecordCompleteFlag : boolean = false;
   public validationObj ={
      "user" :"",
      "token":"",
      "appName": "" 
   }

   cdsToastFlag: any;
   @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;

   constructor(protected modalService: ModalService ) { }
   // setSharedData(data: any) {
   //    this.sharedData = data;
   // }

   // getSharedData(): any {
   //    return this.sharedData;
   // }

   // setUpdatedData(updatedData: any) {
   //    this.updatedData = updatedData;
   // }

   // getUpdatedData(): any {
   //    return this.updatedData;
   // }

   // setRecMacroTitle(data: any) {
   //    this.recMacroTitle = data;
   // }

   // getRecMacroTitle(): any {
   //    return this.recMacroTitle;
   // }

   // sendData(data: any) {
   //    this.dataSubject.next(data);
   // }

   setCdsToastFlag(flag){
      this.cdsToastFlag = flag;
   }
   getCdsToastFlag(){
      return this.cdsToastFlag;
   }
   setMacroRecordFlag(flag : boolean) {
      this.macroRecordFlag = flag;
   }

   getMacroName(){
      return this.macroName;
   }

   setMacroDetails(name) {
      this.macroDetails = name;
      this.macroName = this.macroDetails["txtRecordMacro"];
   }
/*
   renameMacroRecording(name) {
      console.log("@shared Service : ", name )
      this.macroName = name.txtRenameMacro;
      this.stopMacroRecording(this.applicationName);
   }

   stopMacroRecording(applicationName: string) {
      this.applicationName = applicationName;
      let tempUserName = sessionStorage.getItem('userName');
      let userName = tempUserName.substr(1, tempUserName.length - 2);
      // this.macroObj["simulateDelay"] = this.macroDetails.chkboxSimulateDelay;
      this.macroObj["steps"] = this.macroRecordArray;
      let token = this.storageService.getAuthToken();
      // if (this.macroName) {
         this.macroSaveSubscription = this.macroService
            .saveMacro(this.macroObj, this.macroName + ".json", userName, applicationName, token)
            .subscribe(response => {
               console.log("Save Response : ", response)
               this.macroRecordArray = [];
               return response;
            
            /*   const toastContent = {
                  type: 'info', // or 'error', 'success', 'warning'
                  title: 'Information',
                  subtitle: 'This is a toast message!',
                  caption: 'Additional details can go here.'
              };
              this.notificationDisplayService.show(toastContent); */
              // this.setCdsToastFlag(this.macroName);
               /*
               this.notificationService.showToast({
                  title: 'Delete Macro',
                  caption: "The Macro " + this.macroName + " has been saved successfully!",
                  // duration: 500000, // Duration in milliseconds (optional)
                  type: 'success',
                  //showClose: false,
                  // className :"toast-position"
                });
                

            //   alert('The Macro '+this.macroName+ ' is saved successfully!')
               //this.openSnackBar("The Macro '" + this.macroName + "' is Successfully Created")
               // this.snackBarRef = this._snackBar.open("The Macro '" + this.macroName + "' is Successfully Created", "OK",
               // {
               //    //    duration: 3000,
               //    horizontalPosition: "right",
               //    verticalPosition: "top"
               // });
               // this.setSnackBarRef(this.snackBarRef);
            //   this.notificationService.showToast({
            //       title: 'Save Macro', caption: '', subtitle: 'The Macro '+this.macroName+ ' is saved successfully!',
            //       message: 'The Macro '+this.macroName+ ' is saved successfully!',
            //       duration: 500000, // Duration in milliseconds (optional)
            //       type: 'info',
            //       //showClose: false,
            //       // className :"toast-position"
            //     }); 
            },
               err => {
                  console.log(err);
                  let errorMsg = err.error.message;
                  if (errorMsg == GXUtils.MACRO_FILE_ALREADY_EXISTS) {
                     console.log(this.macroObj, this.macroName + ".json", userName, token)
                     // const factory = this.componentFactoryResolver.resolveComponentFactory(MacroComponent);
                     // const reference = this.container.createComponent(factory);
                     // (reference.instance as MacroComponent).operationType = GXUtils.RenameMacro;
                     this.setPopUpFlag(true);
                     this.setCdsToastFlag(GXUtils.MACRO_FILE_ALREADY_EXISTS);
                     //this.setMacroRecordCompleteFlag(false);
                     // let paramType = GXUtils.RenameMacro;
                     // this.snackBarRef  = this.matDialog.open(MacroComponent,
                     //    {
                     //       data: { paramType },
                     //       height: 'auto',
                     //       width: '40%',
                     //    });
                     // this.setSnackBarRef(this.snackBarRef);
            /*         this.notificationService.showToast({
                        title: 'Save Macro', caption: '', subtitle: 'An Unexpected error has occured while saving the Macro',
                        message: '',
                        duration: 500000, // Duration in milliseconds (optional)
                        type: 'error',
                        //showClose: false,
                        // className :"toast-position"
                      }); 
                  }
               });
           //    return  Observable<any> this.macroSaveSubscription;
   }
*/
   getMacroRecordFlag() {
      return this.macroRecordFlag;
   }

   recordMacro(sendKeysRequest) {
      let fieldsList = sendKeysRequest.fields;
      let passwordFieldList = document.querySelectorAll("input[type='password']") 

      passwordFieldList.forEach(fieldEntry => {
         let pwdField = fieldsList.filter(item => item.name == fieldEntry["name"])[0];
         if(pwdField){
            pwdField["type"] = GXUtils.pwdText;
            pwdField["value"] = window.btoa(pwdField["value"]);
         }
      })

      let obj = {};
   //   obj["fields"] = fieldsList; // sendKeysRequest.fields;
      obj["fields"] = sendKeysRequest.fields;
      obj["sendKey"] = sendKeysRequest.sendKey;
      obj["cursor"] = sendKeysRequest.cursor;
      obj["screenSize"] = sendKeysRequest.screenSize;
//      console.log("Object while Save : ", obj);
      this.macroRecordArray.push(obj);
   }

   clearMacroObj(){
      this.macroRecordArray = [];
      this.macroObj = {}
   }
   
   getMacroSteps(){
      return this.macroRecordArray;
   }

//   setSnackBarRef(snackBarRef){
//    this.snackBarReference = snackBarRef;
//    this.snackBarFlag = true;
//  }

 closeSnackBar(){
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

 setPlayMacroFlag(flag){
   this.playMacroFlag = flag;
 }

 getPlayMacroFlag(){
   return this.playMacroFlag;
 }

//  setMacroPopUpFlag(flag){
//    this.macroFlag = flag;
//  }

//  getMacroPopUpFlag(){
//    return this.macroFlag;
//  }


setMacroValidationDetails(obj: any){
   this.validationObj = obj;
}

getMacroValidationDetails(){
   return this.validationObj
}

}