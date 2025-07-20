// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

export class RowModel {
    constructor() {
        this._doubleHeight = false;
        this._cells = [];
    }

    get doubleHeight_() {
        return this._doubleHeight;
    }

    set doubleHeight_(isDoubleHeight) {
        this._doubleHeight = isDoubleHeight;
    }

    addCell_(cell) {
        this._cells.push(cell);
    }

    getCell_(i) {
        if (i >= this._cells.length) throw new Error('RowModel.getCell E20 bad cell index');
        return this._cells[i];
    }
}
