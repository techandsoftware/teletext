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
}

export const colourAttribToFillColour = {};
colourAttribToFillColour[Colour.BLACK]   = 'black';
colourAttribToFillColour[Colour.RED]     = 'red';
colourAttribToFillColour[Colour.GREEN]   = 'green';
colourAttribToFillColour[Colour.YELLOW]  = 'yellow';
colourAttribToFillColour[Colour.BLUE]    = 'blue';
colourAttribToFillColour[Colour.MAGENTA] = 'magenta';
colourAttribToFillColour[Colour.CYAN]    = 'cyan';
colourAttribToFillColour[Colour.WHITE]   = 'white';
Object.freeze(colourAttribToFillColour);


// private data below

const textColourToChar = {};
textColourToChar[Colour.BLACK]   = String.fromCharCode(128);
textColourToChar[Colour.RED]     = String.fromCharCode(129);
textColourToChar[Colour.GREEN]   = String.fromCharCode(130);
textColourToChar[Colour.YELLOW]  = String.fromCharCode(131);
textColourToChar[Colour.BLUE]    = String.fromCharCode(132);
textColourToChar[Colour.MAGENTA] = String.fromCharCode(133);
textColourToChar[Colour.CYAN]    = String.fromCharCode(134);
textColourToChar[Colour.WHITE]   = String.fromCharCode(135);
Object.freeze(textColourToChar);

const graphicColourToChar = {};
graphicColourToChar[Colour.BLACK]   = String.fromCharCode(144);
graphicColourToChar[Colour.RED]     = String.fromCharCode(145);
graphicColourToChar[Colour.GREEN]   = String.fromCharCode(146);
graphicColourToChar[Colour.YELLOW]  = String.fromCharCode(147);
graphicColourToChar[Colour.BLUE]    = String.fromCharCode(148);
graphicColourToChar[Colour.MAGENTA] = String.fromCharCode(149);
graphicColourToChar[Colour.CYAN]    = String.fromCharCode(150);
graphicColourToChar[Colour.WHITE]   = String.fromCharCode(151);
Object.freeze(graphicColourToChar);

const attributeChars = {};
for (const colour of Object.getOwnPropertySymbols(textColourToChar)) {
    attributeChars[textColourToChar[colour]] = colour;
}
for (const colour of Object.getOwnPropertySymbols(graphicColourToChar)) {
    attributeChars[graphicColourToChar[colour]] = colour;
}
Object.freeze(attributeChars);

