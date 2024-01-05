import { ChangeDetectionStrategy,Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GXUtils } from 'src/utils/GXUtils';
import { ConfigurationService } from '../services/configuration.service';
import { SharedService } from '../services/shared.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../services/storage.service';
import { MacroService, PlayMacroRequest } from '@softwareag/applinx-rest-apis';
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
 // userName: string;
 // containterhide= false;

 // textInput: string | any;
  // recordMacro: any;
  // fileList: string[] | any;
  // selectedFile: string | any;
  // fileContent: string | any;
  // obj: any
  parameter: any
  selPlayMacro: any;
  selViewMacro: any;
  selViewMacroContent: any;
  selectedMacroObj: object = {};
  selDeleteMacro: any;
  // inputFields: any;

  // playNullCheck:boolean = false;
  // macroNameNullCheck: boolean = false;
  viewMacroFlag: boolean;
  // deleteNullCheck: boolean = false;
  recordStop: boolean = false;
 // redDotBlink = false; // To control red dot animation
  //macroContent = ['view', 'remove', 'record', 'play'];
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
    // this.displayFiles()
    // this.inputFields = this.dataService;
    // console.log(">>>>>>>>>:",this.inputFields?.sharedData);
    // console.log(">>>>>>>>>:",this.inputFields?.updatedData);
  }

  ngOnInit() {
    console.log(sessionStorage.getItem('userName'));
    this.applicationName = this.fileService.applicationName;
    this.macroListFlag = this.data.viewFlag;
    this.getMacroList( "Vinoth".toLowerCase()); // sessionStorage.getItem('userName').toLowerCase();
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
    // console.log("userName : ", user);
    // console.log("Token : ", this.storageService.getAuthToken());
    let token = this.storageService.getAuthToken();
    // Vinoth
    console.log("Application Name : ",this.fileService.applicationName);
    this.macroFileListSubscription = this.macroService
        .getMacro(user, this.applicationName,token)
        .subscribe(data =>{
        console.log(data)
        data.fileList.forEach(file =>{
          this.macroList.push(file.substring(0, file.length-5))
        })
        //this.macroList = data.fileList;
        console.log("@@@@@@@@@@@@@@ this.macroList ", this.macroList )
        console.log("@@@@@@@@@@@@@@ this.macroListFlag ", this.macroListFlag )

        if (this.macroList.length == 0){
          this.macroListFlag = true;
        }else{
          this.macroListFlag = false;
        }
        console.log(">>>>>>>>>>> this.macroListFlag ", this.macroListFlag )
      })
  }
  
 onDeleteMacro(form) {
    let selDeleteMacro = form.value.selDeleteMacro +".json"
    //console.log("Form : "+ selDeleteMacro);
    let token = this.storageService.getAuthToken();
    let userName = "Vinoth" //sessionStorage.getItem('userName')
    this.macroDeleteSubscription = this.macroService
            //  .deleteMacro(selDeleteMacro+".json",userName,this.applicationName, token)
              .deleteMacro(selDeleteMacro,userName,this.applicationName, token)
              .subscribe(response=>{
                console.log(response);
                this.openSnackBar(form.value.selDeleteMacro+" : " + response["message"]);
              })

    // let options = {
    //   headers: {
    //     Authorization: token        
    //   }
    // }
    // this.httpClient.delete(GXUtils.MACRO_BASE_URL + GXUtils.MACRO_URL+"?fileName="+selDeleteMacro+".json", options).subscribe(data => {
    //   console.log("Macro Details : ", data);
    //   //this.openSnackBar("The Selected Macro '"+selDeleteMacro+"' is Successfully Deleted")
    //   this.openSnackBar(selDeleteMacro+" : " + data["message"]);
    //   //this.selViewMacroContent = data; deleteFile
    // })
    
    this.matDialog.closeAll();
  } 
  

  onViewMacro(form) {
    console.log("Form : ", form);
    let selViewMacro = form.value.selViewMacro+".json";
    let userName = "Vinoth" //sessionStorage.getItem('userName')
    console.log("File Name : ", selViewMacro )
    let token = this.storageService.getAuthToken();
    console.log("TOKEN_GEN:", token);
    // this.viewMacroFlag = true;
    this.macroFileViewSubscription = this.macroService
            .viewMacro(selViewMacro,userName, this.applicationName, token)
            .subscribe(response =>{
              console.log("Response", response)
              this.selViewMacroContent = response;
    // this.selViewMacroContent = {"name":"macro1","steps":[{"key":"[enter]","order":1},{"cursor":{"row":1,"col":10},"key":"[enter]","order":2,"inputfield":[{"fieldname":"UserID","value":"testuser","position":{"column":23,"row":14}},{"fieldname":"Password","value":"testuser","position":{"column":23,"row":15}}]},{"key":"[enter]","order":3},{"cursor":{"row":1,"col":10},"key":"[enter]","order":4,"inputfield":[{"fieldname":"P[(8,13)]","value":"testuser2","position":{"column":8,"row":13}},{"fieldname":"P[(8,23)]","value":"testuser3","position":{"column":8,"row":23}}]}]};
              this.selectedMacroObj["name"] = this.selViewMacroContent.name;
              this.selectedMacroObj["steps"] = this.selViewMacroContent.steps;
              this.selectedMacroObj["fields"] = this.selViewMacroContent.fields;
              this.viewMacroFlag = true;
              console.log(JSON.stringify(this.selViewMacroContent));
              console.log("steps",this.selectedMacroObj["steps"]);
              console.log(this.viewMacroFlag)
    })

    // let options = {
    //   headers: {
    //     Authorization: token        
    //   },
    // }
    // this.httpClient.get(GXUtils.MACRO_BASE_URL + GXUtils.MACRO_URL+"?fileName="+selViewMacro+".json", options).subscribe(data => {
    //   console.log("Macro Details : ", data)
    //   this.selViewMacroContent = data;
    // })

    // this.viewMacroFlag = true;
    // this.selViewMacroContent = {"macro":{"name":"macro1","steps":[{"sendKey":"[enter]","order":1},{"cursor":{"row":1,"col":10},"sendKey":"[enter]","order":2,"inputfield":[{"fieldname":"UserID","value":"testuser","position":{"column":23,"row":14}},{"fieldname":"Password","value":"testuser","position":{"column":23,"row":15}}]},{"sendKey":"[enter]","order":3},{"cursor":{"row":1,"col":10},"sendKey":"[enter]","order":4,"inputfield":[{"fieldname":"P[(8,13)]","value":"testuser2","position":{"column":8,"row":13}},{"fieldname":"P[(8,23)]","value":"testuser3","position":{"column":8,"row":23}}]}]}};
    // this.selectedMacroObj["name"] = this.selViewMacroContent.macro.name;
    // this.selectedMacroObj["steps"] = this.selViewMacroContent.macro.steps;
    //           console.log(JSON.stringify(this.selViewMacroContent));
    //           console.log("steps",this.selectedMacroObj["steps"]);
    //           console.log(this.viewMacroFlag)
    // this.matDialog.closeAll();
  }
 
  onPlayMacro(form){
    console.log(form)
    let selectedMacro = form.value.selPlayMacro+".json";
    let macroContent 
    let userName = "Vinoth" //sessionStorage.getItem('userName')
    console.log("File Name : ", selectedMacro )
    let token = this.storageService.getAuthToken();
    console.log("TOKEN_GEN:", token);
    let playObj = {};
    //playObj["userName"] = userName;
    // playObj["name"] = selectedMacro;
    
    //playObj["userName"] = 
    this.macroFileViewSubscription = this.macroService
            .viewMacro(selectedMacro,userName, this.applicationName, token)
            .subscribe(response =>{
              console.log("1")
              this.selViewMacroContent = response;
              console.log("Play Macro response : ", this.selViewMacroContent);
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
            console.log("this.selViewMacroContent @ play: ", this.selViewMacroContent);
    
    this.matDialog.closeAll();
  }

  onRecordMacro(form){  // Save Macro
      // let newMacroName =form.value.txtRecordMacro.trim();
      // if(this.macroList.indexOf(newMacroName) != -1){
      //   this.openSnackBar("This Macro Name already exists, Please select a new Macro Name.");
      // }else{
        this.dataService.setMacroRecordFlag();
        this.dataService.setMacroDetails(form.value);
        console.log(form.value);
        this.matDialog.closeAll();
      // }

  }

  onRenameMacro(form){
    console.log(form.value);
   // this.dataService.setMacroRecordFlag();
    this.dataService.renameMacroRecording(form.value);
    this.matDialog.closeAll();
   // this.changeRecColor = this.dataService.getMacroRecordFlag();
 
  }

  // stopMacroRecording(){
  //   alert("Stop recording me.....")
  // }

  openSnackBar(message: string) {
    this._snackBar.open(message,"Ok",
                      { 
                    //    duration: 3000,
                        horizontalPosition: "right",
                        verticalPosition: "top"
                      });
  }
}


