import { teletextjs, Attributes, Colour, Level } from '../dist/teletextjs.js';
import { ttxcaster } from './TeletextCaster.js';

const ASPECT_RATIOS = [1.2, 1.22, 1.33, 'natural'];
const FONTS = ['sans-serif', 'Bedstead', 'native', 'serif', 'Unscii', 'Ubuntu'];

export class DemoApp {
    constructor(teletextjs) {
        this.t = teletextjs;
        this.KEY_EVENTS = {
            '?': 'ttx.reveal',
            'm': 'ttx.mix',
            's': 'ttx.subtitlemode',
        };
        this._initEventListeners();
        this._aspectRatioIndex = 0;
        this._fontIndex = 0;
        ttxcaster.connected.attach( () => this._castConnected() );
    }

    _castConnected() {
        // ttxcaster.display("QIECBAgQIIcWLGg2EDFy2QIJu_cgZNUETLjQA2TN0xYr2DAodJIECBAgQIEGDB4_PUCBAgQIECBAgQIECBAgQIEANkvaMih0kgQIECDA1Qfv__OgQYGCBAgQIECBAgQIECBAgQIECBAgKHSSBAgQIH6FR-__-v7___oECBAgQIEAORPmxUE6LXpoECAodJIECBAoQKum7______9-gQIECBAgQA82_Zs39-aB8-QIAh0kgQIECBAgSev_____v06BAgQIECBAgQIECBAgQIECBAgKHSSBAgQIECBR00____-_w9GCBAgQIECBAgQIECBAgQIECAodJIECBAgQIECD8rx________ECBAgQIECBAgQIECBAgQICh0kgQIECBAgQLETRlv_______6oECBAgQIECBAgQIECBAgKHSyBAgQIHGQlwYIEH_-_x_____9-dECBAgQIECBAgQIECAIdLIECDAmJbfz_-0RJ0qBV________7sECBAgQIECBAgQIAh0sgQIMzAl-__fX5Sg0JECvX______586IECBAgQIECBAgCHSyBAgwJiW9OjX_0qBAgQIEX________-l8fPjBAgQIECAIdLIEHBYhQIECBQxQICWDhg5fv____________tUCBAgQIAh0sgzIECBAgQIEGlAgQEtP_______________-lQIECBAgCHSyBUwQIECBAgQakCBASQqv_____________-6FAgQIECAIdLIECJygQIECBAgaoEBJBg______________5-OiBAgQIAh0sgQKGKBAgQIEHBKgJIMH7____8v__________QoECBAgCHSyBRmQIECBA4RoECAkgVoVaNel________r16FAgQIECAIdLINCFAgwOEyBAgQICSBAgQePn7___r06RAgQIECBAgQIAh0sgQLeKxCgQIECBAgJIECDR__v0aNGhQIECBAgQIECBAgCHSSBAgQIECBAgQIECBAgQYP3_-1QIECBAgQIECBAgQIECAIdJIECBAgQIECBAgQIECBB6boUSBAgQIECBAgQIECBAgQIAh0kgQIECBAgQIECBAgQIFStAgQIECBAgQIECBAgQIECBAgAzsvjognZe_MFIy4cmzTuy8wdTfwQU-G_l0DVKy-lhyad6A");
    }

    _initEventListeners() {
        window.addEventListener('keypress', e => {
            switch (e.key) {
                case '?':
                    ttxcaster.reveal();
                // eslint-disable-next-line no-fallthrough
                case 'm':
                case 's':
                    window.dispatchEvent(new Event(this.KEY_EVENTS[e.key]));
                    break;
                case 't':
                    teletextjs.showTestPage();
                    break;
                case 'x':
                    teletextjs.showRandomisedPage();
                    break;
                case 'c': // for cells
                    teletextjs.toggleGrid();
                    break;
                case 'a':
                    this._aspectRatioIndex++;
                    if (this._aspectRatioIndex == ASPECT_RATIOS.length) this._aspectRatioIndex = 0;
                    teletextjs.setAspectRatio(ASPECT_RATIOS[this._aspectRatioIndex]);
                    break;
                case 'd':
                    this.setPageRows();
                    break;
                case 'f':
                    this._fontIndex++;
                    if (this._fontIndex == FONTS.length) this._fontIndex = 0;
                    console.debug('setting font to', FONTS[this._fontIndex]);
                    teletextjs.setFont(FONTS[this._fontIndex]);
                    break;
                case 'w': // for wipe
                    teletextjs.clearScreen();
                    break;
                case 'h':
                    teletextjs.setHeight(document.head.parentElement.clientHeight * 0.8);
                    break;
                default:
            }
        });
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('revealButton').addEventListener('click', () => {
                ttxcaster.reveal();
                window.dispatchEvent(new Event('ttx.reveal'));
            });
            document.getElementById('levelSelect').addEventListener('input', e => {
                teletextjs.setLevel(Level[e.target.value]);
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
}
