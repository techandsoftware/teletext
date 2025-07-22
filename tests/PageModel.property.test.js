import { test, fc } from '@fast-check/vitest';
import { expect } from 'vitest';

import { Attributes, Colour, Level } from '../lib/Attributes.js';
import { PageModel } from "../lib/PageModel.js";

const colourArb = fc.constantFrom(...Object.values(Colour));

test.prop([colourArb, fc.boolean(), fc.boolean()])
    ('PageModel aggregates text attributes', (fgColour, flashing, concealed) => {
    const model = new PageModel();
    const rowNum = 1;

    const text = Attributes.charFromTextColour(fgColour) +
        (flashing ? '\x08' : ' ') +
        (concealed ? '\x18' : ' ');

    model._setRowFromChars(rowNum, text);
    model.setLevel_(Level[1.5]);
    const cell = model.getRow_(rowNum).getCell_(39);

    expect(cell.fgColour_).toBe(fgColour);
    expect(cell.flashing_).toBe(flashing);
    expect(cell.concealed_).toBe(concealed);

});
// TODO
// add more attributes
// new background
// new text colour
// double height
