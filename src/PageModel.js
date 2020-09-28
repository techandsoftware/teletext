import { Attributes, Colour } from './Attributes.js';
import { Cell } from './Cell.js';
import { Event } from './Event.js';

const ROWS = 24;
const CELLS_PER_ROW = 40;

export class PageModel {
    constructor() {
        this.screen = [];
        for (let r = 0; r < ROWS; r++) {
            const row = [];
            for (let c = 0; c < CELLS_PER_ROW; c++) {
                row.push(new Cell());
            }
            this.screen.push(row);
        }
        this._characterEncoding = 'latin_g0_english';
        
        this.onSet = new Event(this);
        console.debug('PageModel constructed');
    }

    setRowFromChars(rowNum, text) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel E21 bad rowNum");
        }
        this._setRowFromChars(rowNum, text);
        this.onSet.notify();
    }

    setRows(rows) {
        if (rows.length > ROWS) {
            throw new Error('PageModel E38 bad rowNum');
        }
        rows.forEach((row, index) => {
            this._setRowFromChars(index, row);
        });
        this.onSet.notify();
    }

    _setRowFromChars(rowNum, text) {
        let textArray = [...text];
        textArray = textArray.slice(0, CELLS_PER_ROW);
        textArray.forEach((c, index) => {
            const code = c.charCodeAt(0);
            if (Number.isNaN(code) || code >= 160) {
                throw new Error(`PageModel: failed to set row characters: character out of range with code: ${code}`);
            }
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
            throw new Error("PageModel.getRow E42 bad rowNum");
        }
        let textColour = Colour.WHITE;
        this.screen[rowNum].forEach(cell => {
            const char = cell.getByte();
            const attrib = Attributes.attribFromChar(char);
            if (attrib.isTextColourAttribute) {
                textColour = attrib.value;
                cell.setSpace();
            } else {
                cell.setMappedChar(this._characterEncoding);
            }
            cell.setFgColour(textColour);
        });
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
