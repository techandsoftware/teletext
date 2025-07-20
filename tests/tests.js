// SPDX-FileCopyrightText: © 2025 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only

// requires node >= 16 

import { Teletext } from '@techandsoftware/teletext';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div id="teletextscreen"></div>');

const teletext = Teletext({
    dom: dom.window
});
teletext.addTo('#teletextscreen');
teletext.showTestPage();


// const svg = dom.window.document.querySelector('#teletextscreen').innerHTML;
// console.log(svg);
