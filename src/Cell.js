import { Colour, CellType, CellSize } from './Attributes.js';
import encodings from './data/characterEncodings.json';

export class Cell {
    constructor() {
        this._byte = ' ';
        this._char = ' ';
        this._fgColour = Colour.WHITE;
        this._bgColour = Colour.BLACK;
        this._type = CellType.ALPHA;
        this._flashing = false;
        this._size = CellSize.NORMAL_SIZE;
        this._concealed = false;
        this._boxed = false;
        this._byteHeld = null;
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
        if (this._type == CellType.ALPHA || ((this._byte.charCodeAt(0) & 0b100000) == 0))
            this._char = getCharWithEncoding(this._byte, encoding);
        else if (this._type == CellType.MOSAIC_CONTIGUOUS)
            this._char = getCharWithEncoding(this._byte, 'g1_block_mosaic_to_unicode__legacy_computing');
        else
            this._char = getCharWithEncoding(this._byte, 'g1_block_mosaic_to_unicode__unscii_separated');

        this._byteHeld = null;
    }

    setSpace(heldMosaic) {
        if ((this._type == CellType.MOSAIC_CONTIGUOUS || this._type == CellType.MOSAIC_SEPARATED)
            && heldMosaic.active) {
            this._byteHeld = heldMosaic.char;
            this._type = heldMosaic.type;
            let charEncoding = 'g1_block_mosaic_to_unicode__legacy_computing';
            if (this._type == CellType.MOSAIC_SEPARATED) charEncoding = 'g1_block_mosaic_to_unicode__unscii_separated';
            this._char = getCharWithEncoding(heldMosaic.char, charEncoding);
        } else {
            this._byteHeld = null;
            this._char = ' ';
        }
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

    get size() {
        return this._size;
    }

    set size(size) {
        this._size = size;
    }

    set concealed(concealed) {
        this._concealed = concealed;
    }

    get concealed() {
        return this._concealed;
    }

    set boxed(boxed) {
        this._boxed = boxed;
    }

    get boxed() {
        return this._boxed;
    }

    // used in rendering to distinguish burn-through characters in G1 set
    isMosaicByte() {
        const code = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
        return (code <= 0x7f) && ((code & 0b100000) == 0b100000);
    }
    
    // used in page model to keep track of mosaic to hold 
    isMosaic() {
        const code = this._byte.charCodeAt(0);
        const isMosaic = (this._type == CellType.MOSAIC_CONTIGUOUS || this._type == CellType.MOSAIC_SEPARATED)
                && (code <= 0x7f) 
                && ((code & 0b100000) == 0b100000);
        return isMosaic;
    }
}

// private

function getCharWithEncoding(byte, encoding) {
    if (!(encoding in encodings)) throw new Error(`Cell getCharWithEncoding: bad encoding: ${encoding}`);
    if (byte in encodings[encoding]) return encodings[encoding][byte];
    if (byte in encodings['latin_g0']) return encodings['latin_g0'][byte];
    return byte;
}
