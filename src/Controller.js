// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import { Utils } from './Utils.js';
import testpages from'./data/testpages.json';

import { VectorViewBase } from './VectorViewBase.js';
class ViewClassic extends VectorViewBase {}
import { View as ViewGraphicMosaic } from './VectorViewGraphicMosaic.js';

const TEST_PAGE_NAMES = ['SPLASH', 'ENGINEERING', 'ADVERT', 'UK'];

export class TeletextController {
    constructor(model, options) {
        this._opt = {
            webkitCompat: true // generate SVG that's compatible with webkit by default. The resulting SVG is larger
        };
        if (typeof options == 'object') {
            if ('webkitCompat' in options && !options.webkitCompat) this._opt.webkitCompat = false;
            if ('doc' in options) this._document = options.doc;
        }

        this._view = new ViewGraphicMosaic(model, this._opt.webkitCompat, this._document);
        this._model = model;
        this._levelIndex = 1;
        this._testPageIndex = 0;
        this._initEventHandlers();
        this._viewSelector = null;
        this._height = null;
        console.debug('TeletextController constructed');
    }

    setRow(rowNum, string) {
        this._model.setRowFromChars(rowNum, string);
    }

    setPageRows(rows) {
        this._model.setRows(rows);
    }

    showTestPage() {
        this.loadPageFromEncodedString(testpages[TEST_PAGE_NAMES[this._testPageIndex]]);
        this._testPageIndex++;
        if (this._testPageIndex == TEST_PAGE_NAMES.length) this._testPageIndex = 0;
    }
    
    showRandomisedPage() {
        const rows = [];
        for (let row = 0; row < 25; row++) {
            const cols = [];
            for (let col = 0; col < 40; col++) {
                cols.push(String.fromCharCode(Math.random() * 127));
            }
            rows.push(cols.join(''));
        }
        this.setPageRows(rows);
    }

    loadPageFromEncodedString(input) {
        const decoded = Utils.decodeBase64URLEncoded(input);
        // this.setRow(0, decoded[2]);
        this.setPageRows(decoded);
    }

    _initEventHandlers() {
        if (typeof window == 'object') {
            window.addEventListener('ttx.reveal', () => this._view.reveal());
            window.addEventListener('ttx.mix', () => this._view.mixMode());
            window.addEventListener('ttx.subtitlemode', () => this._view.boxMode());
        }
    }

    toggleReveal() {
        this._view.reveal();
    }

    toggleMixMode() {
        this._view.mixMode();
    }

    toggleBoxMode() {
        this._view.boxMode();
    }

    toggleGrid() {
        this._view.grid();
    }

    setLevel(level) {
        this._model.setLevel(level);
    }

    addTo(selector) {
        this._selector = selector;
        this._view.addTo(selector);
    }

    setFont(font) {
        this._view.setFont(font);
    }

    clearScreen(withUpdate) {
        this._model.clearScreen(withUpdate);
    }

    setAspectRatio(aspectRatio) {
        if (aspectRatio == 'natural') {
            this._view.setAspectRatio(aspectRatio);
            return;
        }
        const ar = parseFloat(aspectRatio);
        if (Number.isNaN(ar)) throw new Error("E80 setAspectRatio: bad number");
        this._view.setAspectRatio(ar);
    }

    setHeight(height) {
        const newHeight = parseFloat(height);
        if (Number.isNaN(newHeight)) throw new Error("E98 setHeight: bad number");
        this._view.setHeight(newHeight);
        this._height = newHeight;
    }

    setDefaultG0Charset(...args) {
        this._model.setPrimaryG0CharacterEncoding(...args);
    }

    setSecondG0Charset(...args) {
        this._model.setSecondaryG0CharacterEncoding(...args);
    }

    remove() {
        this._view.detach();
        if (this._selector) {
            const el = document.querySelector(this._selector);
            if (el) el.removeChild(el.firstChild);
        }
        this._view = null;
    }

    setView(view) {
        this.remove();
        switch (view) {
            case 'classic__font-for-mosaic':
                this._view = new ViewClassic(this._model, this._document);
                break;
            case 'classic__graphic-for-mosaic':
                this._view = new ViewGraphicMosaic(this._model, this._opt.webkitCompat, this._document);
                break;
            default:
                throw new Error("setView E126: bad view name:" + view);
        }
        if (this._height) this._view.setHeight(this._height);
        if (this._selector) this._view.addTo(this._selector);
        this._model.notify();
    }

    registerViewPlugin(plugin) {
        plugin.registerWithView(this._view);
        this._model.notify();
    }

    // dumpToConsole() {
    //     this._model.dumpToConsole();
    // }
}
