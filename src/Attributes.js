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
    ALPHA : Symbol('ALPHA'),
    MOSAIC: Symbol('MOSAIC'),
};
Object.freeze(CellType);

// export const SpacingAttributes = {
//     TEXT_COLOUR: Symbol('TEXT_COLOUR'),
//     MOSAIC_COLOUR: Symbol('MOSAIC_COLOUR'),
//     NEW_BACKGROUND: Symbol('NEW_BACKGROUND'),
//     BLACK_BACKGROUND: Symbol('BLACK_BACKGROUND'),
// };
// Object.freeze(SpacingAttributes);

export class Attributes {
    static charFromTextColour(colour) {
        if (colour in textColourToChar) return textColourToChar[colour];
        throw new Error('Attributes.charFromTextColour: bad colour');
    }

    static charFromGraphicColour(colour) {
        if (colour in graphicColourToChar) return graphicColourToChar[colour];
        throw new Error('Attributes.charFromGraphicColour: bad colour');
    }

    static charFromAttribute(attrib) {
        if (attrib in spacingAttributesToChar) return spacingAttributesToChar[attrib];
        throw new Error('Attributes.charFromAttribute: bad attribute');
    }

    static attribFromChar(char) {
        let attribute = null;
        let colour = null;
        if (char in attributeChars) {
            if (char in charToTextColour) {
                attribute = Attributes.TEXT_COLOUR;
                colour = attributeChars[char];
            } else if (char in charToGraphicColour) {
                attribute = Attributes.MOSAIC_COLOUR;
                colour = attributeChars[char];
            } else {
                attribute = attributeChars[char];
            }
        }
        return { attribute, colour };
    }

    static fillColourFromColourAttrib(colour) {
        return(colourAttribToFillColour[colour]);
    }
}
Attributes.TEXT_COLOUR      = Symbol('TEXT_COLOUR');
Attributes.MOSAIC_COLOUR    = Symbol('MOSAIC_COLOUR');
Attributes.NEW_BACKGROUND   = Symbol('NEW_BACKGROUND');
Attributes.BLACK_BACKGROUND = Symbol('BLACK_BACKGROUND');

// private data below

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
    [String.fromCharCode(0x1c)] : Attributes.BLACK_BACKGROUND,
    [String.fromCharCode(0x1d)] : Attributes.NEW_BACKGROUND,
};

const textColourToChar = {};
for (const char in charToTextColour) {
    textColourToChar[charToTextColour[char]] = char;
}
Object.freeze(textColourToChar);

const graphicColourToChar = {};
for (const char in charToGraphicColour) {
    graphicColourToChar[charToGraphicColour[char]] = char;
}
Object.freeze(graphicColourToChar);

for (const char in charToTextColour) {
    attributeChars[char] = charToTextColour[char];
}
for (const char in charToGraphicColour) {
    attributeChars[char] = charToGraphicColour[char];
}
Object.freeze(attributeChars);

const spacingAttributesToChar = {};
for (const char in attributeChars) {
    spacingAttributesToChar[attributeChars[char]] = char;
}
Object.freeze(spacingAttributesToChar);
