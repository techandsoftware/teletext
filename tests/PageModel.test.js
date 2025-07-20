// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { expect, test } from 'vitest'
import { PageModel } from "../lib/PageModel.js";

test('page model constructs', () => {
    const model = new PageModel();
    const bytes = model.getBytes_();
    expect(bytes.length).toBe(40*25);
});
