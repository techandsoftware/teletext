// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom

import { expect, test } from 'vitest'

import { PageModel } from '../lib/PageModel.js';
import { View } from '../lib//VectorViewGraphicMosaic.js';
import { Utils } from '../lib/Utils.js';
import testpages from '../lib/data/testpages.json';

function renderPageToSVG(webkitCompatible) {
  document.body.innerHTML = '<div id="teletextscreen"></div>';
  const input = testpages.ENGINEERING;

  const model = new PageModel();
  const rows = Utils.decodeBase64URLEncoded_(input);
  model.setRows_(rows);

  const view = new View(model, webkitCompatible, window);
  view.addTo_('#teletextscreen');
  view._update();

  return document.querySelector('#teletextscreen').innerHTML;
}

test('VectorViewGraphicMosaic renders page to SVG with legacy webkit compatibility fix', () => {
  const svg = renderPageToSVG(true);
  expect(svg).toMatchSnapshot();
});

test('VectorViewGraphicMosaic renders page to SVG', () => {
  const svg = renderPageToSVG(false);
  expect(svg).toMatchSnapshot();
});

test('getStaticScreen_ renders to SVG without unused elements', () => {
  document.body.innerHTML = '<div id="teletextscreen"></div>';

  const model = new PageModel();
  const view = new View(model, false, window);
  view.addTo_('#teletextscreen');

  model.setRows_(Utils.decodeBase64URLEncoded_(testpages.ENGINEERING));
  view._update();

  model.setRows_(Utils.decodeBase64URLEncoded_(testpages.ADVERT));
  view._update();

  const html = view.getStaticScreen_();
  const doc = new DOMParser().parseFromString(html, 'image/svg+xml');

  const spaceTexts = [...doc.querySelectorAll('text')].filter(el => el.textContent === ' ');
  expect(spaceTexts).toHaveLength(0);

  const emptyClipPaths = [...doc.querySelectorAll('clipPath')].filter(el => el.childElementCount === 0);
  expect(emptyClipPaths).toHaveLength(0);

  const usedIds = new Set([...doc.querySelectorAll('use')].map(el => el.getAttribute('href')?.slice(1)));
  const unusedSymbols = [...doc.querySelectorAll('symbol')].filter(el => !usedIds.has(el.id));
  expect(unusedSymbols).toHaveLength(0);

  const emptyGroups = [...doc.querySelectorAll('g:not([id]):not([class])')].filter(el => el.childElementCount === 0);
  expect(emptyGroups).toHaveLength(0);
});