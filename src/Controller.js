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

    _initEventHandlers() {
        window.addEventListener('ttx.reveal', () => {
            this._view.reveal();
        });
    }
}
