import { Colour, CellType } from './Attributes.js';
import encodings from './data/characterEncodings.json';

export class Cell {
    constructor() {
        this._byte = ' ';
        this._fgColour = Colour.WHITE;
        this._bgColour = Colour.BLACK;
        this._type = CellType.ALPHA;
        this._flashing = false;
    }

    set byte(byte) {
        this._byte = byte;
    }

    get byte() {
        return this._byte;
    }

    set fgColour(colour) {
        this._fgColour = colour;
    }

    get fgColour() {
        return this._fgColour;
    }

    set bgColour(colour) {
        this._bgColour = colour;
    }

    get bgColour() {
        return this._bgColour;
    }

    setMappedChar(encoding) {
        if (this._type == CellType.ALPHA) {
            this._char = getCharWithEncoding(this._byte, encoding);
        } else {
            // TODO check char range
            this._char = getCharWithEncoding(this._byte, 'g1_block_mosaic_to_unicode__legacy_computing');
        }
    }

    setSpace() {
        this._char = ' ';
    }

    get char() {
        return this._char;
    }

    get type() {
        return this._type;
    }

    set type(type) {
        this._type = type;
    }

    set flashing(state) {
        this._flashing = state;
    }

    get flashing() {
        return this._flashing;
    }
}

// private

function getCharWithEncoding(byte, encoding) {
    if (!(encoding in encodings)) throw new Error(`Cell getCharWithEncoding: bad encoding: ${encoding}`);
    if (byte in encodings[encoding]) return encodings[encoding][byte];
    if (byte in encodings['latin_g0']) return encodings['latin_g0'][byte];
    return byte;
}
