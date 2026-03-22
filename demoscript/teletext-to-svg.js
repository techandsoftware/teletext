// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

// nodejs script which outputs teletext as SVG

import { Teletext } from '../dist/teletext.min.js';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div id="teletext"></div>');

const t = Teletext({
    dom: dom.window
});
t.addTo('#teletext');
t.showTestPage('ADVERT');

// mosaics use SVG graphics by default, not a font
console.log(t.getScreenImage());
