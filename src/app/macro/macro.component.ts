import { ChangeDetectionStrategy,Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GXUtils } from 'src/utils/GXUtils';
import { ConfigurationService } from '../services/configuration.service';
import { SharedService } from '../services/shared.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../services/storage.service';
import { MacroService } from '@softwareag/applinx-rest-apis';
import { Subscription } from 'rxjs';
import { UserExitsEventThrowerService } from '../services/user-exits-event-thrower.service';

@Component({
  selector: 'app-macro',
  templateUrl: './macro.component.html',
  styleUrls: ['./macro.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})

export class MacroComponent {
  getMacroSubscription: Subscription;
  marcoName: string | undefined;
  macroList: any = [];
  macroListFlag : boolean = false;
  parameter: any
  selPlayMacro: any;
  selViewMacro: any;
  selViewMacroContent: any;
  selectedMacroObj: object = {};
  selDeleteMacro: any;
  viewMacroFlag: boolean;
  recordStop: boolean = false;
  viewMacro: boolean;
  delMacro: boolean;
  recMacro: boolean;
  playMacro: boolean;
  renameMacro: boolean;
  dupMacroFlag : boolean;
  MacroExitsMsg: string;
  macroFileListSubscription: Subscription;
  macroFileViewSubscription: Subscription;
  macroPlaySubscription: Subscription;
  macroDeleteSubscription: Subscription;
  applicationName: string;
  snackBarRef: any;
  macroErrorMsg = {
    "mandatory" : GXUtils.MACRO_NAME_IS_MANDATORY_MSG,
    "pattern" : GXUtils.MACRO_NAME_PATTERN_MSG,
    "duplicate" : GXUtils.MACRO_NAME_DUPLICATE_MSG,
    "notAvailable": GXUtils.MACRO_NOT_AVAILABLE
  }
  
  @Output() dataEmitter = new EventEmitter<any>();



  constructor(private fileService: ConfigurationService, private macroService: MacroService,
              @Inject(MAT_DIALOG_DATA) public data: any, private userExitsEventThrower: UserExitsEventThrowerService,
              private dataService: SharedService,private _snackBar: MatSnackBar, private storageService: StorageService, private httpClient: HttpClient,
              private matDialog: MatDialog) {
  }

  ngOnInit() {
    this.applicationName = this.fileService.applicationName;
    this.macroListFlag = this.data.viewFlag;
    let tempUserName = sessionStorage.getItem('userName');
    // this.getMacroList(tempUserName.substr(1, tempUserName.length-2));
    this.viewMacroFlag = false;
    this.parameter = this.data.paramType;
    
    switch(this.parameter) {
      case GXUtils.ViewMacro:
        this.getMacroList(tempUserName.substr(1, tempUserName.length-2));
        this.viewMacro = true;
        break;
      case GXUtils.DeleteMacro:
        this.getMacroList(tempUserName.substr(1, tempUserName.length-2));
        this.delMacro = true;
        break;
      case GXUtils.RecordMacro:
        this.recMacro = true;
        break
      case GXUtils.PlayMacro:
        this.getMacroList(tempUserName.substr(1, tempUserName.length-2));
        this.playMacro = true;
        break;
      case GXUtils.RenameMacro:
        this.MacroExitsMsg = GXUtils.MacroExitsMsg
        this.renameMacro = true;
        this.dupMacroFlag = true;
        this.dataService.setPopUpFlag(true);
        break;
    }
   // this.recordStop = this.dataService.stopRecord;
  }

  getMacroList(user): any{
    let token = this.storageService.getAuthToken();
    this.macroFileListSubscription = this.macroService
        .getMacro(user, this.applicationName,token)
        .subscribe(data =>{
        data.fileList.forEach(file =>{
          this.macroList.push(file.substring(0, file.length-5))
        })
          if (this.macroList.length == 0){
          this.macroListFlag = true;
        }else{
          this.macroListFlag = false;
        }
      })
  }
  
 onDeleteMacro(form) {
    let selDeleteMacro = form.value.selDeleteMacro;
    let token = this.storageService.getAuthToken();
    let tempUserName = sessionStorage.getItem('userName');
    let userName = tempUserName.substr(1, tempUserName.length-2);
    this.macroDeleteSubscription = this.macroService
              .deleteMacro(selDeleteMacro +".json",userName,this.applicationName, token)
              .subscribe(response=>{
                console.log(response);
                this.snackBarRef = this._snackBar.open("Macro "+selDeleteMacro+" " + response["message"],"OK",
                      { 
                        horizontalPosition: "right",
                        verticalPosition: "top"
                      });
                this.dataService.setSnackBarRef(this.snackBarRef);
              });
              
    this.matDialog.closeAll();
    
    // event.preventDefault();  
  } 
  
  onViewMacro(form) {
    let selViewMacro = form.value.selViewMacro+".json";
    let tempUserName = sessionStorage.getItem('userName');
    let userName = tempUserName.substr(1, tempUserName.length-2);
    let token = this.storageService.getAuthToken();
    this.macroFileViewSubscription = this.macroService
            .viewMacro(selViewMacro,userName, this.applicationName, token)
            .subscribe(response =>{
              this.selViewMacroContent = response;
              this.selectedMacroObj["name"] = this.selViewMacroContent.name;
              this.setPasswordMask(this.selViewMacroContent.steps)
              this.selectedMacroObj["steps"] = this.selViewMacroContent.steps;
             // this.selectedMacroObj["fields"] = this.selViewMacroContent.fields;
              this.viewMacroFlag = true;
    })
  }

  setPasswordMask(stepsArray){
    stepsArray.forEach(element => {
      if(element.fields && element.fields.length>0){
        let fieldsList = element.fields;
        fieldsList.forEach(field => {
          if(field.type && field.type == GXUtils.pwdText){
            field.value = window.atob(field.value);
            let typeLength = field.value.length;
            field.value = GXUtils.pwdMask.repeat(typeLength);
          }
        });
      }
    });
  }

  hideDuplicateMsg(){
    this.dupMacroFlag = false;
  }
 
  onPlayMacro(form){
    let selectedMacro = form.value.selPlayMacro+".json";
    let tempUserName = sessionStorage.getItem('userName');
    let userName = tempUserName.substr(1, tempUserName.length-2);
    let token = this.storageService.getAuthToken();
    let playObj = {};
    this.dataService.setPlayMacroFlag(true);
    this.macroFileViewSubscription = this.macroService
            .viewMacro(selectedMacro,userName, this.applicationName, token)
            .subscribe(response =>{
              this.selViewMacroContent = response;
              this.decryptBeforePlay(response["steps"])
              playObj["steps"] = response["steps"];
              this.macroPlaySubscription = this.macroService
                    .playMacro(playObj,token).subscribe(response =>{
                      this.dataService.setPlayMacroFlag(false);
                    },
                    error =>{
                      this.snackBarRef = this._snackBar.open(error.error.message,"OK",
                      { 
                        horizontalPosition: "right",
                        verticalPosition: "top"
                      });
                      this.dataService.setSnackBarRef(this.snackBarRef);
                    })
            }
            )
    this.matDialog.closeAll();
  }

  decryptBeforePlay(steps:any){
    steps.forEach(element => {
      let fieldsList = element.fields
      if (fieldsList.length > 0){
        fieldsList.forEach(fieldElement => {
          if(fieldElement.type && fieldElement.type == GXUtils.pwdText){
            fieldElement.value = window.atob(fieldElement.value)
          }
        });
      }
    });
  }

  onRecordMacro(form){  // Save Macro
        this.dataService.setMacroRecordFlag(true);
        this.dataService.setMacroDetails(form.value);
        console.log(form.value);
        this.matDialog.closeAll();
  }

  onRenameMacro(form){
    this.dataService.setPopUpFlag(false);
    this.dataService.renameMacroRecording(form.value);
    this.matDialog.closeAll();
  }
}