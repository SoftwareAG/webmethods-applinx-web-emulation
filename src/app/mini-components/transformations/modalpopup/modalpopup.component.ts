import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Clipboard} from '@angular/cdk/clipboard';
import { GXUtils } from 'src/utils/GXUtils';

@Component({
  selector: 'app-modalpopup',
  templateUrl: './modalpopup.component.html',
  styleUrls: ['./modalpopup.component.css']
})
export class ModalpopupComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private clipboard: Clipboard) { }
  printFlag: boolean = false;
  copyInstruction: string = GXUtils.copyInstruction;
  copyInstruction_bgcolor: string = GXUtils.copyInstruction_bgcolor;
  selection: any;
  copiedText: any = [];
  displayString : any = ``;
  widget: any;
  mouseDownPrintX: any;
  mouseDownPrintY: any;
  mouseUpPrintX: any;
  mouseUpPrintY: any;
  mouseDownOffsetX: any;
  mouseDownOffsetY: any;
  mouseUpOffsetX: any;
  mouseUpOffsetY: any;
  mouseMovePrintX: any;
  mouseMovePrintY: any;
  length : any;
  height : any;
  left: any;
  top: any;
  ismousedown = false;
  copyFlag : boolean;

  ngOnInit(): void {
    this.copyFlag = GXUtils.getCopyFlag();
    this.initCall();
  }

  initCall(){
    document.getElementById("copyDiv").innerHTML = this.data.content;
    this.printFlag = this.data.typeFlag;
    let elementList = document.querySelectorAll("[id='gx_text']");
    elementList.forEach(element => {
      element.classList.add("copyTextCss");
    })
  }
  // handleKeyDown(event){
  //   if (event.ctrlKey && event.keyCode == 67){
  //     console.log("handleKeyDown....", event);
  //     this.clipboard.copy(this.copiedText.toString().replaceAll(",","\n"));
  //   }
  // }

  print() {
    window.print();
  }

  close() {
  }

  handleMouseDown(event){
    this.initCall();
    document.getElementsByClassName("selWidgetClass").length>0?document.getElementsByClassName("selWidgetClass")[0].remove():"";
    this.mouseDownPrintX = event.pageX;
    this.mouseDownPrintY = event.pageY;
    this.mouseDownOffsetX = event.offsetX;
    this.mouseDownOffsetY = event.offsetY;

    if (event.currentTarget.id == "copyDiv"){
      let divElement = document.createElement("div");
      divElement.id = "selWidget";
      divElement.className = "selWidgetClass";
      document.getElementById("copyDiv").append(divElement);
      let index = document.getElementsByClassName("selWidgetClass").length - 1
      this.widget = document.getElementsByClassName("selWidgetClass")[index]
      this.ismousedown = true;
    }
  }
  
  changeTextBGcolor() {
    let lineArray = document.getElementById("copyDiv").children;
    let lineObjArray = [];
    let startTabIndex = this.selection.anchorNode.parentElement.tabIndex
    let endTabIndex = this.selection.focusNode.parentElement.tabIndex;
    let startIndex = this.selection.anchorOffset;
    let endIndex = this.selection.focusOffset;

    if (startTabIndex>endTabIndex){
      let temp = endTabIndex;
      endTabIndex = startTabIndex;
      startTabIndex = temp;
    }

    if (startIndex>endIndex){
      let temp = endIndex;
      endIndex = startIndex;
      startIndex = temp;
    }
    for (let i = 0; i < lineArray.length; i++) {
      if ((lineArray[i]["tabIndex"] != -1) /*&& (lineArray[i].innerHTML.trim() != "") */ &&
        (lineArray[i]["tabIndex"] >= startTabIndex && lineArray[i]["tabIndex"] <= endTabIndex)) {
          lineObjArray.push({ "tabIndex": lineArray[i]["tabIndex"], "value": lineArray[i].innerHTML })
      }
    }
    this.copiedText.forEach((element, index) => {
      if (element.trim() != "") {
       lineArray[lineObjArray[index].tabIndex].innerHTML = GXUtils.replaceBetween(lineArray[lineObjArray[index].tabIndex].innerHTML,startIndex, endIndex,"<span class='customselect'>"+element+"</span>")
      }
    });
  }

  handleMouseUp(event) {
    
    if (window.getSelection) {                      //only work if supported
      this.selection = window.getSelection();      //get the selection object
      let startIndex = this.selection.anchorOffset;
      let endIndex = this.selection.focusOffset;
      let offset = endIndex>=startIndex?endIndex - startIndex: startIndex - endIndex;
      let selectedLines = this.selection.toString().split("\n");
      let lineCount = selectedLines.length;
      this.copiedText = [];
      this.displayString = ``;
      
      for (let i = 0; i < lineCount; i++) {
        if (i == 0) {
          this.copiedText.push(selectedLines[i].slice(0, offset));
           this.displayString = this.displayString  + selectedLines[i].slice(0, offset) +"\n";
        } else {
          if (endIndex >= startIndex) {
            this.copiedText.push(selectedLines[i].slice(startIndex, endIndex));
            this.displayString = this.displayString  + selectedLines[i].slice(startIndex, endIndex) +"\n";
          } else {
            this.copiedText.push(selectedLines[i].slice(endIndex, startIndex));
            this.displayString = this.displayString  + selectedLines[i].slice(endIndex,startIndex) +"\n";
        }
      }
    }
    } 
    this.changeTextBGcolor();
    this.clipboard.copy(this.displayString)
  }
}

export interface DialogData {
  content: string,
  typeFlag: boolean
}



