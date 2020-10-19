import { TeletextController } from './Controller.js';
import { PageModel } from "./PageModel.js";
import { View } from './VectorView.js';

const model = new PageModel();
const view = new View(model);
export const teletextjs = new TeletextController(model, view);

export { Level, Attributes, Colour } from './Attributes.js';
