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
import { Injectable } from '@angular/core';
import { Position, Size } from '@softwareag/applinx-rest-apis';
import { StorageService } from '../storage.service';
import { NavigationService } from './navigation.service';

export enum ARROWS {
  DOWN = 'ArrowDown',
  UP = 'ArrowUp',
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  TAB = 'Tab'
}

@Injectable({
  providedIn: 'root'
})
export class TabAndArrowsService {

  public arrowsEnum: Set<string> = new Set(Object.values(ARROWS));

  private elements: HTMLElement[]; // sorted by tabbing order (LTR/RTL).
  private navigationMatrix: number[][];
  private matrixPosition: Position; // cursor position.

  constructor(private storageService: StorageService) { }

  // Returns true if event has handled
  handleArrows(event: KeyboardEvent): boolean {
    if (!this.arrowsEnum.has(event.key)) {
      return false;
    }
    const gp = new GridPosition(event.target as any);
    const key = event.key
    if ((gp.isRadio && (key === ARROWS.RIGHT || key === ARROWS.LEFT)) || 
             (gp.isComboBox && (key === ARROWS.UP || key === ARROWS.DOWN))) {
      return false;
    }
    if (this.elements.length === 0) {
      return true;
    }

    let moved = false;
    const isTypingRTL = this.storageService.getLanguage().typingDirectionRTL;
    const isTabbingRTL = this.storageService.getLanguage().tabDirectionRTL;
    switch (key) {
      case ARROWS.UP: {
        moved = this.moveUp();
        break;
      }
      case ARROWS.DOWN: {
        moved = this.moveDown();
        break;
      }
      case ARROWS.TAB: {
        if (event.shiftKey) {
          moved = this.handleShiftTab();
        } else {
          moved = this.handleTab();
        }
        break;
      }
      case ARROWS.LEFT: {
        const t = event.target;
        if (t instanceof HTMLInputElement && ((!isTypingRTL && t.selectionStart !== 0) || 
           (isTypingRTL && t.selectionStart !== t.value.length))) {
          moved = false;
        } else if (isTabbingRTL) {
          moved = this.handleTab();
        } else {
          moved = this.handleShiftTab();
        }
        break;
      }
      case ARROWS.RIGHT: {
        const t = event.target;
        if (t instanceof HTMLInputElement && ((!isTypingRTL && t.selectionStart !== t.value.length) ||
           (isTypingRTL && t.selectionStart !== 0))) {
          moved = false;
        } else if (isTabbingRTL) {
          moved = this.handleShiftTab();
        } else {
          moved = this.handleTab();
        }
        break;
      }
      default: {
        break;
      }
    }
    return moved;
  }

  findCurrentElementIndex() : number {
    let index = this.getIndex();
    if (index >= 0) {
      return index;
    }

    const currentRow = this.matrixPosition.row;
    /*I start the search from this location because 2 reasons:
    1.) we get to this method only after we know that there wasn't a value in the current matrixPosition , no need to check again.
    2.) More importent, when the cursor is after the last element the column is bigger than the column matrix and this matrix[currentRow][j] 
        will return ArrayOutOfboundsException. */  
    const startingColumn = this.matrixPosition.column - 1;
    const matrix = this.navigationMatrix;
    for (let j = startingColumn; j >= 0; j--) {
      if (matrix[currentRow][j] !== -1) {
        return matrix[currentRow][j];
      }
    }
    return -1;

  }

  handleTab(): boolean {
   

    const moved = this.setFocus(this.findCurrentElementIndex() + 1);
    return moved ? moved : this.setFocus(0);
  }

  handleShiftTab(): boolean {
    const moved = this.setFocus(this.findCurrentElementIndex() - 1);
    return moved ? moved : this.setFocus(this.elements.length - 1);
  }

  moveUp(): boolean {
    const currentRow = this.matrixPosition.row;
    const currentColumn = this.matrixPosition.column;
    const isRTL = this.storageService.getLanguage().tabDirectionRTL;
    const matrix = this.navigationMatrix;

    if (matrix[currentRow - 1][currentColumn] !== -1) {
      return this.setFocus(matrix[currentRow - 1][currentColumn]);
    } else if (currentRow <= 1) {
      // should move to last row cause we in the first row.
      return this.scanUp(isRTL, matrix.length - 1, currentColumn);
    } else {
      return this.scanUp(isRTL, currentRow, currentColumn);
    }
  }

  moveDown(): boolean {
    const currentRow = this.matrixPosition.row;
    const currentColumn = this.matrixPosition.column;
    const isRTL = this.storageService.getLanguage().tabDirectionRTL;
    const matrix = this.navigationMatrix;

    if (matrix[currentRow + 1][currentColumn] !== -1) {
      return this.setFocus(matrix[currentRow + 1][currentColumn]);
    } else if (currentRow === (matrix.length - 1)) {
      // should move to next from row 0 cause we in the last row.
      return this.scanDown(isRTL, 0, currentColumn);
    } else {
      return this.scanDown(isRTL, currentRow, currentColumn);
    }
  }

  scanDown(isRTL: boolean, row: number, column: number): boolean {
    let moved = false;
    let i = 1;

    while (!moved) {
      if (row + i >= this.navigationMatrix.length) {
        row = 1;
        i = 0;
      }
      if (isRTL) {
        moved = this.scanLeftFirst(row + i, column);
      } else {
        moved = this.scanRightFirst(row + i, column);
      }
      i++;
    }
    return moved;
  }

  scanUp(isRTL: boolean, row: number, column: number): boolean {
    let moved = false;
    let i = -1;

    while (!moved) {
      if (row + i < 0) {
        row = this.navigationMatrix.length - 1;
        i = 0;
      }
      if (isRTL) {
        moved = this.scanRightFirst(row + i, column);
      } else {
        moved = this.scanLeftFirst(row + i, column);
      }
      i--;
    }
    return moved;
  }

  scanLeftFirst(row: number, column: number): boolean {
    const moved = this.scanLeft(row, column);
    return moved ? moved : this.scanRight(row, column);
  }

  scanRightFirst(row: number, column: number): boolean {
    const moved = this.scanRight(row, column);
    return moved ? moved : this.scanLeft(row, column);
  }

  // return true if managed to move left
  scanRight(row: number, column: number): boolean {
    const matrix = this.navigationMatrix;
    if (row >= matrix.length || row <= 0) {
      return false;
    }

    for (let j = column; j < matrix[row].length; j++) {
        if (matrix[row][j] !== -1) {
          return this.setFocus(matrix[row][j]);
        }
    }
    return false;
  }

  // return true if managed to move right
  scanLeft(row: number, column: number): boolean {
    const matrix = this.navigationMatrix;
    if (row >= matrix.length || row <= 0) {
      return false;
    }

    for (let j = column; j > 0; j--) {
        if (matrix[row][j] !== -1) {
          return this.setFocus(matrix[row][j]);
        }
    }
    return false;
  }

  setFocus(idx: number): boolean {
    if (!this.elements[idx]) {
      return false;
    }
    this.elements[idx].focus();
    return true;
  }

  // Get index of current focused element inside 'elements' array.
  getIndex(): number {
    return this.navigationMatrix[this.matrixPosition.row][this.getElementColumnInsideMatrix()];
  }
  /**
   * 
   * @returns return the element location, if the location is after the end of the matrix return the last location in the matrix
   */
  getElementColumnInsideMatrix (): number {
    return Math.min(this.matrixPosition.column,this.navigationMatrix[1].length - 1);
  }

  tearDown(): void {
    this.elements = [];
    this.matrixPosition = null;
  }

  setMatrixPosition(position: Position): void {
    this.matrixPosition = position;
  }

  // Sort elemenets array by grid position and LTR/RTL screen.
  sortElemenets(isRTL: boolean): void {
    if (!this.elements || this.elements.length === 0) {
      return;
    }
    
    this.elements = this.elements.filter(e => {
      const gp = new GridPosition(e);
      return (!isNaN(gp.rowStart) && !isNaN(gp.colStart) && gp.rowStart > 0 && gp.colStart > 0);
    })

    this.elements.sort((a, b) => {
      const elementA = new GridPosition(a);
      const elementB = new GridPosition(b);
      if (isRTL) {
        if (elementA.rowStart === elementB.rowStart) {
          return elementB.colStart - elementA.colStart;
        }
        return elementA.rowStart - elementB.rowStart;
      } else {
        if (elementA.rowStart === elementB.rowStart) {
          return elementA.colStart - elementB.colStart;
        }
        return elementA.rowStart - elementB.rowStart;
      }
    });
  }

  buildNavigationMatrix(elements: HTMLElement[], screenSize: Size, cursorPos: Position): any {
    this.elements = Array.from(elements);
    if (!this.matrixPosition) {
      this.matrixPosition  = cursorPos;
    }
    this.navigationMatrix = Array.from(Array(screenSize.rows + 1), () => new Array(screenSize.columns + 1).fill(-1));
    this.sortElemenets(this.storageService.getLanguage().tabDirectionRTL && !this.storageService.getLanguage().screenDirectionRTL);

    this.elements.forEach((element, i) => {
      const pos = new GridPosition(element);
      this.navigationMatrix[pos.rowStart][pos.colStart] = i;
    })
  }

}

export class GridPosition {
  rowStart: number;
  colStart: number;
  isRadio: boolean;
  isComboBox: boolean;

  constructor(el: HTMLElement) {
    this.rowStart = el.style.gridRowStart ? Number(el.style.gridRowStart) : Number(el.style.gridRow.split(' ')[0]);
    this.colStart = el.style.gridColumnStart ? Number(el.style.gridColumnStart) : Number(el.style.gridColumn.split(' ')[0]);
    this.isRadio = (el as any).type === 'radio';
    this.isComboBox = (el as any).tagName.toLowerCase() === 'select';
  }
}
