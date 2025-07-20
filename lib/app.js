// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import { TeletextController } from './Controller.js';
import { PageModel } from "./PageModel.js";

const model = new PageModel();

export function Teletext(options) {
    return new TeletextController(model, options);
}

export { Level, Attributes, Colour } from './Attributes.js';
