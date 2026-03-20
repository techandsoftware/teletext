// SPDX-FileCopyrightText: © 2026 Rob Hardy
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

const BOX_START = Attributes.charFromAttribute(Attributes.START_BOX);
const BOX_END =  Attributes.charFromAttribute(Attributes.END_BOX);

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

    writeBytes_(colNum, rowNum, byteRows, withUpdate) {
        for (let r = rowNum, i = 0; r < ROWS && i < byteRows.length; r++, i++) {
            const row = [...byteRows[i]].slice(0, CELLS_PER_ROW - colNum);
            for (let c = colNum, j = 0; c < CELLS_PER_ROW && j < row.length; c++, j++) {
                this._screen[r][c].byte_ = row[j];
            }
        }
        if (typeof withUpdate != 'undefined' && withUpdate)
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
                    if (points[r * numPointsPerRow + c] == 255) {
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
        const rs = _createRowState();

        let rowEnhancements = [];
        if (ENHANCEMENT_LEVELS.includes(this._level))
            rowEnhancements = this._enhancement.filter(e => e.y_ == rowNum);

        let previousByte = null;
        this._screen[rowNum].forEach((cell, cellIndex) => {
            const char = cell.byte_;
            const attrib = attribFromChar(this._level, char);

            _applyPendingRowState(cell, rs, attrib);

            const handleAttr = attributeHandlers[attrib.attribute_];
            if (handleAttr) {
                handleAttr({
                    rs,
                    _cell: cell,
                    _attrib: attrib,
                    _rowModel: rowModel,
                    _previousByte: previousByte,
                    _secondaryG0CharacterEncoding: this._secondaryG0CharacterEncoding
                });
                cell.setSpace_(rs._heldMosaic);
            } else {
                cell.setMappedChar_(
                    rs._switchedG0CharacterEncoding
                        ? this._secondaryG0CharacterEncoding
                        : this._primaryG0CharacterEncoding
                );
                // mosaic chars are held for use when 'hold mosaics' is active
                // ?? spec question. what's the impact of enhancements on held mosaics? is the held mosaic from the base page or the enhancement?
                if (cell.isMosaic_()) {
                    rs._heldMosaic.char_ = char;
                    rs._heldMosaic.type_ = cell.type_;
                }
            }

            cell.fgColour_ = rs._textColour;
            cell.bgColour_ = rs._backgroundColour;

            const cellEnhancements = rowEnhancements.filter(e => e.x_ == cellIndex);
            cell = this._applyEnhancementsToCell(cell, cellEnhancements, rs);

            rowModel.addCell_(cell);
            previousByte = char;
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

    // returns text, respecting character sets and hidden cells/rows
    getText_(withGraphics) {
        let text = '';
        for (let r = 0; r < ROWS; r++) {
            const rowModel = this.getRow_(r);
            for (let c = 0; c < CELLS_PER_ROW; c++) {
                const cell = rowModel.getCell_(c);
                text += _getVisibleChar(cell.type_, cell.char_, cell.isMosaicCell_(), withGraphics);

                if (cell.size_ == CellSize.DOUBLE_WIDTH_ || cell.size_ == CellSize.DOUBLE_SIZE_) {
                    if (c < CELLS_PER_ROW - 1) text += " ";
                    c++; // skip the next cell
                }
            }
            text += "\n";
            if (rowModel.doubleHeight_) {
                if (r < ROWS - 1) text += "\n";
                r++; // skip the next row
            }
        }

        return text;
    }

    _isAllowedG3Char(char) {
        // any allowed in Level 2.5, only G3_CHARS_IN_LEVEL_1_5 allowed in Level 1.5
        return this._level == Level[1.5] && G3_CHARS_IN_LEVEL_1_5.indexOf(char) == -1 ? false : true;
    }

    _applyEnhancementsToCell(cell, enhancements, rs) {
        enhancements.forEach(e => {
            const ecell = new EnhancedCell(cell);
            cell = ecell;

            switch (e.type_) {
                case 'g0':
                    cell.byte_ = e.char_;
                    cell.diacritic_ = e.diacritic_;
                    cell.type_ = CellType.ALPHA_;
                    if (this._primaryG0CharacterEncoding.includes('latin')) {
                        cell.setMappedChar_('g0_latin');
                    } else {
                        cell.setMappedChar_(this._primaryG0CharacterEncoding);
                    }
                    break;
                case 'g1':
                    if (this._level == Level[2.5]) {
                        cell.byte_ = e.char_;
                        cell.type_ = rs._graphicType
                        // the encoding passed in is used for 0x40 to 0x5f
                        if (this._primaryG0CharacterEncoding.includes('latin')) {
                            cell.setMappedChar_('g0_latin');
                        } else {
                            cell.setMappedChar_(this._primaryG0CharacterEncoding);
                        }
                    }
                    break;
                case 'g2':
                    cell.byte_ = e.char_;
                    cell.type_ = CellType.ALPHA_;
                    cell.setMappedChar_(this._g2CharacterEncoding);
                    break;
                case 'g3':
                    if (this._isAllowedG3Char(e.char_)) {
                        cell.byte_ = e.char_;
                        cell.type_ = CellType.G3_;
                        cell.setMappedChar_();
                    }
                    break;
                case 'char':
                    cell.enhancedChar_ = e.char_;
                    cell.type_ = CellType.ALPHA_;
                    break;
            }
        });
        return cell;
    }
}

function _createRowState() {
    return {
        // set-after attribute defaults
        _nextCellType: CellType.ALPHA_,
        _nextTextColour: Colour.WHITE,
        _nextFlashing: false,
        _nextSize: CellSize.NORMAL_SIZE_,
        _nextSwitchedG0CharacterEncoding: false,
        _nextConcealed: false,  // setting is set-at, unsetting is set-after
        _cancelNextHoldMosaics: false, // setting is set-at, cancelling is set-after
        _nextBoxed: false,

        // set-after current value
        _textColour: Colour.WHITE,
        _switchedG0CharacterEncoding: false,

        // set-at attribute defaults
        _backgroundColour: Colour.BLACK,
        _graphicType: CellType.MOSAIC_CONTIGUOUS_,
        _heldMosaic: {
            active_: false,
            char_: ' ',
            type_: CellType.MOSAIC_CONTIGUOUS_
        }
    };
}

function _applyPendingRowState(cell, state, attrib) {
    state._textColour = state._nextTextColour;
    state._switchedG0CharacterEncoding = state._nextSwitchedG0CharacterEncoding;
    cell.type_ = state._nextCellType;
    cell.boxed_ = state._nextBoxed;

    if (attrib.attribute_ != Attributes.STEADY)
        cell.flashing_ = state._nextFlashing;

    if (attrib.attribute_ != Attributes.NORMAL_SIZE)
        cell.size_ = state._nextSize;

    if (attrib.attribute_ != Attributes.CONCEAL)
        cell.concealed_ = state._nextConcealed;

    if (state._cancelNextHoldMosaics) {
        if (attrib.attribute_ != Attributes.HOLD_MOSAICS) {
            state._heldMosaic.active_ = false;
            state._heldMosaic.char_ = ' ';
        }
        state._cancelNextHoldMosaics = false;
    }
}

const attributeHandlers = {
    // set after this cell
    [Attributes.TEXT_COLOUR]: ({ rs, _attrib }) => {
        rs._nextCellType = CellType.ALPHA_;
        rs._nextTextColour = _attrib.colour_;
        rs._nextConcealed = false;
    },
    // set after
    [Attributes.MOSAIC_COLOUR]: ({ rs, _attrib }) => {
        rs._nextCellType = rs._graphicType;
        rs._nextTextColour = _attrib.colour_;
        rs._nextConcealed = false;
    },
    // set at this cell
    [Attributes.NEW_BACKGROUND]: ({ rs }) => {
        rs._backgroundColour = rs._textColour;
    },
    // set at
    [Attributes.BLACK_BACKGROUND]: ({ rs }) => {
        rs._backgroundColour = Colour.BLACK;
    },
    // set at
    [Attributes.CONTIGUOUS_GRAPHICS]: ({ rs, _cell }) => {
        rs._graphicType = CellType.MOSAIC_CONTIGUOUS_;
        if (_cell.type_ == CellType.MOSAIC_SEPARATED_)
            _cell.type_ = CellType.MOSAIC_CONTIGUOUS_;
        if (rs._nextCellType == CellType.MOSAIC_SEPARATED_)
            rs._nextCellType = CellType.MOSAIC_CONTIGUOUS_;
    },
    // set at
    [Attributes.SEPARATED_GRAPHICS]: ({ rs, _cell }) => {
        rs._graphicType = CellType.MOSAIC_SEPARATED_;
        if (_cell.type_ === CellType.MOSAIC_CONTIGUOUS_)
            _cell.type_ = CellType.MOSAIC_SEPARATED_;
        if (rs._nextCellType === CellType.MOSAIC_CONTIGUOUS_)
            rs._nextCellType = CellType.MOSAIC_SEPARATED_;
    },
    // switches G0 sets. set after
    [Attributes.ESC]: ({ rs, _secondaryG0CharacterEncoding }) => {
        if (_secondaryG0CharacterEncoding) {
            rs._nextSwitchedG0CharacterEncoding = !rs._switchedG0CharacterEncoding;
        }
    },
    // set after
    [Attributes.FLASH]: ({ rs }) => {
        rs._nextFlashing = true;
    },
    // set at
    [Attributes.STEADY]: ({ rs, _cell }) => {
        _cell.flashing_ = false;
        rs._nextFlashing = false;
    },
    // set at
    [Attributes.NORMAL_SIZE]: ({ rs, _cell }) => {
        _cell.size_ = CellSize.NORMAL_SIZE_;
        rs._nextSize = CellSize.NORMAL_SIZE_;
    },
    // set after
    [Attributes.DOUBLE_HEIGHT]: ({ rs, _rowModel }) => {
        rs._nextSize = CellSize.DOUBLE_HEIGHT_;
        _rowModel.doubleHeight_ = true;
    },
    // set after
    [Attributes.DOUBLE_WIDTH]: ({ rs }) => {
        rs._nextSize = CellSize.DOUBLE_WIDTH_;
    },
    // set after
    [Attributes.DOUBLE_SIZE]: ({ rs, _rowModel }) => {
        rs._nextSize = CellSize.DOUBLE_SIZE_;
        _rowModel.doubleHeight_ = true;
    },
    // set at
    [Attributes.CONCEAL]: ({ rs, _cell }) => {
        _cell.concealed_ = true;
        rs._nextConcealed = true;
    },
    // set at
    [Attributes.HOLD_MOSAICS]: ({ rs }) => {
        rs._heldMosaic.active_ = true;
    },
    // set after
    [Attributes.RELEASE_MOSAICS]: ({ rs }) => {
        rs._cancelNextHoldMosaics = true;
    },
    // set between two start box attributes
    [Attributes.START_BOX]: ({ rs, _cell, _previousByte }) => {
        if (_previousByte == BOX_START) {
            _cell.boxed_ = true;
            rs._nextBoxed = true;
        }
    },
    // set between two end box attributes
    [Attributes.END_BOX]: ({ rs, _cell, _previousByte }) => {
        if (_previousByte == BOX_END) {
            _cell.boxed_ = false;
            rs._nextBoxed = false;
        }
    },
    [Attributes.UNKNOWN_]: () => {
    }
};

function _getVisibleChar(type, char, isMosaicCell, withGraphics) {
    const visibleChar = char || ' ';

    if (withGraphics) return visibleChar;

    const isAlpha = type === CellType.ALPHA_;
    const isBurnThroughAlpha =
        (type === CellType.MOSAIC_CONTIGUOUS_ || type === CellType.MOSAIC_SEPARATED_) &&
        !isMosaicCell;

    return (isAlpha || isBurnThroughAlpha) ? visibleChar : ' ';
}
