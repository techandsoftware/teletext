// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import { CellType, CellSize } from './Attributes.js';
import { WrappedCell } from './Cell.js';
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
        this._graphicLayer = this.d.group_();
    }

    _resetRow(rowIndex) {
        super._resetRow(rowIndex);
        this._resetGraphicRow(rowIndex);
    }

    _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
        if ('_background' in this._plugins) {
            this._plugins._background(rowIndex, cellIndex, cell.size_, cell.bgColour_);
        }

        if (cell.type_ == CellType.ALPHA_ || !isMosaic) {
            this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);
        } else if (isMosaic) {
            cellView.plain_(' ').attr_(attr);
            this._renderMosaic(rowIndex, cellIndex, cell, fill);
        }
    }

    _renderMosaic(row, col, cell, fill) {
        if ('_mosaic' in this._plugins) {
            const wrappedCell = new WrappedCell(cell);
            const rendered = this._plugins._mosaic(row, col, wrappedCell, fill);
            if (rendered) return;
        }

        const sextants = cell.getSextants_();
        if (!sextants.includes('1')) return;
        let id = cell.type_ == CellType.MOSAIC_CONTIGUOUS_ ? 'c' : 's';
        id += sextants.join('');

        let width = Base._CELL_WIDTH;
        let height = Base._CELL_HEIGHT;
        if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_) {
            width = Base._CELL_WIDTH + 0.3;
            height = Base._CELL_HEIGHT + 0.2;
        }

        if (!this._mosaicSymbols.has(id)) {
            this._mosaicSymbols.add(id);
            const symbol = this._svg.symbol_(id);

            if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_) {
                symbol.attr_({
                    preserveAspectRatio: 'none',
                    width: width,     // FUDGE cell is bigger than it should be
                    height: height,   // to close tiny gaps on Chromecast
                    viewBox: '0 0 12 18',
                });
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect_(6, 6).move_((i % 2) * 6, Math.floor(i/2) * 6);
                }
            } else {
                symbol.attr_({
                    preserveAspectRatio: 'none',
                    width: width,
                    height: height,
                    viewBox: '0 0 12 18',
                });
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect_(4, 4).move_(((i % 2) * 6) + 1, (Math.floor(i/2) * 6) + 2);
                }
            }
        }

        let use;
        if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_)
            use = this._graphicrows[row]
                .use_(id)
                .move_(col * Base._CELL_WIDTH - 0.15, row * Base._CELL_HEIGHT - 0.1)
                .fill_(fill);
        else
            use = this._graphicrows[row]
                .use_(id)
                .move_(col * Base._CELL_WIDTH, row * Base._CELL_HEIGHT)
                .fill_(fill);
        if (this._webkitCompat) // FUDGE need width/height for webkit browsers as they don't inherit them from symbol
            use.attr_({width: width, height: height})
        if (cell.size_ == CellSize.DOUBLE_HEIGHT_ || cell.size_ == CellSize.DOUBLE_SIZE_)
            use.attr_('height', Base._CELL_DOUBLE_HEIGHT);
        if (cell.size_ == CellSize.DOUBLE_WIDTH_ || cell.size_ == CellSize.DOUBLE_SIZE_)
            use.attr_('width', Base._CELL_DOUBLE_WIDTH);
        if (cell.flashing_) use.addClass_('flash');
        if (cell.concealed_) use.addClass_('conceal');
    }

    _resetGraphicRow(rowNum) {
        if (this._graphicrows[rowNum]) this._graphicrows[rowNum].remove_();
        this._graphicrows[rowNum] = this._graphicLayer.group_();
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
