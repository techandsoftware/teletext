// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import { Utils } from './Utils.js';
import testpages from './data/testpages.json';

import { VectorViewBase } from './VectorViewBase.js';
class ViewClassic extends VectorViewBase {}
import { View as ViewGraphicMosaic } from './VectorViewGraphicMosaic.js';
import { Enhancement } from './Enhancement.js';

const TEST_PAGE_NAMES = ['SPLASH', 'ENGINEERING', 'ADVERT', 'UK'];

export class TeletextController {
    constructor(model, options) {
        this._windowDom = null;
        if (typeof window == 'object') this._windowDom = window;
        this._opt = {
            webkitCompat_: true // generate SVG that's compatible with webkit by default. The resulting SVG is larger
        };
        if (typeof options == 'object') {
            if ('webkitCompat' in options && !options.webkitCompat) this._opt.webkitCompat_ = false;
            if ('dom' in options) this._windowDom = options.dom;
        }
        if (this._windowDom == null)
            throw new Error('TeletextController E24: No window dom object available');

        this._view = new ViewGraphicMosaic(model, this._opt.webkitCompat_, this._windowDom);
        this._model = model;
        this._levelIndex = 1;
        this._testPageIndex = 0;
        this._initEventHandlers();
        this._viewSelector = null;
        this._height = null;
        this._posX = 0;
        this._posY = 0;
        this._font = null;
        console.debug('TeletextController constructed');
    }

    setRowFromOutputLine(rowNum, string) {
        const chars = Utils.decodeOutputLine_(string);
        this._model.setRowFromChars_(rowNum, chars);
    }

    setRow(rowNum, string) {
        this._model.setRowFromChars_(rowNum, string);
    }

    setPageFromOutputLines(lines, header) {
        const rows = Utils.getRowsFromOutputLines_(lines);
        if (typeof header != 'undefined') rows[0] = this._processHeader(header);
        this.setPageRows(rows);
    }

    setPageRows(rows) {
        this._model.clearEnhancements_();
        this._model.setRows_(rows);
    }

    _processHeader(header) {
        header = Utils.decodeOutputLine_(header);
        return header.join('').substring(0, 32).padStart(40, " ");
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

    loadPageFromEncodedString(input, header) {
        const decoded = Utils.decodeBase64URLEncoded_(input, this._windowDom.atob);
        if (typeof header != 'undefined') decoded[0] = this._processHeader(header);
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
        this._font = font;
        this._view.setFont_(font);
    }

    clearScreen(withUpdate) {
        this._model.clearEnhancements_();
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

    setDefaultG0Charset(encoding, withUpdate) {
        const matches = encoding.match(/g0_/);
        if (matches == null) throw new Error("E130 setDefaultG0Charset: Bad g0 set");
        this._model.setPrimaryG0CharacterEncoding_(encoding, withUpdate);
    }

    setSecondG0Charset(encoding, withUpdate) {
        const matches = encoding.match(/g0_/);
        if (matches == null) throw new Error("E136 setSecondG0Charset: Bad g0 set");
        this._model.setSecondaryG0CharacterEncoding_(encoding, withUpdate);
    }

    setG2Charset(encoding, withUpdate) {
        const matches = encoding.match(/g2_/);
        if (matches == null) throw new Error("E142 setG2Charset: Bad g2 set");
        this._model.setG2CharacterEncoding_(encoding, withUpdate);
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
                this._view = new ViewGraphicMosaic(this._model, this._opt.webkitCompat_, this._windowDom);
                break;
            default:
                throw new Error("setView E126: bad view name:" + view);
        }
        if (this._height) this._view.setHeight_(this._height);
        if (this._font) this._view.setFont_(this._font);
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

    writeBytes(colNum, rowNum, byteRows) {
        this._model.writeBytes_(colNum, rowNum, byteRows);
    }

    getBytes() {
        return this._model.getBytes_();
    }

    // dumpToConsole() {
    //     this._model.dumpToConsole();
    // }
}
