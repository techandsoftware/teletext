// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { expect, test } from 'vitest'
import { JSDOM } from 'jsdom';

import { PageModel } from '../lib/PageModel.js';
import { VectorViewBase } from '../lib//VectorViewBase.js';
import { Utils } from '../lib/Utils.js';
import testpages from '../lib/data/testpages.json';

test('VectorViewBase renders page to SVG', () => {
    const dom = new JSDOM('<div id="teletextscreen"></div>');
    const input = testpages.ENGINEERING;

    const model = new PageModel();
    const rows = Utils.decodeBase64URLEncoded_(input, dom.window.atob);
    model.setRows_(rows);

    const view = new VectorViewBase(model, dom.window);
    view.addTo_('#teletextscreen');
    view._update();

    const svg = dom.window.document.querySelector('#teletextscreen').innerHTML;

    expect(svg).toMatchSnapshot();
});
