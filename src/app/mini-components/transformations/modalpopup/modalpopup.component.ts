import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modalpopup',
  templateUrl: './modalpopup.component.html',
  styleUrls: ['./modalpopup.component.css']
})
export class ModalpopupComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }
  printFlag : boolean = false;

  ngOnInit(): void {  
     document.getElementById("copyDiv").innerHTML = this.data.content;
     this.printFlag = this.data.typeFlag;
     let elementList = document.querySelectorAll("[id='gx_text']"); 
     elementList.forEach(element =>{
        element.classList.add("copyTextCss");
     })
  }

  print(){
    window.print();
  }

}

export interface DialogData {
  content: string,
  typeFlag: boolean
}

