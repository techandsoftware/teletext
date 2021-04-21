// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import { CellType, CellSize } from './Attributes.js';
import { VectorViewBase as Base } from './VectorViewBase.js';

export class View extends Base {
    constructor(model, webkitCompat, dom) {
        super(model, dom);
        // webkit doesn't use the width/height on <symbol> which is SVG2.
        // When webkitCompat is true, the width/height are duplicated on <use>
        this._webkitCompat = webkitCompat;
        this._mosaicSymbols = new Set();
        console.debug('VectorViewGraphicMosaic constructed');
    }

    _createDisplay() {
        super._createDisplay();
        this._graphicrows = [];
        this._graphicLayer = this.d.group();
    }

    _resetRow(rowIndex) {
        super._resetRow(rowIndex);
        this._resetGraphicRow(rowIndex);
    }

    _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
        if ('_background' in this._plugins) {
            this._plugins._background(rowIndex, cellIndex, cell.size, cell.bgColour);
        }

        if (cell.type == CellType.ALPHA || !isMosaic) {
            this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);
        } else if (isMosaic) {
            cellView.plain(' ').attr(attr);
            this._renderMosaic(rowIndex, cellIndex, cell, fill);
        }
    }

    _renderMosaic(row, col, cell, fill) {
        if ('_mosaic' in this._plugins) {
            const rendered = this._plugins._mosaic(row, col, cell, fill);
            if (rendered) return;
        }

        const sextants = cell.getSextants();
        if (!sextants.includes('1')) return;
        let id = cell.type == CellType.MOSAIC_CONTIGUOUS ? 'c' : 's';
        id += sextants.join('');

        let width = Base._CELL_WIDTH;
        let height = Base._CELL_HEIGHT;
        if (cell.type == CellType.MOSAIC_CONTIGUOUS) {
            width = Base._CELL_WIDTH + 0.3;
            height = Base._CELL_HEIGHT + 0.2;
        }

        if (!this._mosaicSymbols.has(id)) {
            this._mosaicSymbols.add(id);
            const symbol = this._svg.symbol(id);

            if (cell.type == CellType.MOSAIC_CONTIGUOUS) {
                symbol.attr({
                    preserveAspectRatio: 'none',
                    width: width,     // FUDGE cell is bigger than it should be
                    height: height,   // to close tiny gaps on Chromecast
                    viewBox: '0 0 12 18',
                });
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect(6, 6).move((i % 2) * 6, Math.floor(i/2) * 6);
                }
            } else {
                symbol.attr({
                    preserveAspectRatio: 'none',
                    width: width,
                    height: height,
                    viewBox: '0 0 12 18',
                });
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect(4, 4).move(((i % 2) * 6) + 1, (Math.floor(i/2) * 6) + 2);
                }
            }
        }

        let use;
        if (cell.type == CellType.MOSAIC_CONTIGUOUS)
            use = this._graphicrows[row]
                .use(id)
                .move(col * Base._CELL_WIDTH - 0.15, row * Base._CELL_HEIGHT - 0.1)
                .fill(fill);
        else
            use = this._graphicrows[row]
                .use(id)
                .move(col * Base._CELL_WIDTH, row * Base._CELL_HEIGHT)
                .fill(fill);
        if (this._webkitCompat) // FUDGE need width/height for webkit browsers as they don't inherit them from symbol
            use.attr({width: width, height: height})
        if (cell.size == CellSize.DOUBLE_HEIGHT || cell.size == CellSize.DOUBLE_SIZE)
            use.attr('height', Base._CELL_DOUBLE_HEIGHT);
        if (cell.size == CellSize.DOUBLE_WIDTH || cell.size == CellSize.DOUBLE_SIZE)
            use.attr('width', Base._CELL_DOUBLE_WIDTH);
        if (cell.flashing) use.addClass('flash');
        if (cell.concealed) use.addClass('conceal');
    }

    _resetGraphicRow(rowNum) {
        if (this._graphicrows[rowNum]) this._graphicrows[rowNum].remove();
        this._graphicrows[rowNum] = this._graphicLayer.group();
    }

    // eslint-disable-next-line no-unused-vars
    _getCellAttr(cellType, isMosaicChar) {
        return {
            dx: null,
            dy: null,
            textLength: null,
            lengthAdjust: null,
            'text-anchor': null,
            transform: null,
            class: null,
        };
    }
}
