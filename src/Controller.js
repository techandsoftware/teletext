import { Level } from './Attributes.js';
import { Utils } from './Utils.js';
import testpages from'./data/testpages.json';

const LEVELS = [Level[0], Level[1], Level[1.5], Level[2.5]];
const TEST_PAGE_NAMES = ['ENGINEERING', 'ADVERT', 'UK'];

export class TeletextController {
    constructor(model, view) {
        this._view = view;
        this._model = model;
        this._levelIndex = 1;
        this._testPageIndex = 0;
        this._initEventHandlers();
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
        window.addEventListener('ttx.reveal', () => this._view.reveal());
        window.addEventListener('ttx.subtitlemode', () => this._view.boxMode());
        window.addEventListener('ttx.testpage', () => this.showTestPage());
        window.addEventListener('ttx.testrandom', () => this.showRandomisedPage());
        window.addEventListener('ttx.mix', () => this._view.mixMode());
        window.addEventListener('ttx.level', () => {
            this._levelIndex++;
            if (this._levelIndex == LEVELS.length) this._levelIndex = 0;
            this._model.setLevel(LEVELS[this._levelIndex]);
        });
    }
}
