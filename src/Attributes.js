// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
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

Attributes.TEXT_COLOUR         = CellType.ALPHA_;
Attributes.MOSAIC_COLOUR       = Symbol('MOSAIC_COLOUR');
Attributes.NEW_BACKGROUND      = Symbol('NEW_BACKGROUND');
Attributes.BLACK_BACKGROUND    = Symbol('BLACK_BACKGROUND');
Attributes.CONTIGUOUS_GRAPHICS = CellType.MOSAIC_CONTIGUOUS_;
Attributes.SEPARATED_GRAPHICS  = CellType.MOSAIC_SEPARATED_;
Attributes.ESC                 = Symbol('ESC');
Attributes.FLASH               = Symbol('FLASH');
Attributes.STEADY              = Symbol('STEADY');
Attributes.NORMAL_SIZE         = CellSize.NORMAL_SIZE_;
Attributes.DOUBLE_HEIGHT       = CellSize.DOUBLE_HEIGHT_;
Attributes.DOUBLE_WIDTH        = CellSize.DOUBLE_WIDTH_;
Attributes.DOUBLE_SIZE         = CellSize.DOUBLE_SIZE_;
Attributes.CONCEAL             = Symbol('CONCEAL');
Attributes.HOLD_MOSAICS        = Symbol('HOLD_MOSAICS');
Attributes.RELEASE_MOSAICS     = Symbol('RELEASE_MOSAICS');
Attributes.START_BOX           = Symbol('START_BOX');
Attributes.END_BOX             = Symbol('END_BOX');
Attributes.UNKNOWN_            = Symbol('UNKNOWN'); // pseudo-attribute

// private functions/data below

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

// TODO - tidy up strings
const charToTextColour = {
    [String.fromCharCode(0x0)] : Colour.BLACK,
    [String.fromCharCode(0x1)] : Colour.RED,
    [String.fromCharCode(0x2)] : Colour.GREEN,
    [String.fromCharCode(0x3)] : Colour.YELLOW,
    [String.fromCharCode(0x4)] : Colour.BLUE,
    [String.fromCharCode(0x5)] : Colour.MAGENTA,
    [String.fromCharCode(0x6)] : Colour.CYAN,
    [String.fromCharCode(0x7)] : Colour.WHITE,
};
Object.freeze(charToTextColour);
const charToGraphicColour = {
    [String.fromCharCode(0x10)] : Colour.BLACK,
    [String.fromCharCode(0x11)] : Colour.RED,
    [String.fromCharCode(0x12)] : Colour.GREEN,
    [String.fromCharCode(0x13)] : Colour.YELLOW,
    [String.fromCharCode(0x14)] : Colour.BLUE,
    [String.fromCharCode(0x15)] : Colour.MAGENTA,
    [String.fromCharCode(0x16)] : Colour.CYAN,
    [String.fromCharCode(0x17)] : Colour.WHITE,
};
Object.freeze(charToGraphicColour);
const attributeChars = {
    [String.fromCharCode(0x08)] : Attributes.FLASH,
    [String.fromCharCode(0x09)] : Attributes.STEADY,
    [String.fromCharCode(0x0a)] : Attributes.END_BOX,
    [String.fromCharCode(0x0b)] : Attributes.START_BOX,
    [String.fromCharCode(0x0c)] : Attributes.NORMAL_SIZE,
    [String.fromCharCode(0x0d)] : Attributes.DOUBLE_HEIGHT,
    [String.fromCharCode(0x0e)] : Attributes.DOUBLE_WIDTH,
    [String.fromCharCode(0x0f)] : Attributes.DOUBLE_SIZE,
    [String.fromCharCode(0x18)] : Attributes.CONCEAL,
    [String.fromCharCode(0x19)] : Attributes.CONTIGUOUS_GRAPHICS,
    [String.fromCharCode(0x1a)] : Attributes.SEPARATED_GRAPHICS,
    [String.fromCharCode(0x1b)] : Attributes.ESC,
    [String.fromCharCode(0x1c)] : Attributes.BLACK_BACKGROUND,
    [String.fromCharCode(0x1d)] : Attributes.NEW_BACKGROUND,
    [String.fromCharCode(0x1e)] : Attributes.HOLD_MOSAICS,
    [String.fromCharCode(0x1f)] : Attributes.RELEASE_MOSAICS,
};

const textColourToChar = {};
for (const char in charToTextColour) {
    textColourToChar[charToTextColour[char]] = char;
    attributeChars[char] = charToTextColour[char];
}
Object.freeze(textColourToChar);
const graphicColourToChar = {};
for (const char in charToGraphicColour) {
    graphicColourToChar[charToGraphicColour[char]] = char;
    attributeChars[char] = charToGraphicColour[char];
}
Object.freeze(graphicColourToChar);
Object.freeze(attributeChars);

const spacingAttributesToChar = {};
for (const char in attributeChars) {
    spacingAttributesToChar[attributeChars[char]] = char;
}
Object.freeze(spacingAttributesToChar);

// 'level 0' is fake but derived from Ceefax 1975 pages at https://archive.teletextarchaeologist.org/Pages/Details/21000
// which has different control codes
export const Level = {
    0:   Symbol('0'),   // 7 colour text and contiguous graphics, flashing
    1:   Symbol('1'),   // + background colours, separated graphics, conceal, box, double height
    1.5: Symbol('1.5'), // + black text/graphics
    2.5: Symbol('2.5'), // + double width, double size
};
Object.freeze(Level);

const charCodesByLevel = {};
charCodesByLevel[Level[0]] = [     // fictional level 0
    0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7,
    0x08, 0x09,
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
];
charCodesByLevel[Level[1]] = [...charCodesByLevel[Level[0]]].concat([
    0x0a, 0x0b, 0x0c, 0x0d, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
]);
charCodesByLevel[Level[1.5]] = [...charCodesByLevel[Level[1]]].concat([0x0, 0x10]);
charCodesByLevel[Level[2.5]] = [...charCodesByLevel[Level[1.5]]].concat([0xe, 0xf]);
Object.freeze(charCodesByLevel); 
