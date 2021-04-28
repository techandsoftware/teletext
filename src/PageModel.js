// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import { Level, Attributes, Colour, CellType, CellSize, attribFromChar } from './Attributes.js';
import { Cell, EnhancedCell } from './Cell.js';
import { Event } from './Event.js';
import { RowModel } from './RowModel.js';

const ROWS = 25;
const CELLS_PER_ROW = 40;
const DEFAULT_PRIMARY_G0_CHARACTER_SET = 'latin_g0';

const ENHANCEMENT_LEVELS = [Level[1.5], Level[2.5]];

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
        this._startBoxChar = Attributes.charFromAttribute(Attributes.START_BOX)
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
        console.debug('PageModel.setPrimaryG0CharacterEncoding: set default g0 encoding to', encoding);
        if (withUpdate) this.onSet_.notify_();
    }

    setSecondaryG0CharacterEncoding_(encoding, withUpdate) {
        this._secondaryG0CharacterEncoding = encoding;
        console.debug('PageModel.setSecondaryG0CharacterEncoding: set second g0 encoding to', encoding);
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
            active: false,
            char: ' ',
            type: CellType.MOSAIC_CONTIGUOUS_
        };

        let rowEnhancements = [];
        if (ENHANCEMENT_LEVELS.includes(this._level))
            rowEnhancements = this._enhancement.filter(e => e.y_ == rowNum);

        this._screen[rowNum].forEach((cell, cellIndex) => {
            const cellEnhancements = rowEnhancements.filter(e => e.x_ == cellIndex);
            cellEnhancements.forEach(e => {
                const ecell = new EnhancedCell(cell);
                cell = ecell;
                if (e.type_ == 'g0') {
                    cell.byte_ = e.char_;
                    cell.diacritic_ = e.diacritic_;
                } else if (e.type_ == 'char') {
                    cell.enhancedChar_ = e.char_;
                }
            });

            const char = cell.byte_;
            const attrib = attribFromChar(this._level, char);

            // 'set-after' attributes from previous cell
            textColour = nextTextColour;
            cell.type_ = nextCellType;
            cell.boxed_ = nextBoxed;
            switchedG0CharacterEncoding = nextSwitchedG0CharacterEncoding;
            if (attrib.attribute != Attributes.STEADY) cell.flashing_ = nextFlashing;
            if (attrib.attribute != Attributes.NORMAL_SIZE) cell.size_ = nextSize;
            if (attrib.attribute != Attributes.CONCEAL) cell.concealed_ = nextConcealed;
            if (cancelNextHoldMosaics) {
                if (attrib.attribute != Attributes.HOLD_MOSAICS) {
                    heldMosaic.active = false;
                    heldMosaic.char = ' ';
                }
                cancelNextHoldMosaics = false;
            }

            switch (attrib.attribute) {
                case Attributes.TEXT_COLOUR: // set after this cell
                    nextCellType = CellType.ALPHA_;
                    nextTextColour = attrib.colour;
                    nextConcealed = false;
                    cell.setSpace_(heldMosaic);
                    break;
                case Attributes.MOSAIC_COLOUR: // set after this cell
                    nextCellType = graphicType;
                    nextTextColour = attrib.colour;
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
                    heldMosaic.active = true;
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
                case Attributes.END_BOX: // set after
                    nextBoxed = false;
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
                    if (cell.isMosaic_()) {
                        heldMosaic.char = char;
                        heldMosaic.type = cell.type_;
                    }
            }

            cell.fgColour_ = textColour;
            cell.bgColour_ = backgroundColour;
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

}
