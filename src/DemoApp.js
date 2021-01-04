import { Attributes, Colour, Level } from '../dist/teletext.js';

const ASPECT_RATIOS = [1.2, 1.22, 1.33, 'natural'];
const FONTS = ['sans-serif', 'Bedstead', 'native', 'serif', 'Unscii', 'Ubuntu'];
const CHARACTER_SETS = [
    'latin_g0',
    'latin_g0__czech_slovak',
    'latin_g0__english',
    'latin_g0__estonian',
    'latin_g0__french',
    'latin_g0__german',
    'latin_g0__italian',
    'latin_g0__latvian_lithuanian',
    'latin_g0__polish',
    'latin_g0__portuguese_spanish',
    'latin_g0__romanian',
    'latin_g0__serbian_croatian_slovenian',
    'latin_g0__swedish_finnish_hungarian',
    'latin_g0__turkish',
    'greek_g0',
    'cyrillic_g0__russian_bulgarian',
    'cyrillic_g0__serbian_croatian',
    'cyrillic_g0__ukranian',
    'arabic_g0',
    'hebrew_g0',
];
const VIEWS = ['classic__graphic-for-mosaic', 'classic__font-for-mosaic'];

export class DemoApp {
    constructor(teletext) {
        this.t = teletext;
        this.KEY_EVENTS = {
            '?': 'ttx.reveal',
            'm': 'ttx.mix',
            's': 'ttx.subtitlemode',
        };
        this._initEventListeners();
        this._aspectRatioIndex = 0;
        this._fontIndex = 0;
        this._charSetIndex = 0;
        this._viewIndex = 0;
        // this.t.setHeight(720 * 0.9);
    }

    _initEventListeners() {
        window.addEventListener('keypress', e => {
            switch (e.key) {
                case '?':
                    window.dispatchEvent(new Event(this.KEY_EVENTS[e.key]));
                    break;
                case 'm':
                    window.dispatchEvent(new Event(this.KEY_EVENTS[e.key]));
                    break;
                case 's':
                    window.dispatchEvent(new Event(this.KEY_EVENTS[e.key]));
                    break;
                case 't':
                    this.t.showTestPage();
                    break;
                case 'x':
                    this.t.showRandomisedPage();
                    break;
                case 'c': // for cells
                    this.t.toggleGrid();
                    break;
                case 'a':
                    this._aspectRatioIndex++;
                    if (this._aspectRatioIndex == ASPECT_RATIOS.length) this._aspectRatioIndex = 0;
                    this.t.setAspectRatio(ASPECT_RATIOS[this._aspectRatioIndex]);
                    break;
                case 'd':
                    this.setPageRows();
                    break;
                case 'f':
                    this._fontIndex++;
                    if (this._fontIndex == FONTS.length) this._fontIndex = 0;
                    console.debug('setting font to', FONTS[this._fontIndex]);
                    this.t.setFont(FONTS[this._fontIndex]);
                    break;
                case 'w': // for wipe
                    this.t.clearScreen(true);
                    break;
                case 'h':
                    this.t.setHeight(document.head.parentElement.clientHeight * 0.8);
                    break;
                case 'e': // for encoding
                    this._charSetIndex++;
                    if (this._charSetIndex == CHARACTER_SETS.length) this._charSetIndex = 0;
                    this.t.setDefaultG0Charset(CHARACTER_SETS[this._charSetIndex], true);
                    break;
                case 'v':
                    this._viewIndex++;
                    if (this._viewIndex == VIEWS.length) this._viewIndex = 0;
                    this.t.setView(VIEWS[this._viewIndex]);
                    break;
                case 'z':
                    this.t.clearScreen(false);
                    this.setPageWithSizingAttributes();
                    break;
                default:
            }
        });
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('revealButton').addEventListener('click', () => {
                window.dispatchEvent(new Event('ttx.reveal'));
            });
            document.getElementById('levelSelect').addEventListener('input', e => {
                this.t.setLevel(Level[e.target.value]);
            });
        });
    }

    setPageRows() {
        this.t.setPageRows([
            'This is teletext level 1.5  ETSI 300 706',
            Attributes.charFromTextColour(Colour.RED) + '   40 columns \u007f 24 rows \u007f 8 colours',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + ' ' +
                Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.BLACK) + '    96',
            'abcdefghijklmnopqrstuvwxyz' + ' ' +
                Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.BLACK) + 'characters',
            '0123456789012345678901234567890123456789',
            ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~\u007f',
            '````````````````````````````````````````',
            'This is' + Attributes.charFromTextColour(Colour.WHITE)   + 'white text!  ' + Attributes.charFromTextColour(Colour.YELLOW) + 'yellow text!',
            '     ' + Attributes.charFromAttribute(Attributes.START_BOX) + Attributes.charFromAttribute(Attributes.START_BOX) + Attributes.charFromTextColour(Colour.CYAN)    + 'cyan text!   ' + Attributes.charFromTextColour(Colour.GREEN)  + 'green text!' + Attributes.charFromAttribute(Attributes.END_BOX),
            '       ' + Attributes.charFromTextColour(Colour.MAGENTA) + 'magenta text!' + Attributes.charFromTextColour(Colour.RED)    + 'red text!',
            '       ' + Attributes.charFromTextColour(Colour.BLUE)    + 'blue text! '   + Attributes.charFromTextColour(Colour.WHITE) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.BLACK) + 'black text! ' + Attributes.charFromAttribute(Attributes.BLACK_BACKGROUND),
            Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + '   ' +
                Attributes.charFromTextColour(Colour.YELLOW) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)  + '   ' +
                Attributes.charFromTextColour(Colour.CYAN) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)    + '   ' +
                Attributes.charFromTextColour(Colour.GREEN) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)   + '   ' +
                Attributes.charFromTextColour(Colour.MAGENTA) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + '   ' +
                Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)     + '   ' +
                Attributes.charFromTextColour(Colour.BLUE) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)    + '   ' +
                Attributes.charFromTextColour(Colour.BLACK) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)   + '   ',
            Attributes.charFromGraphicColour(Colour.WHITE) + '    !"#$%&\'()*+,-./' +  Attributes.charFromTextColour(Colour.WHITE) + "  64 graphic",
            Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromGraphicColour(Colour.WHITE) + ' 0123456789:;<=>?' + Attributes.charFromTextColour(Colour.WHITE) + '  characters',
            Attributes.charFromGraphicColour(Colour.WHITE) + '   `abcdefghijklmno',
            Attributes.charFromGraphicColour(Colour.WHITE) + ' ' + Attributes.charFromAttribute(Attributes.START_BOX) + Attributes.charFromAttribute(Attributes.START_BOX) + 'pqrstuvwxyz{|}~\u007f' + Attributes.charFromAttribute(Attributes.END_BOX) + Attributes.charFromTextColour(Colour.WHITE) + Attributes.charFromAttribute(Attributes.FLASH) +  Attributes.charFromAttribute(Attributes.START_BOX) + Attributes.charFromAttribute(Attributes.START_BOX) + 'Flashing!' + Attributes.charFromAttribute(Attributes.STEADY) + '[',
            Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '   !"#$%&\'()*+,-./',
            Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) +Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '0123456789:;<=>?',
            Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '  `abcdefghijklmno',
            Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '  pqrstuvwxyz{|}~\u007f',
            Attributes.charFromTextColour(Colour.BLUE) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.WHITE) +  'Normal size' + Attributes.charFromAttribute(Attributes.DOUBLE_HEIGHT) + 'Dbl hgtgjy' + Attributes.charFromGraphicColour(Colour.WHITE) + '\u0024\u007b' +  Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + '\u0024\u007b' + Attributes.charFromAttribute(Attributes.NORMAL_SIZE) + Attributes.charFromTextColour(Colour.WHITE) + 'Normal',
            'This text should not be visible',
            '1' + Attributes.charFromAttribute(Attributes.CONCEAL) + '2 Concealed' + Attributes.charFromTextColour(Colour.WHITE) + '3' + Attributes.charFromAttribute(Attributes.FLASH) + Attributes.charFromAttribute(Attributes.CONCEAL) + ' 4 Flash+conceal' + Attributes.charFromTextColour(Colour.WHITE) + '5',
        
            'CHELD' + Attributes.charFromGraphicColour(Colour.GREEN) + '5' + Attributes.charFromAttribute(Attributes.HOLD_MOSAICS) + '7' + Attributes.charFromGraphicColour(Colour.YELLOW) + '9' + Attributes.charFromAttribute(Attributes.RELEASE_MOSAICS) + Attributes.charFromTextColour(Colour.WHITE) + 'X' +
            'SHELD' + Attributes.charFromGraphicColour(Colour.GREEN) + '5' + Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromAttribute(Attributes.HOLD_MOSAICS) + '7' + Attributes.charFromGraphicColour(Colour.YELLOW) + '9' + Attributes.charFromAttribute(Attributes.RELEASE_MOSAICS) + Attributes.charFromTextColour(Colour.WHITE) + 'X ' +
            Attributes.charFromGraphicColour(Colour.GREEN) + Attributes.charFromAttribute(Attributes.CONTIGUOUS_GRAPHICS) +  Attributes.charFromAttribute(Attributes.HOLD_MOSAICS) + '3' + Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + '5' + Attributes.charFromAttribute(Attributes.CONTIGUOUS_GRAPHICS) + '7',
        ]);
    }

    setPageWithSizingAttributes() {
        this.t.setPageRows([
            Attributes.charFromAttribute(Attributes.DOUBLE_WIDTH) + 'D o u b l e   w i d t h',
            Attributes.charFromGraphicColour(Colour.WHITE) + Attributes.charFromAttribute(Attributes.DOUBLE_WIDTH) + 'g r a p h i c s' + Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + '  s e p a r a t e d',
            '0123456789012345678901234567890123456789',
            ' ' + Attributes.charFromAttribute(Attributes.DOUBLE_WIDTH) + 'D' +
                Attributes.charFromTextColour(Colour.BLUE) +'o' +
                Attributes.charFromTextColour(Colour.RED) +'u' +
                Attributes.charFromTextColour(Colour.MAGENTA) +'b' +
                Attributes.charFromTextColour(Colour.GREEN) +'l' +
                Attributes.charFromTextColour(Colour.YELLOW) +'e' +
                Attributes.charFromTextColour(Colour.YELLOW) +' ' +
                Attributes.charFromTextColour(Colour.CYAN) +'w' +
                Attributes.charFromTextColour(Colour.YELLOW) +'i' +
                Attributes.charFromTextColour(Colour.GREEN) +'d' +
                Attributes.charFromTextColour(Colour.MAGENTA) +'t' +
                Attributes.charFromTextColour(Colour.RED) +'h',
            '01234567890123456789',
            Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.YELLOW) + Attributes.charFromAttribute(Attributes.DOUBLE_WIDTH) + 'R e d' + Attributes.charFromAttribute(Attributes.BLACK_BACKGROUND) + 'B a c k g r o u n d',
            Attributes.charFromAttribute(Attributes.START_BOX) + Attributes.charFromAttribute(Attributes.START_BOX) + Attributes.charFromAttribute(Attributes.DOUBLE_WIDTH) + 'B o x e d' + Attributes.charFromAttribute(Attributes.END_BOX) + 'U n b o x e d',
            Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.YELLOW) + Attributes.charFromAttribute(Attributes.DOUBLE_WIDTH) + '2 * w' + Attributes.charFromAttribute(Attributes.NORMAL_SIZE) + 'Normal' + Attributes.charFromAttribute(Attributes.DOUBLE_HEIGHT) + '2 * h',
            'row hidden',
            Attributes.charFromAttribute(Attributes.START_BOX) + Attributes.charFromAttribute(Attributes.START_BOX) + 'Boxed' + Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.YELLOW) + Attributes.charFromAttribute(Attributes.DOUBLE_WIDTH) + '2 * w' + Attributes.charFromAttribute(Attributes.NORMAL_SIZE) + 'Normal' + Attributes.charFromAttribute(Attributes.DOUBLE_HEIGHT) + '2 * h',
            'row hidden',

        ]);
        
    }
}
