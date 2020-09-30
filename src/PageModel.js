import { Attributes, Colour, CellType } from './Attributes.js';
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
            this.screen[rowNum][index].byte = c;
        });
    }

    dumpToConsole() {
        this.screen.forEach((row, index) => {
            let rowString = '';
            row.forEach(cell => {
                rowString += cell.byte;
            });
            console.log(index, '|', rowString, '|');
        });
    }

    getRow(rowNum) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel.getRow E42 bad rowNum");
        }
        let textColour;

        // start of row defaults for 'set-after' attributes
        let nextCellType = CellType.ALPHA;
        let nextTextColour = Colour.WHITE;
        let nextFlashing = false;

        // start of row defaults for 'set-at' attributes
        let backgroundColour = Colour.BLACK;
        let graphicType = CellType.MOSAIC_CONTIGUOUS;
        this.screen[rowNum].forEach(cell => {
            const char = cell.byte;
            const attrib = Attributes.attribFromChar(char);

            // 'set-after' attributes from previous cell
            textColour = nextTextColour;
            cell.type = nextCellType;
            if (attrib.attribute != Attributes.STEADY) cell.flashing = nextFlashing;
            switch (attrib.attribute) {
                case Attributes.TEXT_COLOUR: // set after this cell
                    nextCellType = CellType.ALPHA;
                    nextTextColour = attrib.colour;
                    cell.setSpace();
                    break;
                case Attributes.MOSAIC_COLOUR: // set after
                    nextCellType = graphicType;
                    nextTextColour = attrib.colour;
                    cell.setSpace();
                    break;
                case Attributes.NEW_BACKGROUND: // set after
                    backgroundColour = textColour;
                    cell.setSpace();
                    break;
                case Attributes.BLACK_BACKGROUND: // set at this cell
                    backgroundColour = Colour.BLACK;
                    cell.setSpace();
                    break;
                case Attributes.CONTIGUOUS_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_CONTIGUOUS; // will need rework for held graphics
                    cell.setSpace();
                    break;
                case Attributes.SEPARATED_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_SEPARATED; // will need rework for held graphics
                    cell.setSpace();
                    break;
                case Attributes.FLASH: // set after
                    nextFlashing = true;
                    cell.setSpace();
                    break;
                case Attributes.STEADY: // set at
                    cell.flashing = false;
                    nextFlashing = false;
                    cell.setSpace();
                    break;
                default:
                    cell.setMappedChar(this._characterEncoding);
            }

            // 'set-at' attributes from current cell
            cell.fgColour = textColour;
            cell.bgColour = backgroundColour;
        });
        return this.screen[rowNum];
    }

    setTestPage1() {
        let char = 'A';
        this.screen.forEach(row => {
            row.forEach(cell => {
                cell.byte = char;
            })
            char = String.fromCharCode(String(char).charCodeAt(0) + 1);
        });
    }
}
