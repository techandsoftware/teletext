export class TeletextController {
    constructor(model, view) {
        this._view = view;
        this._model = model;
        console.debug('TeletextController constructed');
    }

    setRow(rowNum, string) {
        this._model.setRowFromChars(rowNum, string);
    }

    setPageRows(rows) {
        this._model.setRows(rows);
    }
}
