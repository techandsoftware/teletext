import { Utils } from './Utils.js';

// test page from http://www.uniquecodeanddata.co.uk/teletext76/bbc2-19881115/ page 797 (tweaked to correct the word 'White')
const TEST_PAGE = "QIECBAgQIIcWLGg2EDdy3QIKnXKgYtUE7f2QA2TB0wYr2DECAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYMS54fzJmix4-YCDToOLOjyZ0WLSkzo6AkcGHuZUcRHlB4dgyAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAWDP9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YNCho9zImSoAqBGoAp0FUy8-iChhz5UCA4MPEuZYgTAFyAFg1_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2DYCAAoACACeQHkBdYTJlixIkSKlSJEoUKIEBQABAAQAEABYN_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39g4AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGDn9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YsAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIBix_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2LICAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYs_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39i0AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGLX9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_Ytq-jT0yg7OXZs39w0Pzh3Ao_LLl3BZuHPl3dMIGllyBIWzrlLmkKJGTSJUycsoUqlZJYtXLzLBiyZlWjVs3IuHLp2UePXz9AgQokaBIlTJ0ChSqVoFi1cvQMGLJmgaNWzdA4cunaB49fP0ECDChoIkWNHQSJMqWgmTZ09BQo0qaCpVrV0FizatoLl29fQYMOLGgyZc2dBo06taDZt3b0HDjy5oOnXt3QePPr2g-ff38pgw4sZHJlzZyujTq1ktm3dvNcOPLmW6de3cn48-vZf59_fwZiHv3Y8uHYIjbMPPQDVCxcLf4E0-mXDk8mI-_dlFCn5a9_DKr6q-qvqr6q-qvqr6AFS390DJoGQKr6q-qvqr6q-qvqr6o";

export class TeletextController {
    constructor(model, view) {
        this._view = view;
        this._model = model;
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
        this.loadPageFromEncodedString(TEST_PAGE);
    }

    loadPageFromEncodedString(input) {
        const decoded = Utils.decodeBase64URLEncoded(input);
        // this.setRow(0, decoded[23]);
        this.setPageRows(decoded);
    }

    _initEventHandlers() {
        window.addEventListener('ttx.reveal', () => {
            this._view.reveal();
        });
        window.addEventListener('ttx.subtitlemode', () => {
            this._view.boxMode();
        });
    }
}
