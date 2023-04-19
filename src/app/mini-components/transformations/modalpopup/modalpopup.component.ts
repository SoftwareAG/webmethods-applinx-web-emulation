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
  copiedText: any = [];
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

  ngOnInit(): void {
    document.getElementById("copyDiv").innerHTML = this.data.content;
    this.printFlag = this.data.typeFlag;
    let elementList = document.querySelectorAll("[id='gx_text']");
    elementList.forEach(element => {
      element.classList.add("copyTextCss");
    })
  }

  handleKeyDown(event){
    if (event.ctrlKey && event.keyCode == 67){
      console.log("handleKeyDown....", event);
      this.clipboard.copy(this.copiedText.toString().replaceAll(",","\n"));
    }
  }

  print() {
    window.print();
  }

  close() {
  }

  handleMouseDown(event){
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
  
  handleMouseUp(event) {
    if (window.getSelection) {                      //only work if supported
      var selection = window.getSelection();      //get the selection object
      let startIndex = selection.anchorOffset;
      let endIndex = selection.focusOffset;
      let offset = endIndex>=startIndex?endIndex - startIndex: startIndex - endIndex;
      let selectedLines = selection.toString().split("\n");
      let lineCount = selectedLines.length;
      this.copiedText = []
      for (let i = 0; i < lineCount; i++) {
        if (i == 0) {
          this.copiedText.push(selectedLines[i].slice(0, offset));
        } else {
          endIndex>=startIndex?this.copiedText.push(selectedLines[i].slice(startIndex, endIndex)): this.copiedText.push(selectedLines[i].slice(endIndex,startIndex ));
        }
      }
      
    }
    this.ismousedown = false;
    this.mouseUpPrintX = event.pageX;
    this.mouseUpPrintY = event.pageY;
    this.mouseUpOffsetX = event.offsetX;
    this.mouseUpOffsetY = event.offsetY;
    if (this.mouseDownPrintX > this.mouseUpPrintX){
      this.length = this.mouseDownPrintX - this.mouseUpPrintX;
      this.left = this.mouseUpOffsetX;
    }else{
      this.length = this.mouseUpPrintX - this.mouseDownPrintX;
      this.left = this.mouseDownOffsetX;
    }

    if (this.mouseDownPrintY > this.mouseUpPrintY){
      this.height = this.mouseDownPrintY - this.mouseUpPrintY;
      this.top = this.mouseUpOffsetY;
    }else{
      this.height = this.mouseUpPrintY - this.mouseDownPrintY;
      this.top = this.mouseDownOffsetY;
    } 

    this.widget.style.width = this.length +"px";
    this.widget.style.height = this.height +"px";
    this.widget.style.display = 'block';
    this.widget.style.top = this.top+"px";
    this.widget.style.left = this.left+"px";
    this.widget.style.border = '2px dashed #ccc';
    this.widget.style.background = '#bbdd0044';
  }
}

export interface DialogData {
  content: string,
  typeFlag: boolean
}



