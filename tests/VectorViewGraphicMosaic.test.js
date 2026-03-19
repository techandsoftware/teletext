// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

import { expect, test } from 'vitest'
import { JSDOM } from 'jsdom';

import { PageModel } from '../lib/PageModel.js';
import { View } from '../lib//VectorViewGraphicMosaic.js';
import { Utils } from '../lib/Utils.js';
import testpages from '../lib/data/testpages.json';

function renderPageToSVG(webkitCompatible) {
  const dom = new JSDOM('<div id="teletextscreen"></div>');
  const input = testpages.ENGINEERING;

  const model = new PageModel();
  const rows = Utils.decodeBase64URLEncoded_(input, dom.window.atob);
  model.setRows_(rows);

  const view = new View(model, webkitCompatible, dom.window);
  view.addTo_('#teletextscreen');
  view._update();

  return dom.window.document.querySelector('#teletextscreen').innerHTML;
}

test('VectorViewGraphicMosaic renders page to SVG with legacy webkit compatibility fix', () => {
  const svg = renderPageToSVG(true);
  expect(svg).toMatchSnapshot();
});

test('VectorViewGraphicMosaic renders page to SVG', () => {
  const svg = renderPageToSVG(false);
  expect(svg).toMatchSnapshot();
});