// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { expect, test } from 'vitest'
import { PageModel } from "../lib/PageModel.js";
import { Attributes as Att, CellType, Colour, CellSize, Level } from "../lib/Attributes.js";

test('page model constructs', () => {
    const model = new PageModel();
    const bytes = model.getBytes_();
    expect(bytes.length).toBe(40*25);
});

test('getRow_ returns RowModel with correct cells for plain text', () => {
    const model = new PageModel();
    const rowNum = 2;
    const text = "Hello, Teletext!".padEnd(40, ' ');
    model._setRowFromChars(rowNum, text);
    const row = model.getRow_(rowNum);

    expect(row._cells.length).toBe(text.length);
    for (let i = 0; i < text.length; i++) {
        expect(row.getCell_(i).char_).toBe(text[i]);
    }
});

test('getRow_ returns correct cells for set-at attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text = Att.charFromTextColour(Colour.RED) + 'x' +
        Att.charFromAttribute(Att.NEW_BACKGROUND) +
        Att.charFromAttribute(Att.BLACK_BACKGROUND) +
        Att.charFromGraphicColour(Colour.GREEN) +
        Att.charFromAttribute(Att.SEPARATED_GRAPHICS) +
        Att.charFromAttribute(Att.CONTIGUOUS_GRAPHICS) +
        Att.charFromAttribute(Att.FLASH) + 'x' +
        Att.charFromAttribute(Att.STEADY) +
        Att.charFromAttribute(Att.DOUBLE_HEIGHT) + 'x' +
        Att.charFromAttribute(Att.NORMAL_SIZE) +
        Att.charFromAttribute(Att.CONCEAL) +
        "\x21" + // a mosaic character
        Att.charFromAttribute(Att.HOLD_MOSAICS);

    model.setRowFromChars_(rowNum, text);
    const row = model.getRow_(rowNum);

    // cell index : cell property and expected value
    const expected = {
        2: { bgColour_: Colour.RED },
        3: { bgColour_: Colour.BLACK },
        5: { type_: CellType.MOSAIC_SEPARATED_ },
        6: { type_: CellType.MOSAIC_CONTIGUOUS_ },
        9: { flashing_: false },
        12: { size_: CellSize.NORMAL_SIZE_ },
        13: { concealed_: true },
        15: { char_: '\ud83e\udf00' } // a unicode sextant
    };
    
    checkExpectedCells(row, expected);
});


test('getRow_ returns correct cells for set-after attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text =
        Att.charFromGraphicColour(Colour.RED) + 'x' +
        Att.charFromTextColour(Colour.GREEN) + 'x' +
        Att.charFromAttribute(Att.FLASH) + 'x' +
        Att.charFromAttribute(Att.DOUBLE_HEIGHT) + 'x' +
        // set up for release mosaic
        Att.charFromGraphicColour(Colour.MAGENTA) + 
        Att.charFromAttribute(Att.HOLD_MOSAICS) + '\x21' +
        Att.charFromAttribute(Att.RELEASE_MOSAICS) + 
        Att.charFromGraphicColour(Colour.BLUE);

    model.setRowFromChars_(rowNum, text);
    const row = model.getRow_(rowNum);

    const expected = {
        0: { fgColour_: Colour.WHITE, type_: CellType.ALPHA_ },
        1: { fgColour_: Colour.RED, type_: CellType.MOSAIC_CONTIGUOUS_ },
        2: { fgColour_: Colour.RED, type_: CellType.MOSAIC_CONTIGUOUS_ },
        3: { fgColour_: Colour.GREEN, type_: CellType.ALPHA_ },
        4: { flashing_: false },
        5: { flashing_: true },
        6: { size_: CellSize.NORMAL_SIZE_ },
        7: { size_: CellSize.DOUBLE_HEIGHT_ },
        11: { char_: '\ud83e\udf00' }, // a unicode sextant
        12: { char_: ' ' }
    };

    checkExpectedCells(row, expected);
});

test('getRow_ returns cells with correct g0 characters mapped', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text = '#' +
        Att.charFromAttribute(Att.ESC) +
        '#A' +
        Att.charFromAttribute(Att.ESC) +
        '#';

    model.setRowFromChars_(rowNum, text);
    model.setPrimaryG0CharacterEncoding_('g0_latin__english');

    // first test with no secondary g0 set
    let row = model.getRow_(rowNum);
    expect(row.getCell_(0).char_).toBe('£'); // English G0 set mapped from #
    expect(row.getCell_(2).char_).toBe('£');
    expect(row.getCell_(3).char_).toBe('A');

    // test again with a secondary g0 set
    model.setSecondaryG0CharacterEncoding_('g0_latin__french');

    row = model.getRow_(rowNum);
    expect(row.getCell_(0).char_).toBe('£');
    expect(row.getCell_(2).char_).toBe('é'); // French G0 set mapped from #
    expect(row.getCell_(3).char_).toBe('A');
    expect(row.getCell_(5).char_).toBe('£');
});

test('getRow_ returns correct cells for boxing and unboxing attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    // start and end box is set between the start or end attributes
    const text =
        Att.charFromAttribute(Att.START_BOX) + 'x' +
        Att.charFromAttribute(Att.START_BOX) +
        Att.charFromAttribute(Att.START_BOX) + 'x' +
        Att.charFromAttribute(Att.END_BOX) + 'x' +
        Att.charFromAttribute(Att.END_BOX) +
        Att.charFromAttribute(Att.END_BOX);

    model.setRowFromChars_(rowNum, text);
    const row = model.getRow_(rowNum);

    const expected = {
        0: { boxed_: false },
        1: { boxed_: false },
        3: { boxed_: true },
        4: { boxed_: true },
        5: { boxed_: true },
        7: { boxed_: true },
        8: { boxed_: false }
    };

    checkExpectedCells(row, expected);
});

test('getRow_ returns correct cells for set-after attributes overriden by set-at attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text =
        Att.charFromAttribute(Att.FLASH) + // set-after
        Att.charFromAttribute(Att.STEADY) + // set-at

        Att.charFromAttribute(Att.DOUBLE_SIZE) + 
        Att.charFromAttribute(Att.DOUBLE_HEIGHT) + // set-after
        Att.charFromAttribute(Att.NORMAL_SIZE) + // set-at

        Att.charFromAttribute(Att.DOUBLE_SIZE) + 
        Att.charFromAttribute(Att.DOUBLE_WIDTH) + // set-after
        Att.charFromAttribute(Att.NORMAL_SIZE) + // set-at

        Att.charFromAttribute(Att.DOUBLE_HEIGHT) + 
        Att.charFromAttribute(Att.DOUBLE_SIZE) + // set-after
        Att.charFromAttribute(Att.NORMAL_SIZE) + // set-at

        // set-up for cancelled release mosaic
        Att.charFromGraphicColour(Colour.GREEN) +
        Att.charFromAttribute(Att.HOLD_MOSAICS) +
        '\x21' + // a mosaic character
        Att.charFromAttribute(Att.RELEASE_MOSAICS) + // set-after
        Att.charFromAttribute(Att.HOLD_MOSAICS); // set-at

    model.setRowFromChars_(rowNum, text);
    model.setLevel_(Level[2.5]);
    const row = model.getRow_(rowNum);

    const expected = {
        1: { flashing_: false },
        4: { size_: CellSize.NORMAL_SIZE_ },
        7: { size_: CellSize.NORMAL_SIZE_ },
        10: { size_: CellSize.NORMAL_SIZE_ },
        15: { char_: '\ud83e\udf00' }
    };

    checkExpectedCells(row, expected);
});

test('getRow_ returns correct cells when concealed is cancelled by certain attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text = Att.charFromAttribute(Att.CONCEAL) + 
        Att.charFromGraphicColour(Colour.RED) + 'x' +
        Att.charFromAttribute(Att.CONCEAL) + 
        Att.charFromTextColour(Colour.GREEN) + 'x';

    model.setRowFromChars_(rowNum, text);
    const row = model.getRow_(rowNum);

    expect(row.getCell_(2).concealed_).toBe(false);
    expect(row.getCell_(5).concealed_).toBe(false);
});

test('getRow_ ignores unknown attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    // ignored at level 1
    const text = Att.charFromAttribute(Att.DOUBLE_SIZE) +
        Att.charFromAttribute(Att.DOUBLE_WIDTH);

    model.setRowFromChars_(rowNum, text);
    const row = model.getRow_(rowNum);

    const expected = {
        0: { char_: ' ' },
        1: { size_: CellSize.NORMAL_SIZE_ },
        1: { char_: ' ' },
        2: { size_: CellSize.NORMAL_SIZE_ },
    };

    checkExpectedCells(row, expected);
});


test('getRow_ throws error for out-of-bounds rowNum', () => {
    const model = new PageModel();
    expect(() => model.getRow_(25)).toThrow();
    expect(() => model.getRow_(-1)).toThrow();
});

// TODO
// g0 enhancement
// g1 enhancement
// g2 enhancement
// g3 enhancement


test.skip('getRow_ applies enhancements if present', () => {
    const model = new PageModel();
    const rowNum = 6;
    const text = "A".repeat(40);
    model.setRowFromChars_(rowNum, text);
    model.setLevel_(1.5); // Enable enhancements
    model.enhance_([{x_: 2, y_: rowNum, type_: 'g0', char_: 'Z'}]);
    const row = model.getRow_(rowNum);
    expect(row.cells_[2].byte_).toBe('Z');
});

function checkExpectedCells(row, expected) {
    for (const [idx, props] of Object.entries(expected)) {
        const cell = row.getCell_(idx);
        for (const [key, value] of Object.entries(props)) {
            expect(cell[key]).toBe(value);
        }
    }
}
