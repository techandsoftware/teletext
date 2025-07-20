// SPDX-FileCopyrightText: © 2023 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

// Exported in public interface
export const Colour = {
    BLACK  : Symbol('BLACK'),
    RED    : Symbol('RED'),
    GREEN  : Symbol('GREEN'),
    YELLOW : Symbol('YELLOW'),
    BLUE   : Symbol('BLUE'),
    MAGENTA: Symbol('MAGENTA'),
    CYAN   : Symbol('CYAN'),
    WHITE  : Symbol('WHITE'),
};
Object.freeze(Colour);

export const CellType = {
    ALPHA_ : Symbol('ALPHA'),
    MOSAIC_CONTIGUOUS_: Symbol('MOSAIC_CONTIGUOUS'),
    MOSAIC_SEPARATED_: Symbol('MOSAIC_SEPARATED'),
    G3_    : Symbol('G3')
};
Object.freeze(CellType);

export const CellSize = {
    NORMAL_SIZE_:   Symbol('NORMAL_SIZE'),
    DOUBLE_HEIGHT_: Symbol('DOUBLE_HEIGHT'),
    DOUBLE_WIDTH_:  Symbol('DOUBLE_WIDTH'),
    DOUBLE_SIZE_:   Symbol('DOUBLE_SIZE'),
};
Object.freeze(CellSize);

// 'level 0' is fake but derived from Ceefax 1975 pages at https://archive.teletextarchaeologist.org/Pages/Details/21000
// which has different control codes
export const Level = {
    0:   Symbol('0'),   // 7 colour text and contiguous graphics, flashing
    1:   Symbol('1'),   // + background colours, separated graphics, conceal, box, double height
    1.5: Symbol('1.5'), // + black text/graphics
    2.5: Symbol('2.5'), // + double width, double size
};
Object.freeze(Level);

// Exported in public interface
export class Attributes {
    static charFromTextColour(colour) {
        if (colour in textColourToChar) return textColourToChar[colour];
        throw new Error('Attributes.charFromTextColour: bad colour: ' + colour);
    }

    static charFromGraphicColour(colour) {
        if (colour in graphicColourToChar) return graphicColourToChar[colour];
        throw new Error('Attributes.charFromGraphicColour: bad colour');
    }

    static charFromAttribute(attrib) {
        if (attrib in spacingAttributesToChar) return spacingAttributesToChar[attrib];
        throw new Error('Attributes.charFromAttribute: bad attribute');
    }
}

Object.assign(Attributes, {
    TEXT_COLOUR:         CellType.ALPHA,
    MOSAIC_COLOUR:       Symbol('MOSAIC_COLOUR'),
    NEW_BACKGROUND:      Symbol('NEW_BACKGROUND'),
    BLACK_BACKGROUND:    Symbol('BLACK_BACKGROUND'),
    CONTIGUOUS_GRAPHICS: CellType.MOSAIC_CONTIGUOUS_,
    SEPARATED_GRAPHICS:  CellType.MOSAIC_SEPARATED_,
    ESC:                 Symbol('ESC'),
    FLASH:               Symbol('FLASH'),
    STEADY:              Symbol('STEADY'),
    NORMAL_SIZE:         CellSize.NORMAL_SIZE_,
    DOUBLE_HEIGHT:       CellSize.DOUBLE_HEIGHT_,
    DOUBLE_WIDTH:        CellSize.DOUBLE_WIDTH_,
    DOUBLE_SIZE:         CellSize.DOUBLE_SIZE_,
    CONCEAL:             Symbol('CONCEAL'),
    HOLD_MOSAICS:        Symbol('HOLD_MOSAICS'),
    RELEASE_MOSAICS:     Symbol('RELEASE_MOSAICS'),
    START_BOX:           Symbol('START_BOX'),
    END_BOX:             Symbol('END_BOX'),
    UNKNOWN_:            Symbol('UNKNOWN'), // pseudo-attribute
});

export function attribFromChar(level, char) {
    let attribute = null;
    let colour = null;
    if (char in attributeChars && charCodesByLevel[level].includes(char.charCodeAt(0))) {
        if (char in charToTextColour) {
            attribute = Attributes.TEXT_COLOUR;
            colour = attributeChars[char];
        } else if (char in charToGraphicColour) {
            attribute = Attributes.MOSAIC_COLOUR;
            colour = attributeChars[char];
        } else
            attribute = attributeChars[char];
    } else if (char.charCodeAt(0) <= 0x1f)
        attribute = Attributes.UNKNOWN_;

    return {
        attribute_: attribute,
        colour_: colour
    };
}

export function fillColourFromColourAttrib(colour) {
    return colourAttribToFillColour[colour];
}


///////////////////////////////
// private functions/data below

const colourAttribToFillColour = {
    [Colour.BLACK]   : '#000',
    [Colour.RED]     : '#f00',
    [Colour.GREEN]   : '#0f0',
    [Colour.YELLOW]  : '#ff0',
    [Colour.BLUE]    : '#00f',
    [Colour.MAGENTA] : '#f0f',
    [Colour.CYAN]    : '#0ff',
    [Colour.WHITE]   : '#fff',
};
Object.freeze(colourAttribToFillColour);

const charToTextColour = {
    '\x00': Colour.BLACK,
    '\x01': Colour.RED,
    '\x02': Colour.GREEN,
    '\x03': Colour.YELLOW,
    '\x04': Colour.BLUE,
    '\x05': Colour.MAGENTA,
    '\x06': Colour.CYAN,
    '\x07': Colour.WHITE,
};
Object.freeze(charToTextColour);
const textColourToChar = createReverseLookup(charToTextColour);

const charToGraphicColour = {
    '\x10': Colour.BLACK,
    '\x11': Colour.RED,
    '\x12': Colour.GREEN,
    '\x13': Colour.YELLOW,
    '\x14': Colour.BLUE,
    '\x15': Colour.MAGENTA,
    '\x16': Colour.CYAN,
    '\x17': Colour.WHITE,
};
Object.freeze(charToGraphicColour);
const graphicColourToChar = createReverseLookup(charToGraphicColour);

const attributeChars = {
    '\x08': Attributes.FLASH,
    '\x09': Attributes.STEADY,
    '\x0a': Attributes.END_BOX,
    '\x0b': Attributes.START_BOX,
    '\x0c': Attributes.NORMAL_SIZE,
    '\x0d': Attributes.DOUBLE_HEIGHT,
    '\x0e': Attributes.DOUBLE_WIDTH,
    '\x0f': Attributes.DOUBLE_SIZE,
    '\x18': Attributes.CONCEAL,
    '\x19': Attributes.CONTIGUOUS_GRAPHICS,
    '\x1a': Attributes.SEPARATED_GRAPHICS,
    '\x1b': Attributes.ESC,
    '\x1c': Attributes.BLACK_BACKGROUND,
    '\x1d': Attributes.NEW_BACKGROUND,
    '\x1e': Attributes.HOLD_MOSAICS,
    '\x1f': Attributes.RELEASE_MOSAICS,
};
Object.assign(attributeChars, charToTextColour);
Object.assign(attributeChars, charToGraphicColour);
Object.freeze(attributeChars);
const spacingAttributesToChar = createReverseLookup(attributeChars);

const charCodesByLevel = {
    [Level[0]]: [                                 // pre-release level
        0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7,        // text colours
        0x8, 0x9,                                 // flash/steady
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17  // graphic colours
    ]
};
charCodesByLevel[Level[1]] = [
    ...charCodesByLevel[Level[0]],
    0xa, 0xb,   // start/end boxed
    0xc, 0xd,   // normal or double height
    0x18,       // conceal
    0x19, 0x1a, // contiguous/separated graphics
    0x1b,       // esc (g0 set switching)
    0x1c, 0x1d, // black background, new background
    0x1e, 0x1f  // hold/release mosaics
];
charCodesByLevel[Level[1.5]] = [...charCodesByLevel[Level[1]], 0x0, 0x10]; // black text/graphics
charCodesByLevel[Level[2.5]] = [...charCodesByLevel[Level[1.5]], 0xe, 0xf]; // double width/double size
Object.freeze(charCodesByLevel); 

function createReverseLookup(input) {
    const reverseLookup = {};
    for (const key in input) {
        reverseLookup[input[key]] = key;
    }
    return Object.freeze(reverseLookup);
}
