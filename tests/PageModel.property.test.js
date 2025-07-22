import { test, fc } from '@fast-check/vitest';
import { expect } from 'vitest';

import { Attributes, Colour, Level } from '../lib/Attributes.js';
import { PageModel } from "../lib/PageModel.js";

const colourArb = fc.constantFrom(...Object.values(Colour));

test.prop([colourArb, fc.boolean()])
    ('PageModel aggregates text attributes', (fgColour, flashing) => {
    const model = new PageModel();
    const rowNum = 1;

    const text = Attributes.charFromTextColour(fgColour) +
        (flashing ? '\x08' : ' ');

    model._setRowFromChars(rowNum, text);
    model.setLevel_(Level[1.5]);
    const row = model.getRow_(rowNum);

    expect(row.getCell_(39).fgColour_).toBe(fgColour);
    expect(row.getCell_(39).flashing_).toBe(flashing);
});
// TODO
// add more attributes
