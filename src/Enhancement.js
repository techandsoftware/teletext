// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

export class Enhancement {
    constructor(model) {
        this._model = model;
        this._x = 0;
        this._y = 0;
        this._data = [];
    }

    // printPos() {
    //     console.log(this._x, this._y);
    //     return this;
    // }
    pos(x, y) {
        x = parseInt(x);
        y = parseInt(y);
        if (x < 0 || x > 39)
            return this;
        if (y < 0 || y > 24)
            return this;
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
        const charCode = char.charCodeAt(0);
        if (charCode < 0x20 || charCode > 0x7f)
            return this;
        this._data.push({
            x_: this._x,
            y_: this._y,
            type_: 'g0',
            char_: char,
            diacritic_: dcode
        });
        return this;
    }

    putG1(char) {
        const charCode = char.charCodeAt(0);
        if (charCode < 0x20 || charCode > 0x7f ||
            (charCode >= 0x40 && charCode <= 0x5f))
            return this;
        this._data.push({
            x_: this._x,
            y_: this._y,
            type_: 'g1',
            char_: char,
        });
        return this;
    }

    putG2(char) {
        const charCode = char.charCodeAt(0);
        if (charCode < 0x20 || charCode > 0x7f)
            return this;
        this._data.push({
            x_: this._x,
            y_: this._y,
            type_: 'g2',
            char_: char,
        });
        return this;
    }

    putG3(char) {
        const charCode = char.charCodeAt(0);
        if (charCode < 0x20 || charCode > 0x7f)
            return this;
        this._data.push({
            x_: this._x,
            y_: this._y,
            type_: 'g3',
            char_: char,
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
