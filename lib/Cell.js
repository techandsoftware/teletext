// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { Colour, CellType, CellSize } from './Attributes.js';
import encodings from './data/characterEncodings.json';
import { Utils } from './Utils.js';

const sextants = {};

// for plugins
export class WrappedCell {
    constructor(cell) {
        this.type = cell.type_;
        this.flashing = cell.flashing_;
        this.concealed = cell.concealed_;
        this.size = cell.size_;
        this.sextants = cell.getSextants_();
    }
}

export class Cell {
    constructor() {
        this._byte = ' ';
        this._char = ' ';
        this._fgColour = Colour.WHITE;
        this._bgColour = Colour.BLACK;
        this._type = CellType.ALPHA_;
        this._flashing = false;
        this._size = CellSize.NORMAL_SIZE_;
        this._concealed = false;
        this._boxed = false;
        this._byteHeld = null;
        this._isCursive = false;
        this._diacriticCode = null;
        this._enhancedChar = null;
    }

    set byte_(byte) {
        this._byte = byte;
    }

    get byte_() {
        return this._byte;
    }

    set fgColour_(colour) {
        this._fgColour = colour;
    }

    get fgColour_() {
        return this._fgColour;
    }

    set bgColour_(colour) {
        this._bgColour = colour;
    }

    get bgColour_() {
        return this._bgColour;
    }

    get isCursive_() {
        return this._isCursive;
    }

    setMappedChar_(encoding) {
        const type = this._type;
        const byte = this._byte;

        if (isAlphaOrG1ButNotMosaic(type, byte)) {
            this._char = getCharWithEncoding(byte, encoding);
            // apply diacritic if set
            if (this._diacriticCode > 0) {
                const diacriticKey = String.fromCharCode(this._diacriticCode + 0x40);
                this._char += encodings["g2_latin"][diacriticKey];
            }
            // cursive flag used for correct rendering
            if (encoding.includes('arabic')) this._isCursive = Utils.isCursive_(this._char);
        } else {
            this._char = getCharForGraphic(type, byte);
        }

        this._byteHeld = null;
    }

    setSpace_(heldMosaic) {
        if ((this._type == CellType.MOSAIC_CONTIGUOUS_ || this._type == CellType.MOSAIC_SEPARATED_)
            && heldMosaic.active_) {
            this._byteHeld = heldMosaic.char_;
            this._type = heldMosaic.type_;
            let charEncoding = 'g1_block_mosaic_to_unicode__legacy_computing';
            if (this._type == CellType.MOSAIC_SEPARATED_) charEncoding = 'g1_block_mosaic_to_unicode__unscii_separated';
            this._char = getCharWithEncoding(heldMosaic.char_, charEncoding);
        } else {
            this._byteHeld = null;
            this._char = ' ';
        }
    }

    get char_() {
        return this._char;
    }

    get type_() {
        return this._type;
    }

    set type_(type) {
        this._type = type;
    }

    set flashing_(state) {
        this._flashing = state;
    }

    get flashing_() {
        return this._flashing;
    }

    get size_() {
        return this._size;
    }

    set size_(size) {
        this._size = size;
    }

    set concealed_(concealed) {
        this._concealed = concealed;
    }

    get concealed_() {
        return this._concealed;
    }

    set boxed_(boxed) {
        this._boxed = boxed;
    }

    get boxed_() {
        return this._boxed;
    }

    // used in rendering to distinguish burn-through characters in G1 set
    // (should get type_ handle this instead?)
    isMosaicByte_() {
        const code = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
        return (code <= 0x7f) && ((code & 0b100000) == 0b100000);
    }

    // used in page model to keep track of mosaic to hold 
    isMosaic_() {
        const code = this._byte.charCodeAt(0);
        const isMosaic = (this._type == CellType.MOSAIC_CONTIGUOUS_ || this._type == CellType.MOSAIC_SEPARATED_)
            && (code <= 0x7f)
            && ((code & 0b100000) == 0b100000);
        return isMosaic;
    }

    getSextants_() {
        const code = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
        if (code > 0x7f) return null;
        if (code in sextants) return sextants[code];

        const sextant = code >= 0x60 ? code - 0x40 : code - 0x20;
        const bits = [];
        for (let b = 0; b < 6; b++) {
            bits.push(sextant & (1 << b) ? '1' : '0');
        }
        sextants[code] = bits;
        return bits;
    }
}

// clones a cell so that its values can be overriden by enhancement data
export class EnhancedCell extends Cell {
    constructor(cell) {
        super();
        Object.assign(this, cell);
    }

    set diacritic_(diacriticCode) {
        this._diacriticCode = diacriticCode;
    }

    get diacritic_() {
        return this._diacriticCode;
    }

    set enhancedChar_(char) {
        this._enhancedChar = char;
    }

    get char_() {
        return this._enhancedChar == null ? this._char : this._enhancedChar;
    }
}

// private

function getCharWithEncoding(byte, encoding) {
    if (!(encoding in encodings)) throw new Error(`Cell getCharWithEncoding: bad encoding: ${encoding}`);
    if (byte in encodings[encoding]) return encodings[encoding][byte];
    const matches = encoding.match(/^(.+)__/);
    if (matches != null) {
        const baseEncoding = matches[1];
        if (byte in encodings[baseEncoding]) {
            encodings[encoding][byte] = encodings[baseEncoding][byte];
            return encodings[baseEncoding][byte];
        }
    }
    return byte;
}

function isAlphaOrG1ButNotMosaic(type, byte) {
    const isAlpha = type === CellType.ALPHA_;
    const isG1Type = type === CellType.MOSAIC_CONTIGUOUS_ || type === CellType.MOSAIC_SEPARATED_;
    const isNotMosaic = (byte.charCodeAt(0) & 0b100000) == 0;
    return isAlpha || (isG1Type && isNotMosaic);
}

function getCharForGraphic(type, byte) {
    switch (type) {
        case CellType.MOSAIC_CONTIGUOUS_:
            return getCharWithEncoding(byte, 'g1_block_mosaic_to_unicode__legacy_computing');
        case CellType.MOSAIC_SEPARATED_:
            return getCharWithEncoding(byte, 'g1_block_mosaic_to_unicode__unscii_separated');
        case CellType.G3_:
            return getCharWithEncoding(byte, 'g3');
        default:
            return null;
    }
}