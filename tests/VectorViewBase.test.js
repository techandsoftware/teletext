// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom

import { expect, test } from 'vitest'

import { PageModel } from '../lib/PageModel.js';
import { VectorViewBase } from '../lib//VectorViewBase.js';
import { Utils } from '../lib/Utils.js';
import testpages from '../lib/data/testpages.json';

test('VectorViewBase renders page to SVG', () => {
    document.body.innerHTML = '<div id="teletextscreen"></div>';
    const input = testpages.ENGINEERING;

    const model = new PageModel();
    const rows = Utils.decodeBase64URLEncoded_(input);
    model.setRows_(rows);

    const view = new VectorViewBase(model, window);
    view.addTo_('#teletextscreen');
    view._update();

    const svg = document.querySelector('#teletextscreen').shadowRoot.innerHTML;

    expect(svg).toMatchSnapshot();
});
