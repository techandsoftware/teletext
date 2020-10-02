import { TeletextController } from './Controller.js';
import { PageModel } from "./PageModel.js";
import { View } from './VectorView.js';
import { Attributes, Colour } from './Attributes.js';

const model = new PageModel();
const view = new View(model);
const ctl = new TeletextController(model, view);

ctl.setPageRows([
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
    '       ' + Attributes.charFromTextColour(Colour.CYAN)    + 'cyan text!   ' + Attributes.charFromTextColour(Colour.GREEN)  + 'green text!',
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
    Attributes.charFromGraphicColour(Colour.WHITE) + '   pqrstuvwxyz{|}~\u007f' + Attributes.charFromTextColour(Colour.WHITE) + Attributes.charFromAttribute(Attributes.FLASH) + ' Flashing!' + Attributes.charFromAttribute(Attributes.STEADY) + '[',
    Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '   !"#$%&\'()*+,-./',
    Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) +Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '0123456789:;<=>?',
    Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '  `abcdefghijklmno',
    Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + Attributes.charFromGraphicColour(Colour.WHITE) +  '  pqrstuvwxyz{|}~\u007f',
    Attributes.charFromTextColour(Colour.BLUE) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.WHITE) +  'Normal size' + Attributes.charFromAttribute(Attributes.DOUBLE_HEIGHT) + 'Dbl hgtgjy' + Attributes.charFromGraphicColour(Colour.WHITE) + '\u0024\u007b' +  Attributes.charFromAttribute(Attributes.SEPARATED_GRAPHICS) + '\u0024\u007b' + Attributes.charFromAttribute(Attributes.NORMAL_SIZE) + Attributes.charFromTextColour(Colour.WHITE) + 'Normal',
    'This text should not be visible'
    
]);
