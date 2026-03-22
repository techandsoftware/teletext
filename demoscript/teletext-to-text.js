// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

// nodejs script which outputs teletext in plain text using Unicode chars
// As it's plain text, there's no colour, flashing, etc

import { Teletext } from '../dist/teletext.min.js';

const t = Teletext();
t.showTestPage('ADVERT');

// true = emits text and graphics
const text = t.getText(true);
console.log(text);
