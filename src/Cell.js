import { Colour } from './Attributes.js';
import encodings from './data/characterEncodings.json';

export class Cell {
    constructor() {
        this._byte = ' ';
        this._fgColour = Colour.WHITE;
        this._bgColour = Colour.BLACK;
    }

    setByte(byte) {
        this._byte = byte;
    }

    getByte() {
        return this._byte;
    }

    setFgColour(colour) {
        this._fgColour = colour;
    }

    getFgColour() {
        return this._fgColour;
    }

    setMappedChar(encoding) {
        this._char = getCharWithEncoding(this._byte, encoding);
    }

    setSpace() {
        this._char = ' ';
    }

    getChar() {
        return this._char;
    }
}

// private

function getCharWithEncoding(byte, encoding) {
    if (byte in encodings[encoding]) return encodings[encoding][byte];
    if (byte in encodings['latin_g0']) return encodings['latin_g0'][byte];
    return byte;
}
