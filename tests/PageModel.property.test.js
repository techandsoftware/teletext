import { test, fc } from '@fast-check/vitest';
import { expect } from 'vitest';

import { Attributes, CellSize, Colour, Level } from '../lib/Attributes.js';
import { PageModel } from "../lib/PageModel.js";

const colourArb = fc.constantFrom(...Object.values(Colour));

const attributesArb = fc.tuple(
    fc.option(fc.constant('flashing'), { nil: null }),
    fc.option(fc.constant('concealed'), { nil: null }),
    fc.option(fc.constant('doubleHeight'), { nil: null }),
    fc.option(fc.constant('boxed'), { nil: null })
)   .chain(attributes => fc.shuffledSubarray(attributes, { minLength: 4, maxLength: 4 }));

const cellColoursArb = fc.record({
    fgColour: fc.option(colourArb, { nil: null }),
    bgColour: fc.option(colourArb, { nil: null }),
    blackBg: fc.boolean( 1 / 10) // true if black background attribute is present
})  .map(obj => Object.entries(obj).map(([key, value]) => ({ key, value }))) // convert object to array
    .chain(arr => fc.shuffledSubarray(arr, { minLength: 3, maxLength: 3 }));

const attribCodes = {
    flashing: '\x08',
    concealed: '\x18',
    doubleHeight: '\x0d',
    boxed: '\x0b\x0b'
};

test.prop([attributesArb])('PageModel aggregates level 1.5 attributes', (attributes) => {
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

test.prop([cellColoursArb])('Pagemodel handles colours', (cellColours) => {
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


// TODO
// mosaic attributes
// held, double width, double size
