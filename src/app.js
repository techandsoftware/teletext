import { TeletextController } from './Controller.js';
import { PageModel } from "./PageModel.js";
import { View } from './VectorView.js';

const model = new PageModel();
const view = new View(model);
const ctl = new TeletextController(model, view);

ctl.setPageRows([
    'This is a test',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789012345678901234567890123456789',
    ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
]);
