// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { TeletextController } from './Controller.js';
import { PageModel } from "./PageModel.js";


export function Teletext(options) {
    const model = new PageModel();
    return new TeletextController(model, options);
}

export { Level, Attributes, Colour } from './Attributes.js';
