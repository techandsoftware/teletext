export const Colour = {
    BLACK: Symbol('BLACK'),
    RED: Symbol('RED'),
    GREEN: Symbol('GREEN'),
    YELLOW: Symbol('YELLOW'),
    BLUE: Symbol('BLUE'),
    MAGENTA: Symbol('MAGENTA'),
    CYAN: Symbol('CYAN'),
    WHITE: Symbol('WHITE'),
};

Object.freeze(Colour);

export class Attributes {
    static charFromTextColour(colour) {
        if (colour in textColourToChar) return textColourToChar[colour];
        throw new Error('Attributes.charFromTextColour: bad colour');
    }

    static charFromGraphicColour(colour) {
        if (colour in graphicColourToChar) return graphicColourToChar[colour];
        throw new Error('Attributes.charFromGraphicColour: bad colour');
    }

    static attribFromChar(char) {
        if (char in attributeChars) {
            return {
                value: attributeChars[char],
                isTextColourAttribute: true,
            }
        }
        return {
            value: null,
            isTextColourAttribute: false,
        };
    }

    static colourAttribToFillColour(colour) {
        return(colourAttribToFillColour[colour]);
    }
}

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

const textColourToChar = {
    [Colour.BLACK]   : String.fromCharCode(128),
    [Colour.RED]     : String.fromCharCode(129),
    [Colour.GREEN]   : String.fromCharCode(130),
    [Colour.YELLOW]  : String.fromCharCode(131),
    [Colour.BLUE]    : String.fromCharCode(132),
    [Colour.MAGENTA] : String.fromCharCode(133),
    [Colour.CYAN]    : String.fromCharCode(134),
    [Colour.WHITE]   : String.fromCharCode(135),
};
Object.freeze(textColourToChar);

const graphicColourToChar = {
    [Colour.BLACK]   : String.fromCharCode(144),
    [Colour.RED]     : String.fromCharCode(145),
    [Colour.GREEN]   : String.fromCharCode(146),
    [Colour.YELLOW]  : String.fromCharCode(147),
    [Colour.BLUE]    : String.fromCharCode(148),
    [Colour.MAGENTA] : String.fromCharCode(149),
    [Colour.CYAN]    : String.fromCharCode(150),
    [Colour.WHITE]   : String.fromCharCode(151),
};
Object.freeze(graphicColourToChar);

const attributeChars = {};
for (const colour of Object.getOwnPropertySymbols(textColourToChar)) {
    attributeChars[textColourToChar[colour]] = colour;
}
for (const colour of Object.getOwnPropertySymbols(graphicColourToChar)) {
    attributeChars[graphicColourToChar[colour]] = colour;
}
Object.freeze(attributeChars);
