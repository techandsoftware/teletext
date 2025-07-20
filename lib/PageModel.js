// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { Level, Attributes, Colour, CellType, CellSize, attribFromChar } from './Attributes.js';
import { Cell, EnhancedCell } from './Cell.js';
import { Event } from './Event.js';
import { RowModel } from './RowModel.js';
import encodings from './data/characterEncodings.json';

const ROWS = 25;
const CELLS_PER_ROW = 40;
const DEFAULT_PRIMARY_G0_CHARACTER_SET = 'g0_latin';
const DEFAULT_G2_CHARACTER_SET = 'g2_latin';

const ENHANCEMENT_LEVELS = [Level[1.5], Level[2.5]];
const G3_CHARS_IN_LEVEL_1_5 = "\x51\x5b\x5c\x5d"; // only 4 G3 characters allowed in Level 1.5

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
        this._secondaryG0CharacterEncoding = null;
        this._g2CharacterEncoding = DEFAULT_G2_CHARACTER_SET;
        this._startBoxChar = Attributes.charFromAttribute(Attributes.START_BOX);
        this._endBoxChar = Attributes.charFromAttribute(Attributes.END_BOX);
        this._level = Level[1];
        this._enhancement = [];
        
        this.onSet_ = new Event(this);
        console.debug('PageModel constructed');
    }

    notify_() {
        this.onSet_.notify_();
    }

    setRowFromChars_(rowNum, text) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel E29 bad row number");
        }
        this._setRowFromChars(rowNum, text);
        this.onSet_.notify_();
    }

    setRows_(rows) {
        rows = rows.slice(0, ROWS);
        rows.forEach((row, index) => {
            this._setRowFromChars(index, row);
        });
        this.onSet_.notify_();
    }

    writeBytes_(colNum, rowNum, byteRows) {
        for (let r = rowNum, i = 0; r < ROWS && i < byteRows.length; r++, i++) {
            const row = [...byteRows[i]].slice(0, CELLS_PER_ROW - colNum);
            for (let c = colNum, j = 0; c < CELLS_PER_ROW && j < row.length; c++, j++) {
                this._screen[r][c].byte_ = row[j];
            }
        }
        this.onSet_.notify_();
    }

    writeByte_(colNum, rowNum, byte, withUpdate) {
        if (colNum >= 0 && colNum < CELLS_PER_ROW && rowNum >= 0 && rowNum < ROWS) {
            this._screen[rowNum][colNum].byte_ = byte;
        }

        if (typeof withUpdate != 'undefined' && withUpdate)
            this.onSet_.notify_();
    }

    // Plots a pixel in a g1 mosaic at the co-ordinates
    // Control codes aren't overriden
    // Existing mosaics are modified
    // Non mosaics are replaced with a new mosaic
    plot_(graphicColNum, graphicRowNum, unplot) {
        const rowNum = Math.floor(graphicRowNum / 3); // TODO - consider quicker alternatives?
        const colNum = Math.floor(graphicColNum / 2);
        const byte = this._screen[rowNum][colNum]._byte;
        const code = byte.charCodeAt(0);
        if (code < 0x20) return;
        if (unplot ? code == 0x20 : code == 0xff) return; // sextant 000000 or 111111

        const baseX = graphicColNum - colNum * 2;
        const baseY = graphicRowNum - rowNum * 3;
        const bitShift = baseX + baseY * 2;

        // sextant values 0 to 0x3f
        let sextant = 0;
        if (code < 0x40) sextant = code - 0x20;
        else if (code >= 0x60) sextant = code - 0x40;

        if (unplot) {
            sextant &= ~(1 << bitShift); // sets the bitShift'th bit to 0
        } else {
            sextant |= 1 << bitShift;
        }

        // g1 mosaics 0x20 to 0x3f and 0x60 to 0x7f
        const newCode = sextant >= 0x20 ? sextant + 0x40 : sextant + 0x20;

        this._screen[rowNum][colNum]._byte = String.fromCharCode(newCode);
    }

    plotPoints_(graphicColNum, graphicRowNum, numPointsPerRow, points) {
        let r = 0, c = 0;
        for (let i = 0; i < points.length; i++) {
            if (graphicRowNum + r < ROWS * 3) {
                if (graphicColNum + c < (CELLS_PER_ROW * 2)) {
                    if (points[r*numPointsPerRow + c] == 255) {
                        this.plot_(graphicColNum + c, graphicRowNum + r);
                    } else {
                        this.plot_(graphicColNum + c, graphicRowNum + r, true);
                    }
                }
                c++;
                if (c == numPointsPerRow) {
                    r++;
                    c = 0;
                }
            } else {
                break;
            }
        }
    }

    _setRowFromChars(rowNum, text) {
        let textArray = [...text];
        textArray = textArray.slice(0, CELLS_PER_ROW);
        textArray.forEach((c, colNum) => {
            const code = c.charCodeAt(0);
            if (Number.isNaN(code) || code > 127) {
                throw new Error(`PageModel E51 failed to write row: bad character code (${code}) at row ${rowNum} col ${colNum}`);
            }
            this._screen[rowNum][colNum].byte_ = c;
        });
        if (textArray.length < CELLS_PER_ROW) {
            for (let colNum = textArray.length; colNum < CELLS_PER_ROW; colNum++) {
                this._screen[rowNum][colNum].byte_ = ' ';
            }
        }
    }

    // dumpToConsole() {
    //     this._screen.forEach((row, index) => {
    //         let rowString = '';
    //         row.forEach(cell => {
    //             rowString += cell.byte.charCodeAt(0).toString(16).padStart(2, '0') + ' ';
    //         });
    //         console.log(index, '|', rowString, '|');
    //     });
    // }

    setLevel_(level) {
        this._level = level;
        console.debug('PageModel.setLevel: switching to Level', level);
        console.debug('new level: ', this._level);
        this.onSet_.notify_();
    }

    clearScreen_(withUpdate) {
        const updateAfterClear = typeof withUpdate != 'undefined' ? withUpdate : true;
        if (updateAfterClear) {
            const rows = [];
            for (let rowNum = 0; rowNum < ROWS; rowNum++) {
                rows.push("");
            }
            this.setRows_(rows);
        } else {
            for (let rowNum = 0; rowNum < ROWS; rowNum++) {
                this._setRowFromChars(rowNum, "");
            }
        }
    }

    setPrimaryG0CharacterEncoding_(encoding, withUpdate) {
        this._primaryG0CharacterEncoding = encoding;
        const g0base = encoding.match(/^g0_([a-z]+)/);
        if (g0base != null) {
            // the g2 set selected is derived from the g0 set, apart from hebrew which has no g2_ set
            const g2 = `g2_${g0base[1]}`;
            if (g2 in encodings) this._g2CharacterEncoding = g2;
            else if (g0base[1] == 'hebrew') this._g2CharacterEncoding = 'g2_arabic';
        }
        console.debug('PageModel.setPrimaryG0CharacterEncoding: set default g0 encoding to', encoding, 'with g2 encoding to', this._g2CharacterEncoding);
        if (withUpdate) this.onSet_.notify_();
    }

    setSecondaryG0CharacterEncoding_(encoding, withUpdate) {
        this._secondaryG0CharacterEncoding = encoding;
        console.debug('PageModel.setSecondaryG0CharacterEncoding: set second g0 encoding to', encoding);
        if (withUpdate) this.onSet_.notify_();
    }

    setG2CharacterEncoding_(encoding, withUpdate) {
        this._g2CharacterEncoding = encoding;
        console.debug('PageModel.setG2CharacterEncoding: set g2 encoding to', encoding);
        if (withUpdate) this.onSet_.notify_();
    }

    getRow_(rowNum) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel.getRow E42 bad rowNum");
        }
        const rowModel = new RowModel();
        let textColour, switchedG0CharacterEncoding;

        // start of row defaults for 'set-after' attributes
        let nextCellType = CellType.ALPHA_;
        let nextTextColour = Colour.WHITE;
        let nextFlashing = false;
        let nextSize = CellSize.NORMAL_SIZE_;
        let nextSwitchedG0CharacterEncoding = false;
        let nextConcealed = false; // setting is set-at, unsetting is set-after
        let cancelNextHoldMosaics = false; // setting is set-at, cancelling is set-after
        let nextBoxed = false;

        // start of row defaults for 'set-at' attributes
        let backgroundColour = Colour.BLACK;
        let graphicType = CellType.MOSAIC_CONTIGUOUS_;
        let heldMosaic = {
            active_: false,
            char_: ' ',
            type_: CellType.MOSAIC_CONTIGUOUS_
        };

        let rowEnhancements = [];
        if (ENHANCEMENT_LEVELS.includes(this._level))
            rowEnhancements = this._enhancement.filter(e => e.y_ == rowNum);

        this._screen[rowNum].forEach((cell, cellIndex) => {
            const char = cell.byte_;
            const attrib = attribFromChar(this._level, char);

            // 'set-after' attributes from previous cell
            textColour = nextTextColour;
            cell.type_ = nextCellType;
            cell.boxed_ = nextBoxed;
            switchedG0CharacterEncoding = nextSwitchedG0CharacterEncoding;
            if (attrib.attribute_ != Attributes.STEADY) cell.flashing_ = nextFlashing;
            if (attrib.attribute_ != Attributes.NORMAL_SIZE) cell.size_ = nextSize;
            if (attrib.attribute_ != Attributes.CONCEAL) cell.concealed_ = nextConcealed;
            if (cancelNextHoldMosaics) {
                if (attrib.attribute_ != Attributes.HOLD_MOSAICS) {
                    heldMosaic.active_ = false;
                    heldMosaic.char_ = ' ';
                }
                cancelNextHoldMosaics = false;
            }

            switch (attrib.attribute_) {
                case Attributes.TEXT_COLOUR: // set after this cell
                    nextCellType = CellType.ALPHA_;
                    nextTextColour = attrib.colour_;
                    nextConcealed = false;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.MOSAIC_COLOUR: // set after this cell
                    nextCellType = graphicType;
                    nextTextColour = attrib.colour_;
                    nextConcealed = false;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.NEW_BACKGROUND: // set at this cell
                    backgroundColour = textColour;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.BLACK_BACKGROUND: // set at
                    backgroundColour = Colour.BLACK;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.CONTIGUOUS_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_CONTIGUOUS_;
                    if (cell.type_ == CellType.MOSAIC_SEPARATED_) cell.type_ = CellType.MOSAIC_CONTIGUOUS_;
                    if (nextCellType == CellType.MOSAIC_SEPARATED_) nextCellType = CellType.MOSAIC_CONTIGUOUS_;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.SEPARATED_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_SEPARATED_;
                    if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_) cell.type_ = CellType.MOSAIC_SEPARATED_;
                    if (nextCellType == CellType.MOSAIC_CONTIGUOUS_) nextCellType = CellType.MOSAIC_SEPARATED_;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.ESC: // for switching g0 sets. Set after
                    if (this._secondaryG0CharacterEncoding) {
                        nextSwitchedG0CharacterEncoding = !switchedG0CharacterEncoding;
                    }
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.FLASH: // set after
                    nextFlashing = true;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.STEADY: // set at
                    cell.flashing_ = false;
                    nextFlashing = false;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.NORMAL_SIZE: // set at
                    cell.size_ = CellSize.NORMAL_SIZE_;
                    nextSize = CellSize.NORMAL_SIZE_;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.DOUBLE_HEIGHT: // set after
                    nextSize = CellSize.DOUBLE_HEIGHT_;
                    rowModel.doubleHeight_ = true;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.DOUBLE_WIDTH: // set after
                    nextSize = CellSize.DOUBLE_WIDTH_;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.DOUBLE_SIZE: // set after
                    nextSize = CellSize.DOUBLE_SIZE_;
                    rowModel.doubleHeight_ = true;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.CONCEAL: // set at
                    cell.concealed_ = true;
                    nextConcealed = true;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.HOLD_MOSAICS: // set at
                    heldMosaic.active_ = true;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.RELEASE_MOSAICS: // set after
                    cancelNextHoldMosaics = true;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.START_BOX: // set between two start box chars
                    if (cellIndex >= 1) {
                        if (this._screen[rowNum][cellIndex-1].byte_ == this._startBoxChar) {
                            cell.boxed_ = true;
                            nextBoxed = true;
                        }
                    }
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.END_BOX: // set between two end box chars
                    if (cellIndex + 1 < CELLS_PER_ROW) {
                        if (this._screen[rowNum][cellIndex+1].byte_ == this._endBoxChar) {
                            nextBoxed = false;
                        }
                    }
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.UNKNOWN_:
                    cell.setSpace_(heldMosaic);
                    break;
                default:
                    if (switchedG0CharacterEncoding)
                        cell.setMappedChar_(this._secondaryG0CharacterEncoding);
                    else
                        cell.setMappedChar_(this._primaryG0CharacterEncoding);
                    // mosaic chars are held for use when 'hold mosaics' is active
                    // ?? spec question. what's the impact of enhancements on held mosaics? is the held mosaic from the base page or the enhancement?
                    if (cell.isMosaic_()) {
                        heldMosaic.char_ = char;
                        heldMosaic.type_ = cell.type_;
                    }
            }

            cell.fgColour_ = textColour;
            cell.bgColour_ = backgroundColour;

            const cellEnhancements = rowEnhancements.filter(e => e.x_ == cellIndex);
            cellEnhancements.forEach(e => {
                const ecell = new EnhancedCell(cell);
                cell = ecell;
                if (e.type_ == 'g0') {
                    cell.byte_ = e.char_;
                    cell.diacritic_ = e.diacritic_;
                    cell.type_ = CellType.ALPHA_;
                    if (switchedG0CharacterEncoding)
                        cell.setMappedChar_(this._secondaryG0CharacterEncoding);
                    else
                        cell.setMappedChar_(this._primaryG0CharacterEncoding);
                } else if (e.type_ == 'g1') {
                    if (this._level == Level[2.5]) {
                        cell.byte_ = e.char_;
                        cell.type_ = graphicType
                        cell.setMappedChar_();
                    }
                } else if (e.type_ == 'g2') {
                    cell.byte_ = e.char_;
                    cell.type_ = CellType.ALPHA_;
                    cell.setMappedChar_(this._g2CharacterEncoding);
                } else if (e.type_ == 'g3') {
                    if (this._isAllowedG3Char(e.char_)) {
                        cell.byte_ = e.char_;
                        cell.type_ = CellType.G3_;
                        cell.setMappedChar_();
                    }
                } else if (e.type_ == 'char') {
                    cell.enhancedChar_ = e.char_;
                    cell.type_ = CellType.ALPHA_;
                }
                // console.log(cell);
                // console.log(cell.printEnhancements());
            });

            rowModel.addCell_(cell);
        });
        // console.dir(rowModel);
        return rowModel;
    }

    enhance_(data) {
        this._enhancement = data;
    }

    clearEnhancements_() {
        this._enhancement = [];
    }

    getBytes_() {
        const bytes = new Uint8Array(ROWS * CELLS_PER_ROW);
        this._screen.forEach((row, rowNum) => {
            row.forEach((cell, colNum) => {
                bytes[rowNum * CELLS_PER_ROW + colNum] = cell.byte_.charCodeAt(0);
            });
        });
        return bytes;
    }

    _isAllowedG3Char(char) {
        // any allowed in Level 2.5, only G3_CHARS_IN_LEVEL_1_5 allowed in Level 1.5
        return this._level == Level[1.5] && G3_CHARS_IN_LEVEL_1_5.indexOf(char) == -1 ? false : true;
    }

}
