import { Level, Attributes, Colour, CellType, CellSize } from './Attributes.js';
import { Cell } from './Cell.js';
import { Event } from './Event.js';
import { RowModel } from './RowModel.js';

const ROWS = 25;
const CELLS_PER_ROW = 40;
const DEFAULT_PRIMARY_G0_CHARACTER_SET = 'latin_g0';

export class PageModel {
    constructor() {
        this._screen = [];
        for (let r = 0; r < ROWS; r++) {
            const row = [];
            for (let c = 0; c < CELLS_PER_ROW; c++) {
                row.push(new Cell());
            }
            this._screen.push(row);
        }
        this._primaryG0CharacterEncoding = DEFAULT_PRIMARY_G0_CHARACTER_SET;
        this._startBoxChar = Attributes.charFromAttribute(Attributes.START_BOX)
        this._level = Level[1];
        
        this.onSet = new Event(this);
        console.debug('PageModel constructed');
    }

    setRowFromChars(rowNum, text) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel E29 bad row number");
        }
        this._setRowFromChars(rowNum, text);
        this.onSet.notify();
    }

    setRows(rows) {
        rows = rows.slice(0, ROWS);
        rows.forEach((row, index) => {
            this._setRowFromChars(index, row);
        });
        this.onSet.notify();
    }

    _setRowFromChars(rowNum, text) {
        let textArray = [...text];
        textArray = textArray.slice(0, CELLS_PER_ROW);
        textArray.forEach((c, colNum) => {
            const code = c.charCodeAt(0);
            if (Number.isNaN(code) || code > 127) {
                throw new Error(`PageModel E51 failed to write row: bad character code (${code}) at row ${rowNum} col ${colNum}`);
            }
            this._screen[rowNum][colNum].byte = c;
        });
        if (textArray.length < CELLS_PER_ROW) {
            for (let colNum = textArray.length; colNum < CELLS_PER_ROW; colNum++) {
                this._screen[rowNum][colNum].byte = ' ';
            }
        }
    }

    // dumpToConsole() {
    //     this._screen.forEach((row, index) => {
    //         let rowString = '';
    //         row.forEach(cell => {
    //             rowString += cell.byte;
    //         });
    //         console.log(index, '|', rowString, '|');
    //     });
    // }

    setLevel(level) {
        this._level = level;
        console.debug('PageModel.setLevel: switching to Level', level);
        this.onSet.notify();
    }

    clearScreen(withUpdate) {
        const updateAfterClear = typeof withUpdate != 'undefined' ? withUpdate : true;
        if (updateAfterClear) {
            const rows = [];
            for (let rowNum = 0; rowNum < ROWS; rowNum++) {
                rows.push("");
            }
            this.setRows(rows);
        } else {
            for (let rowNum = 0; rowNum < ROWS; rowNum++) {
                this._setRowFromChars(rowNum, "");
            }
        }
    }

    setPrimaryG0CharacterEncoding(encoding) {
        this._primaryG0CharacterEncoding = encoding;
        console.debug('PageModel.setPrimaryG0CharacterEncoding: set default g0 encoding to', encoding);
        this.onSet.notify();
    }

    getRow(rowNum) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel.getRow E42 bad rowNum");
        }
        const rowModel = new RowModel();
        let textColour;

        // start of row defaults for 'set-after' attributes
        let nextCellType = CellType.ALPHA;
        let nextTextColour = Colour.WHITE;
        let nextFlashing = false;
        let nextSize = CellSize.NORMAL_SIZE;
        let nextConcealed = false; // setting is set-at, unsetting is set-after
        let cancelNextHoldMosaics = false; // setting is set-at, cancelling is set-after
        let nextBoxed = false;

        // start of row defaults for 'set-at' attributes
        let backgroundColour = Colour.BLACK;
        let graphicType = CellType.MOSAIC_CONTIGUOUS;
        let heldMosaic = {
            active: false,
            char: ' ',
            type: CellType.MOSAIC_CONTIGUOUS
        };

        this._screen[rowNum].forEach((cell, cellIndex) => {
            const char = cell.byte;
            const attrib = Attributes.attribFromChar(this._level, char);

            // 'set-after' attributes from previous cell
            textColour = nextTextColour;
            cell.type = nextCellType;
            cell.boxed = nextBoxed;
            if (attrib.attribute != Attributes.STEADY) cell.flashing = nextFlashing;
            if (attrib.attribute != Attributes.NORMAL_SIZE) cell.size = nextSize;
            if (attrib.attribute != Attributes.CONCEAL) cell.concealed = nextConcealed;
            if (cancelNextHoldMosaics) {
                if (attrib.attribute != Attributes.HOLD_MOSAICS) {
                    heldMosaic.active = false;
                    heldMosaic.char = ' ';
                }
                cancelNextHoldMosaics = false;
            }

            switch (attrib.attribute) {
                case Attributes.TEXT_COLOUR: // set after this cell
                    nextCellType = CellType.ALPHA;
                    nextTextColour = attrib.colour;
                    nextConcealed = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.MOSAIC_COLOUR: // set after this cell
                    nextCellType = graphicType;
                    nextTextColour = attrib.colour;
                    nextConcealed = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.NEW_BACKGROUND: // set at this cell
                    backgroundColour = textColour;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.BLACK_BACKGROUND: // set at
                    backgroundColour = Colour.BLACK;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.CONTIGUOUS_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_CONTIGUOUS;
                    if (cell.type == CellType.MOSAIC_SEPARATED) cell.type = CellType.MOSAIC_CONTIGUOUS;
                    if (nextCellType == CellType.MOSAIC_SEPARATED) nextCellType = CellType.MOSAIC_CONTIGUOUS;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.SEPARATED_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_SEPARATED;
                    if (cell.type == CellType.MOSAIC_CONTIGUOUS) cell.type = CellType.MOSAIC_SEPARATED;
                    if (nextCellType == CellType.MOSAIC_CONTIGUOUS) nextCellType = CellType.MOSAIC_SEPARATED;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.FLASH: // set after
                    nextFlashing = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.STEADY: // set at
                    cell.flashing = false;
                    nextFlashing = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.NORMAL_SIZE: // set at
                    cell.size = CellSize.NORMAL_SIZE;
                    nextSize = CellSize.NORMAL_SIZE;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.DOUBLE_HEIGHT: // set after
                    nextSize = CellSize.DOUBLE_HEIGHT;
                    rowModel.doubleHeight = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.DOUBLE_WIDTH: // set after
                    // nextSize = CellSize.DOUBLE_WIDTH;
                    // TODO - double width
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.DOUBLE_SIZE: // set after
                    // nextSize = CellSize.DOUBLE_SIZE;
                    // rowModel.doubleHeight = true;
                    // TODO - double size
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.CONCEAL: // set at
                    cell.concealed = true;
                    nextConcealed = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.HOLD_MOSAICS: // set at
                    heldMosaic.active = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.RELEASE_MOSAICS: // set after
                    cancelNextHoldMosaics = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.START_BOX: // set between two start box chars
                    if (cellIndex >= 1) {
                        if (this._screen[rowNum][cellIndex-1].byte == this._startBoxChar) {
                            cell.boxed = true;
                            nextBoxed = true;
                        }
                    }
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.END_BOX: // set after
                    nextBoxed = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.UNKNOWN:
                    cell.setSpace(heldMosaic);
                    break;
                default:
                    cell.setMappedChar(this._primaryG0CharacterEncoding);
                    // mosaic chars are held for use when 'hold mosaics' is active
                    if (cell.isMosaic()) {
                        heldMosaic.char = char;
                        heldMosaic.type = cell.type;
                    }
            }

            cell.fgColour = textColour;
            cell.bgColour = backgroundColour;
            rowModel.addCell(cell);
        });
        // console.dir(rowModel);
        return rowModel;
    }

}
