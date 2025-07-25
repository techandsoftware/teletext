import { test, fc } from '@fast-check/vitest';
import { expect } from 'vitest';

import { Attributes, CellSize, CellType, Colour, Level } from '../lib/Attributes.js';
import { PageModel } from "../lib/PageModel.js";
import encoding from '../lib/data/characterEncodings.json';


// using fast-check to test combinations of attributes

const colourArb = fc.constantFrom(...Object.values(Colour));

const attributesArb = fc.tuple(
    fc.option(fc.constant('flashing'), { nil: null }),
    fc.option(fc.constant('concealed'), { nil: null }),
    fc.option(fc.constant('doubleHeight'), { nil: null }),
    fc.option(fc.constant('boxed'), { nil: null })
).chain(attributes => fc.shuffledSubarray(attributes, { minLength: 4, maxLength: 4 }));

const cellColoursArb = fc.record({
    fgColour: fc.option(colourArb, { nil: null }),
    bgColour: fc.option(colourArb, { nil: null }),
    blackBg: fc.boolean(1 / 10) // true if black background attribute is present
}).map(obj => Object.entries(obj).map(([key, value]) => ({ key, value }))) // convert object to array
    .chain(arr => fc.shuffledSubarray(arr, { minLength: 3, maxLength: 3 }));

const mosaicAttributesArb = fc.tuple(
    fc.option(fc.constant('hold'), { nil: null }),
    fc.option(fc.constant('contiguous', 'separated'), { nil: null }),
).chain(attributes => fc.shuffledSubarray(attributes, { minLength: 2, maxLength: 2 }));

const charArb = fc.integer({ min: 0x20, max: 0x7f }).map(i => String.fromCharCode(i)); // g0 or g1 characters

const attribCodes = {
    flashing: '\x08',
    concealed: '\x18',
    doubleHeight: '\x0d',
    boxed: '\x0b\x0b',
    hold: '\x1e',
    contiguous: '\x19',
    separated: '\x1a',
};

test.prop([attributesArb])('getRow_ aggregates level 1.5 attributes', (attributes) => {
    const text = attributes
        .map(attr => attribCodes[attr] ?? '')
        .join('');

    const expected = {
        flashing: attributes.includes('flashing'),
        concealed: attributes.includes('concealed'),
        size: attributes.includes('doubleHeight') ? CellSize.DOUBLE_HEIGHT_ : CellSize.NORMAL_SIZE_,
        boxed: attributes.includes('boxed')
    };

    const model = new PageModel();
    const rowNum = 1;
    model._setRowFromChars(rowNum, text);
    model.setLevel_(Level[1.5]);
    const cell = model.getRow_(rowNum).getCell_(39);

    expect({
        flashing: cell.flashing_,
        concealed: cell.concealed_,
        size: cell.size_,
        boxed: cell.boxed_
    }).toEqual(expected);
});

test.prop([cellColoursArb])('getRow_ handles colours', (cellColours) => {
    const model = new PageModel();
    const rowNum = 1;

    const expected = {
        fgColour: Colour.WHITE,
        bgColour: Colour.BLACK
    };
    let text = '';
    for (const { key, value } of cellColours) {
        if (!value) continue;
        switch (key) {
            case 'fgColour':
                text += Attributes.charFromTextColour(value);
                expected.fgColour = value;
                break;
            case 'bgColour':
                text += Attributes.charFromTextColour(value) + '\x1d';
                expected.fgColour = value;
                expected.bgColour = value;
                break;
            case 'blackBg':
                text += '\x1c';
                expected.bgColour = Colour.BLACK;
                break;
        }
    }
    model._setRowFromChars(rowNum, text);
    model.setLevel_(Level[1.5]);
    const cell = model.getRow_(rowNum).getCell_(39);

    expect({
        fgColour: cell.fgColour_,
        bgColour: cell.bgColour_
    }).toEqual(expected);
});

function isBurnThroughG0Character(byte) {
    const code = byte.charCodeAt(0);
    return code >= 0x40 && code <= 0x5f;
}

function isUnicodeSextantCharacter(char) {
    return Object.values(encoding['g1_block_mosaic_to_unicode__legacy_computing']).includes(char)
        || Object.values(encoding['g1_block_mosaic_to_unicode__unscii_separated']).includes(char);
}


test.prop([colourArb, mosaicAttributesArb, charArb])('getRow_ handles mosaic attributes', (fgColour, attrs, byte) => {
    const isHeld = attrs.includes('hold');
    const isSeparated = attrs.includes('separated');
    const unheldMosaicDefaultChar = ' ';
    const isG0 = isBurnThroughG0Character(byte);

    let text = Attributes.charFromGraphicColour(fgColour);
    text += attrs.map(attr => attribCodes[attr]).join('');
    text = text.padEnd(38, ' ');
    // set the last two characters
    text += isHeld ? byte + Attributes.charFromGraphicColour(fgColour) // byte is used as the G1 mosaic character to hold and we will test on the following attribute
                   : ' ' + byte; // byte is used as the actual G1 character

    const model = new PageModel();
    model._setRowFromChars(1, text);
    model.setLevel_(Level[1.5]);
    const cell = model.getRow_(1).getCell_(39);

    if (isG0 && isHeld) {
        // non-mosaic char not used as the held char
        expect(cell.char_).toBe(unheldMosaicDefaultChar);
        expect(cell.isMosaicByte_()).toBe(true);
    }
    if (isG0 && !isHeld) {
        // G0 character is used instead of a mosaic
        const code = cell.char_.charCodeAt(0);
        expect(code >= 0x40 && code <= 0x5f).toBe(true); // default primary G0 set in this range since it's almost ASCII
        expect(cell.isMosaicByte_()).toBe(false);
    }
    if (!isG0) {
        // G1 mosaic character mapped to Unicode sextants
        expect(isUnicodeSextantCharacter(cell.char_)).toBe(true);
        expect(cell.isMosaicByte_()).toBe(true);
    }

    // colour and type applied
    expect(cell.type_).toBe(isSeparated ? CellType.MOSAIC_SEPARATED_ : CellType.MOSAIC_CONTIGUOUS_);
    expect(cell.fgColour_).toBe(fgColour);
});

// TODO
// double width, double size
