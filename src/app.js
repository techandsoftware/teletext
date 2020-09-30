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
    'This is' + Attributes.charFromTextColour(Colour.GREEN) + 'green text!',
    'This is' + Attributes.charFromTextColour(Colour.MAGENTA) + 'magenta text!',
    'This is' + Attributes.charFromTextColour(Colour.CYAN) + 'cyan text!',
    'This is' + Attributes.charFromTextColour(Colour.RED) + 'red text!',
    'This is' + Attributes.charFromTextColour(Colour.BLUE) + 'blue text!',
    'This is' + Attributes.charFromTextColour(Colour.YELLOW) + 'yellow text!',
    'This is' + Attributes.charFromTextColour(Colour.WHITE) + 'white text!',
    'This is' + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + Attributes.charFromTextColour(Colour.BLACK) + 'black text! ' + Attributes.charFromAttribute(Attributes.BLACK_BACKGROUND),
    Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + '   ' +
        Attributes.charFromTextColour(Colour.YELLOW) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)  + '   ' +
        Attributes.charFromTextColour(Colour.CYAN) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)    + '   ' +
        Attributes.charFromTextColour(Colour.GREEN) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)   + '   ' +
        Attributes.charFromTextColour(Colour.MAGENTA) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) + '   ' +
        Attributes.charFromTextColour(Colour.RED) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)     + '   ' +
        Attributes.charFromTextColour(Colour.BLUE) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)    + '   ' +
        Attributes.charFromTextColour(Colour.BLACK) + Attributes.charFromAttribute(Attributes.NEW_BACKGROUND)   + '   ',
    Attributes.charFromGraphicColour(Colour.WHITE) +  'abcdefghijklmnopqrstuvwxyz', // TODO debug this
]);
