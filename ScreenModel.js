import { Cell } from './Cell.js';

const ROWS = 24;
const CELLS_PER_ROW = 40;

export class ScreenModel {
    constructor() {
        this.screen = [];
        for (let r = 0; r < ROWS; r++) {
            const row = [];
            for (let c = 0; c < CELLS_PER_ROW; c++) {
                row.push(new Cell());
            }
            this.screen.push(row);
        }
        this._characterSet = 0; // TODO
    }

    setRowFromChars(rowNum, text) {
        if (rowNum >= ROWS) {
            throw new Error("ScreenModel E21 bad rowNum");
        }
        let textArray = [...text];
        textArray = textArray.slice(0, CELLS_PER_ROW);
        textArray.forEach((c, index) => {
            this.screen[rowNum][index].setByte(c);
        });
    }

    dumpToConsole() {
        this.screen.forEach((row, index) => {
            let rowString = '';
            row.forEach(cell => {
                rowString += cell.getByte();
            });
            console.log(index, '|', rowString, '|');
        });
    }

    getRow(rowNum) {
        if (rowNum >= ROWS) {
            throw new Error("ScreenModel.getRow E42 bad rowNum");
        }
        return this.screen[rowNum];
    }

    setTestPage1() {
        let char = 'A';
        this.screen.forEach(row => {
            row.forEach(cell => {
                cell.setByte(char);
            })
            char = String.fromCharCode(String(char).charCodeAt(0) + 1);
        });
    }
}
