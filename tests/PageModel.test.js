// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { describe, beforeEach, expect, test } from 'vitest'
import { PageModel } from "../lib/PageModel.js";
import { Attributes as Att, CellType, Colour, CellSize, Level } from "../lib/Attributes.js";
import { Enhancement } from "../lib/Enhancement.js";

test('page model constructs', () => {
    const model = new PageModel();
    const bytes = model.getBytes_();
    expect(bytes.length).toBe(40 * 25);
});

test('getRow_ returns RowModel with correct cells for plain text', () => {
    const model = new PageModel();
    const rowNum = 2;
    const text = "Hello, Teletext!".padEnd(40, '.');
    model._setRowFromChars(rowNum, text);
    const row = model.getRow_(rowNum);

    expect(row._cells.length).toBe(text.length);
    for (let i = 0; i < text.length; i++) {
        expect(row.getCell_(i).char_).toBe(text[i]);
    }
});

test('getRow_ handles set-at attributes', () => {
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
        Att.charFromAttribute(Att.DOUBLE_HEIGHT) + 'x' + //  set-up for NORMAL_SIZE
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


test('getRow_ handles set-after attributes', () => {
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

test('getRow_ handles primary and secondary g0 character mapping', () => {
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

test('getRow_ handles boxing and unboxing attributes', () => {
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
        2: { boxed_: false },
        3: { boxed_: true },
        4: { boxed_: true },
        5: { boxed_: true },
        6: { boxed_: true },
        7: { boxed_: true },
        8: { boxed_: false }
    };

    checkExpectedCells(row, expected);
});

test('getRow_ handles set-after attributes overriden by set-at attributes', () => {
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

test('getRow_ cancels concealed on certain attributes', () => {
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
        0: { char_: ' ',
             size_: CellSize.NORMAL_SIZE_ },
        1: { char_: ' ',
             size_: CellSize.NORMAL_SIZE_ },
    };

    checkExpectedCells(row, expected);
});


test('getRow_ throws error for out-of-bounds rowNum', () => {
    const model = new PageModel();
    expect(() => model.getRow_(25)).toThrow();
    expect(() => model.getRow_(-1)).toThrow();
});

test('getRow_ applies level 1.5 enhancements', () => {
    const model = new PageModel();
    const rowNum = 1;
    const text = "A".repeat(40);
    model.setRowFromChars_(rowNum, text);

    const enhancement = new Enhancement(model);
    enhancement.
        pos(1, 1).putG0('e').
        pos(2, 1).putG0('e', 1).
        pos(3, 1).putG1('!').
        pos(4, 1).putG2('!').
        pos(5, 1).putG3('\x5b').
        pos(6, 1).putG3('!').
        pos(7, 1).putAt().
        end();
    model.setLevel_(Level[1.5]);

    const row = model.getRow_(rowNum);
    const expected = {
        1: { char_: 'e' },
        2: { char_: 'e\u0300' }, // e with grave accent
        3: { char_: 'A' }, // G1 enhancement (mosaic) ignored at level 1.5
        4: { char_: '¡' }, // G2
        5: { char_: '→' }, // G3 (4 characters supported at level 1.5)
        6: { char_: 'A' }, // most G3 characters ignored at level 1.5
        7: { char_: '@' },
    };

    checkExpectedCells(row, expected);
});

test('getRow_ applies correct G0 sets for enhancements', () => {
    const model = new PageModel();
    const rowNum = 1;
    const text = "A".repeat(40);
    model.setRowFromChars_(rowNum, text);

    const enhancement = new Enhancement(model);
    enhancement.
        pos(1, 1).putG0('#').
        pos(2, 1).putG0('$').
        pos(3, 1).putG0('[').
        end();
    model.setLevel_(Level[1.5]);
    model.setPrimaryG0CharacterEncoding_('g0_latin__english');

    const row = model.getRow_(rowNum);
    // national option characters ignored with fallback to G0 Latin
    const expected = {
        1: { char_: '#' },
        2: { char_: '¤' },
        3: { char_: '[' },
    };

    checkExpectedCells(row, expected);

    // test 2, check non-Latin set
    model.setPrimaryG0CharacterEncoding_('g0_hebrew');
    const row2 = model.getRow_(rowNum);

    const expected2 = {
        1: { char_: '£' },
        2: { char_: '$' },
        3: { char_: '←' },
    };

    checkExpectedCells(row2, expected2);
});

test('getRow_ applies the correct cell type on a held mosaic', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text = '\x17\x66\x1e\x39\x1a\x1f\x66'; // from G.3.3 in ETSI 300 706

    model.setRowFromChars_(rowNum, text);
    const row = model.getRow_(rowNum);

    const expected = {
        2: { char_: '\ud83e\udf24',
             type_: CellType.MOSAIC_CONTIGUOUS_ },
        4: { char_: '\ud83e\udf17',
             type_: CellType.MOSAIC_CONTIGUOUS_ }, // separated is active but the held mosaic is contiguous
        5: { char_: '\ud83e\udf17',
             type_: CellType.MOSAIC_CONTIGUOUS_ }, // held
        6: { char_: '\ue0ea', // Unscii
             type_: CellType.MOSAIC_SEPARATED_ } // non-held - separated takes effect
    };

    checkExpectedCells(row, expected);
});

test('getRow_ resets the held mosaic on a change of alphanumeric mode or size', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text1 = Att.charFromGraphicColour(Colour.RED) +
        '\x21' +
        Att.charFromAttribute(Att.HOLD_MOSAICS) +
        Att.charFromTextColour(Colour.GREEN) +
        Att.charFromGraphicColour(Colour.RED);

    const text2 = Att.charFromGraphicColour(Colour.RED) +
        '\x21' +
        Att.charFromAttribute(Att.HOLD_MOSAICS) +
        Att.charFromAttribute(Att.DOUBLE_HEIGHT);

    model.setRowFromChars_(rowNum, text1);
    model.setRowFromChars_(rowNum, text2);

    expect(model.getRow_(1).getCell_(4).char_).toBe(' ');
    expect(model.getRow_(2).getCell_(3).char_).toBe(' ');
});

test('getRow_ keeps the held mosaic on certain attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text = Att.charFromGraphicColour(Colour.RED) +
        '\x21' +
        Att.charFromAttribute(Att.HOLD_MOSAICS) +
        Att.charFromGraphicColour(Colour.GREEN) + // still graphic mode
        Att.charFromAttribute(Att.NORMAL_SIZE); // still normal size

    model.setRowFromChars_(rowNum, text);

    expect(model.getRow_(1).getCell_(4).char_).toBe('\ud83e\udf00');
});

test('getRow_ ensures G0 enhancements are not effected by secondary G0 set', () => {
    const model = new PageModel();
    const rowNum = 1;
    const text = Att.charFromAttribute(Att.ESC) + "A".repeat(40);
    model.setRowFromChars_(rowNum, text);

    const enhancement = new Enhancement(model);
    enhancement.
        pos(1, 1).putG0('a').
        end();
    model.setLevel_(Level[1.5]);
    model.setSecondaryG0CharacterEncoding_('g0_hebrew');

    expect(model.getRow_(1).getCell_(1).char_).toBe('a');
});

test('getRow_ handles level 2.5 set-after attributes', () => {
    const model = new PageModel();
    const rowNum = 1;

    const text = Att.charFromAttribute(Att.DOUBLE_WIDTH) + 'x ' +
        Att.charFromAttribute(Att.DOUBLE_SIZE) + 'x ' +
        // test set-after overriden by set-at
        Att.charFromAttribute(Att.DOUBLE_WIDTH) +
        Att.charFromAttribute(Att.NORMAL_SIZE) +
        Att.charFromAttribute(Att.DOUBLE_HEIGHT) +
        Att.charFromAttribute(Att.DOUBLE_SIZE) +
        Att.charFromAttribute(Att.NORMAL_SIZE);

    model.setRowFromChars_(rowNum, text);
    model.setLevel_(Level[2.5]);
    const row = model.getRow_(rowNum);

    expect(row.getCell_(1).size_).toBe(CellSize.DOUBLE_WIDTH_);
    expect(row.getCell_(4).size_).toBe(CellSize.DOUBLE_SIZE_);
    expect(row.getCell_(7).size_).toBe(CellSize.NORMAL_SIZE_);
    expect(row.getCell_(10).size_).toBe(CellSize.NORMAL_SIZE_);
});

test('getRow_ applies level 2.5 enhancements', () => {
    const model = new PageModel();
    const rowNum = 1;
    const text = 'A' + Att.charFromAttribute(Att.SEPARATED_GRAPHICS) + "A".repeat(40);
    model.setRowFromChars_(rowNum, text);

    const enhancement = new Enhancement(model);
    enhancement.
        pos(0, 1).putG1('!').
        pos(2, 1).putG1('!').
        pos(3, 1).putG1('@').
        pos(4, 1).putG1('D').
        pos(5, 1).putG3('!').
        end();
    model.setLevel_(Level[2.5]);

    const row = model.getRow_(rowNum);
    // spec question - assuming that the separated form from the base page is applied to G1 enhancements
    const expected = {
        0: { char_: '\ud83e\udf00', // unicode mosaic/sextant
             type_: CellType.MOSAIC_CONTIGUOUS_ },
        2: { char_: '\ue0c1', // unscii
             type_: CellType.MOSAIC_SEPARATED_ },
        3: { char_: '@' }, // G0 Latin set
        4: { char_: 'D' }, // G0 Latin set
        5: { char_: '🬽',
             type_: CellType.G3_ }
    };

    checkExpectedCells(row, expected);
    expect(row.getCell_(3).isMosaic_()).toBe(false);
    expect(row.getCell_(4).isMosaic_()).toBe(false);

    // test correct G0 set used for certain G1 characters
    model.setPrimaryG0CharacterEncoding_('g0_greek');
    const row2 = model.getRow_(rowNum);
    expect(row2.getCell_(3).char_).toBe('ΐ');
    expect(row2.getCell_(4).char_).toBe('Δ');
});

describe('getText_ returns text', () => {
    let model;

    beforeEach(() => {
        model = new PageModel();
        const rowNum = 1;

        const text = 'a#'
            + Att.charFromGraphicColour(Colour.RED)
            + 'b' // block mosaic
            + Att.charFromTextColour(Colour.GREEN)
            + 'c'
            + Att.charFromAttribute(Att.DOUBLE_HEIGHT) + 'd'
            + Att.charFromAttribute(Att.DOUBLE_SIZE) + 'ef'
            + Att.charFromAttribute(Att.NORMAL_SIZE)
            + Att.charFromAttribute(Att.HOLD_MOSAICS)
            + Att.charFromGraphicColour(Colour.YELLOW)
            + 'g' // block mosaic
            + Att.charFromAttribute(Att.SEPARATED_GRAPHICS) // separated is active, held mosaic is contiguous
            + 'h' // separated mosaic
            + Att.charFromGraphicColour(Colour.BLUE); // held mosaic is separated

        model.setRowFromChars_(0, text);
        model.setRowFromChars_(1, 'hidden');
        model.setRowFromChars_(2, 'xx' + Att.charFromAttribute(Att.SEPARATED_GRAPHICS) + ''.padEnd(37, 'x'));

        const enhancement = new Enhancement(model);
        enhancement.
            pos(0, 2).putG0('e', 1). // text
            pos(1, 2).putG1('!').    // graphic - contiguous mosaic
            pos(3, 2).putG1('!').    // graphic - separated mosaic
            pos(4, 2).putG1('[').    // text (burned through)
            pos(5, 2).putG1('D').    // text (burned through)
            pos(6, 2).putG2('!').    // text
            pos(7, 2).putG3('!').    // graphic
            pos(8, 2).putAt().       // text
            end();

        // TODO enhancements
        model.setPrimaryG0CharacterEncoding_('g0_latin__english');
        model.setLevel_(Level[2.5]);
    });

    test('text only', () => {
        const result = model.getText_(false);
        const rows = result.split('\n');
        expect(rows[0]).toEqual('a£   c d e '.padEnd(40, ' '));
        expect(rows[1]).toEqual('');
        expect(rows[2]).toEqual('e\u0300   [D¡ @' + 'x'.repeat(31));
    });

    test('text and graphics', () => {
        const result = model.getText_(true);
        const rows = result.split('\n');

        /*
        \u{0300} = grave accent
        \u{1FB20} = BLOCK SEXTANT-6
        \u{1FB25} = BLOCK SEXTANT-1236
        \u{E0F0} = SEPARATED BLOCK SEXTANT-46 in Unscii's PUA (Unicode 16 has since mapped this as \u{1CE78})
        \u{1FB00} = BLOCK SEXTANT-1
        \u{E0C1} = SEPARATED BLOCK SEXTANT-1 in Unscii's PUA (Unicode 16 has since mapped this as \u{1CE51})
        \u{1FB3D} = LOWER LEFT BLOCK DIAGONAL LOWER MIDDLE LEFT TO LOWER RIGHT */
        const expected = 'a£ \u{1FB20} c d e    \u{1FB25}\u{1FB25}\u{E0F0}\u{E0F0}' + ' '.repeat(22);
        expect(rows[0]).toEqual(expected);
        expect(rows[1]).toEqual('');
        expect(rows[2]).toEqual('e\u{0300}\u{1FB00} \u{E0C1}[D¡\u{1FB3D}@' + 'x'.repeat(31));
    });
});


function checkExpectedCells(row, expected) {
    for (const [idx, props] of Object.entries(expected)) {
        const cell = row.getCell_(idx);
        for (const [key, value] of Object.entries(props)) {
            expect(cell[key]).toBe(value);
        }
    }
}
