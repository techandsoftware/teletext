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

    static fillColourFromColourAttrib(colour) {
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
    [Colour.BLACK]   : String.fromCharCode(0),
    [Colour.RED]     : String.fromCharCode(1),
    [Colour.GREEN]   : String.fromCharCode(2),
    [Colour.YELLOW]  : String.fromCharCode(3),
    [Colour.BLUE]    : String.fromCharCode(4),
    [Colour.MAGENTA] : String.fromCharCode(5),
    [Colour.CYAN]    : String.fromCharCode(6),
    [Colour.WHITE]   : String.fromCharCode(7),
};
Object.freeze(textColourToChar);

const graphicColourToChar = {
    [Colour.BLACK]   : String.fromCharCode(16),
    [Colour.RED]     : String.fromCharCode(17),
    [Colour.GREEN]   : String.fromCharCode(18),
    [Colour.YELLOW]  : String.fromCharCode(19),
    [Colour.BLUE]    : String.fromCharCode(20),
    [Colour.MAGENTA] : String.fromCharCode(21),
    [Colour.CYAN]    : String.fromCharCode(22),
    [Colour.WHITE]   : String.fromCharCode(23),
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
