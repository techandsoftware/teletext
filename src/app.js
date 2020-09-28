import { TeletextController } from './Controller.js';
import { PageModel } from "./PageModel.js";
import { View } from './VectorView.js';

const model = new PageModel();
const view = new View(model);
const ctl = new TeletextController(model, view);
ctl.setRow(0, 'This is a test');
ctl.setRow(1, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
ctl.setRow(2, 'abcdefghijklmnopqrstuvwxyz');
ctl.setRow(3, '0123456789012345678901234567890123456789');
ctl.setRow(4, ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~');
