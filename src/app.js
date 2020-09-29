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
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + Attributes.charFromTextColour(Colour.YELLOW) + '  126',
    'abcdefghijklmnopqrstuvwxyz' + Attributes.charFromTextColour(Colour.YELLOW) + '  characters',
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
    'This is' + Attributes.charFromTextColour(Colour.BLACK) + 'black text!',
    
]);
