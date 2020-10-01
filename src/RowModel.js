export class RowModel {
    constructor() {
        this._doubleHeight = false;
        this._cells = [];
    }

    get doubleHeight() {
        return this._doubleHeight;
    }

    set doubleHeight(isDoubleHeight) {
        this._doubleHeight = isDoubleHeight;
    }

    addCell(cell) {
        this._cells.push(cell);
    }

    getCell(i) {
        if (i >= this._cells.length) throw new Error('RowModel.getCell E20 bad cell index');
        return this._cells[i];
    }
}
