import { TeletextController } from './Controller.js';
import { PageModel } from "./PageModel.js";

const model = new PageModel();
export const teletextjs = new TeletextController(model);

export { Level, Attributes, Colour } from './Attributes.js';
