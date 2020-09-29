import { Colour } from './Attributes.js';
import encodings from './data/characterEncodings.json';

export class Cell {
    constructor() {
        this._byte = ' ';
        this._fgColour = Colour.WHITE;
        this._bgColour = Colour.BLACK;
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
        this._char = getCharWithEncoding(this._byte, encoding);
    }

    setSpace() {
        this._char = ' ';
    }

    get char() {
        return this._char;
    }
}

// private

function getCharWithEncoding(byte, encoding) {
    if (byte in encodings[encoding]) return encodings[encoding][byte];
    if (byte in encodings['latin_g0']) return encodings['latin_g0'][byte];
    return byte;
}
