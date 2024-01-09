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
  MacroExitsMsg: string;
  macroFileListSubscription: Subscription;
  macroFileViewSubscription: Subscription;
  macroPlaySubscription: Subscription;
  macroDeleteSubscription: Subscription;
  applicationName: string;
  
  @Output() dataEmitter = new EventEmitter<any>();



  constructor(private fileService: ConfigurationService, private macroService: MacroService,
              @Inject(MAT_DIALOG_DATA) public data: any, private userExitsEventThrower: UserExitsEventThrowerService,
              private dataService: SharedService,private _snackBar: MatSnackBar, private storageService: StorageService, private httpClient: HttpClient,
              private matDialog: MatDialog) {
  }

  ngOnInit() {
    console.log(sessionStorage.getItem('userName'));
    this.applicationName = this.fileService.applicationName;
    this.macroListFlag = this.data.viewFlag;
    let tempUserName = sessionStorage.getItem('userName');
    this.getMacroList(tempUserName.substr(1, tempUserName.length-2));
    this.viewMacroFlag = false;
    this.parameter = this.data.paramType;
    switch(this.parameter) {
      case GXUtils.ViewMacro:
        this.viewMacro = true;
        break;
      case GXUtils.DeleteMacro:
        this.delMacro = true;
        break;
      case GXUtils.RecordMacro:
        this.recMacro = true;
        break
      case GXUtils.PlayMacro:
        this.playMacro = true;
        break;
      case GXUtils.RenameMacro:
        this.MacroExitsMsg = GXUtils.MacroExitsMsg
        this.renameMacro = true;
        break;
    }
   // this.recordStop = this.dataService.stopRecord;
  }

  getMacroList(user): any{
    let token = this.storageService.getAuthToken();
    this.macroFileListSubscription = this.macroService
        .getMacro(user, this.applicationName,token)
        .subscribe(data =>{
        console.log(data)
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
                this.openSnackBar("Macro "+selDeleteMacro+" " + response["message"]);
              })
    this.matDialog.closeAll();
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
              this.selectedMacroObj["steps"] = this.selViewMacroContent.steps;
              this.selectedMacroObj["fields"] = this.selViewMacroContent.fields;
              this.viewMacroFlag = true;
    })
  }
 
  onPlayMacro(form){
    console.log(form)
    let selectedMacro = form.value.selPlayMacro+".json";
    let tempUserName = sessionStorage.getItem('userName');
    let userName = tempUserName.substr(1, tempUserName.length-2);
    let token = this.storageService.getAuthToken();
    let playObj = {};
    this.macroFileViewSubscription = this.macroService
            .viewMacro(selectedMacro,userName, this.applicationName, token)
            .subscribe(response =>{
              this.selViewMacroContent = response;
              playObj["steps"] = response["steps"];
              this.macroPlaySubscription = this.macroService
                    .playMacro(playObj,token).subscribe(response =>{
                      console.log("2")
                      console.log(response)
                    },
                    error =>{
                      this.openSnackBar(error.error.message);
                    })
            }
            )
    this.matDialog.closeAll();
  }

  onRecordMacro(form){  // Save Macro
        this.dataService.setMacroRecordFlag();
        this.dataService.setMacroDetails(form.value);
        console.log(form.value);
        this.matDialog.closeAll();
  }

  onRenameMacro(form){
    this.dataService.renameMacroRecording(form.value);
    this.matDialog.closeAll();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message,"Ok",
                      { 
                    //    duration: 3000,
                        horizontalPosition: "right",
                        verticalPosition: "top"
                      });
  }
}


