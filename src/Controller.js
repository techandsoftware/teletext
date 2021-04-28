// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import { Utils } from './Utils.js';
import testpages from './data/testpages.json';

import { VectorViewBase } from './VectorViewBase.js';
class ViewClassic extends VectorViewBase {}
import { View as ViewGraphicMosaic } from './VectorViewGraphicMosaic.js';

const TEST_PAGE_NAMES = ['SPLASH', 'ENGINEERING', 'ADVERT', 'UK'];

export class TeletextController {
    constructor(model, options) {
        this._windowDom = null;
        if (typeof window == 'object') this._windowDom = window;
        this._opt = {
            webkitCompat: true // generate SVG that's compatible with webkit by default. The resulting SVG is larger
        };
        if (typeof options == 'object') {
            if ('webkitCompat' in options && !options.webkitCompat) this._opt.webkitCompat = false;
            if ('dom' in options) this._windowDom = options.dom;
        }
        if (this._windowDom == null)
            throw new Error('TeletextController E24: No window dom object available');

        this._view = new ViewGraphicMosaic(model, this._opt.webkitCompat, this._windowDom);
        this._model = model;
        this._levelIndex = 1;
        this._testPageIndex = 0;
        this._initEventHandlers();
        this._viewSelector = null;
        this._height = null;
        this._posX = 0;
        this._posY = 0;
        console.debug('TeletextController constructed');
    }

    setRow(rowNum, string) {
        this._model.setRowFromChars_(rowNum, string);
    }

    setPageRows(rows) {
        this._model.setRows_(rows);
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
        const decoded = Utils.decodeBase64URLEncoded_(input, this._windowDom.atob);
        this.setPageRows(decoded);
    }

    _initEventHandlers() {
        this._windowDom.addEventListener('ttx.reveal', () => this._view.reveal_());
        this._windowDom.addEventListener('ttx.mix', () => this._view.mixMode_());
        this._windowDom.addEventListener('ttx.subtitlemode', () => this._view.boxMode_());
    }

    toggleReveal() {
        this._view.reveal_();
    }

    toggleMixMode() {
        this._view.mixMode_();
    }

    toggleBoxMode() {
        this._view.boxMode_();
    }

    toggleGrid() {
        this._view.grid_();
    }

    setLevel(level) {
        this._model.setLevel_(level);
    }

    addTo(selector) {
        this._selector = selector;
        this._view.addTo_(selector);
    }

    setFont(font) {
        this._view.setFont_(font);
    }

    clearScreen(withUpdate) {
        this._model.clearScreen_(withUpdate);
    }

    setAspectRatio(aspectRatio) {
        if (aspectRatio == 'natural') {
            this._view.setAspectRatio_(aspectRatio);
            return;
        }
        const ar = parseFloat(aspectRatio);
        if (Number.isNaN(ar)) throw new Error("E80 setAspectRatio: bad number");
        this._view.setAspectRatio_(ar);
    }

    setHeight(height) {
        const newHeight = parseFloat(height);
        if (Number.isNaN(newHeight)) throw new Error("E98 setHeight: bad number");
        this._view.setHeight_(newHeight);
        this._height = newHeight;
    }

    setDefaultG0Charset(...args) {
        this._model.setPrimaryG0CharacterEncoding_(...args);
    }

    setSecondG0Charset(...args) {
        this._model.setSecondaryG0CharacterEncoding_(...args);
    }

    remove() {
        this._view.detach_();
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
                this._view = new ViewClassic(this._model, this._windowDom);
                break;
            case 'classic__graphic-for-mosaic':
                this._view = new ViewGraphicMosaic(this._model, this._opt.webkitCompat, this._windowDom);
                break;
            default:
                throw new Error("setView E126: bad view name:" + view);
        }
        if (this._height) this._view.setHeight_(this._height);
        if (this._selector) this._view.addTo_(this._selector);
        this._model.notify_();
    }

    registerViewPlugin(plugin) {
        plugin.registerWithView(this._view);
        this._model.notify_();
    }

    enhance() {
        return new Enhancement(this._model);
    }


    // dumpToConsole() {
    //     this._model.dumpToConsole();
    // }
}

class Enhancement {
    constructor(model) {
        this._model = model;
        this._x = 0;
        this._y = 0;
        this._data = [];
    }

    printPos() {
        console.log(this._x, this._y);
        return this;
    }

    pos(x, y) {
        x = parseInt(x);
        y = parseInt(y);
        if (x < 0 || x > 39) return this;
        if (y < 0 || y > 24) return this;
        this._x = x;
        this._y = y;
        return this;
    }

    putG0(char, diacriticCode) {
        let dcode = null;
        if (typeof diacriticCode != 'undefined') {
            const code = parseInt(diacriticCode);
            if (code >= 0 && code <= 15)
                dcode = code;
        }
        this._data.push({
            x_: this._x,
            y_: this._y,
            type_: 'g0',
            char_: char,
            diacritic_: dcode
        });
        return this;
    }

    putAt() {
        this._data.push({
            x_: this._x,
            y_: this._y,
            type_: 'char',
            char_: '@'
        });
        return this;
    }

    end() {
        this._model.enhance_(this._data);
        this._model.notify_();
        return this;
    }
}
