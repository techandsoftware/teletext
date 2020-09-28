import { Colour } from './Attributes.js';

export class Cell {
    constructor() {
        this._char = ' ';
        this._fgColour = Colour.WHITE;
        this._bgColour = Colour.BLACK;
    }

    setByte(byte) {
        this._char = byte;
    }

    getByte() {
        return this._char;
    }

    setFgColour(colour) {
        this._fgColour = colour;
    }

    getFgColour() {
        return this._fgColour;
    }
}
