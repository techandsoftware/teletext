import { Utils } from './Utils.js';

const TEST_PAGE = "QIECBAgQIIcWLGg2EDJy3QIK-XIgQMkE3DyQA2TF0wYr2LACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYMS54fzJmix4-YCDToOLOjyZ0WLSkzo6AkcGHuZUcRHlB4dgyAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAWDP9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YNCho9zImSoAyBGoAp0FUy8-iChhz5UCA4MPEuZYgTAFyAFg1_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2DYCAAoACACeQHkBdYTJlixIkSKlSJEoUKIEBQABAAQAEABYN_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39g4AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGDn9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YsAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIBix_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2LICAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYs_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39i0AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGLX9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YttejT0yg7OXZs39w0Pzh3Ao_LLl3BpuHPl3dMIGllyBIWzrmLmUKJGTSJUycsoUqlZJYtXLzLBiyZlWjVs3IuHLp2UePXz9AgQokaBIlTJ0ChSqVoFi1cvQMGLJmgaNWzdA4cunaB49fP0ECDChoIkWNHQSJMqWgmTZ09BQo0qaCpVrV0FizatoLl29fQYMOLGgyZc2dBo06taDZt3b0HDjy5oOnXt3QePPr2g-ff38pgw4sZHJlzZyujTq1ktm3dvNcOPLmW6de3cn48-vZf59_fwZiHv3Y8uHYIjbMPPQDVCxcLf4E0-mXDk8mI-_dlFCn5a9_QIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECA";

export class TeletextController {
    constructor(model, view) {
        this._view = view;
        this._model = model;
        this._initEventHandlers();
        console.debug('TeletextController constructed');
        // const encoded = base64url.encode("ladies and gentlemen we are floating in space");
        // console.log(encoded);
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
        // const rows = [];
        // for (let row = 0; row < 25; row++) {
        //     for (let col = 0; col < 40; col++) {

        //     }
        // }
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
