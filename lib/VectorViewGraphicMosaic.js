// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

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

        if (cell.type_ == CellType.ALPHA_ || cell.type_ == CellType.G3_ || !isMosaic) {
            this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);
            if (cell.type_ == CellType.G3_) cellView.addClass_('mosaic');
        } else if (isMosaic) {
            cellView.plain_(' ').attr_(attr);
            this._renderMosaic(rowIndex, cellIndex, cell, fill);
        }
    }

    _renderMosaic(row, col, cell, fill) {
        if ('_mosaic' in this._plugins) {
            // const wrappedCell = new WrappedCell(cell);
            const rendered = this._plugins._mosaic(row, col, cell.public_(), fill);
            if (rendered) return;
        }

        const sextants = cell.getSextants_();
        if (!sextants.includes('1')) return;

        const id = this._getMosaicId(cell.type_, sextants);
        const isContiguous = cell.type_ == CellType.MOSAIC_CONTIGUOUS_;
        const width = Base._CELL_WIDTH + (isContiguous ? 0.3 : 0);
        const height = Base._CELL_HEIGHT + (isContiguous ? 0.2 : 0);

        if (!this._mosaicSymbols.has(id)) this._createMosaicSymbol(sextants, id, isContiguous, width, height);

        const useEl = this._placeMosaic(row, col, id, fill, isContiguous, width, height);
        this._applyCellAttributes(useEl, cell);
    }

    _getMosaicId(cellType, sextants) {
        return (cellType === CellType.MOSAIC_CONTIGUOUS_ ? 'c' : 's') + sextants.join('');
    }

    _createMosaicSymbol(sextants, id, isContiguous, width, height) {
        this._mosaicSymbols.add(id);
        const symbol = this._svg.symbol_(id);
        const rectSize = isContiguous ? 6 : 4;
        const offsets = isContiguous ? [0, 0] : [1, 2];

        symbol.attr_({
            preserveAspectRatio: 'none',
            width,
            height,
            viewBox: '0 0 12 18',
        });

        for (let i = 0; i < 6; i++) {
            if (sextants[i] === '1') {
                const x = (i % 2) * 6 + offsets[0];
                const y = Math.floor(i / 2) * 6 + offsets[1];
                symbol.rect_(rectSize, rectSize).move_(x, y);
            }
        }
        return { width, height };
    }

    _placeMosaic(row, col, id, fill, isContiguous, width, height) {
        const x = col * Base._CELL_WIDTH - (isContiguous ? 0.15 : 0);
        const y = row * Base._CELL_HEIGHT - (isContiguous ? 0.1 : 0);

        const use = this._graphicrows[row].use_(id).move_(x, y).fill_(fill);

        if (this._webkitCompat) use.attr_({ width: width, height: height });
        return use;
    }

    _applyCellAttributes(use, cell) {
        if (cell.size_ === CellSize.DOUBLE_HEIGHT_ || cell.size_ === CellSize.DOUBLE_SIZE_)
            use.attr_('height', Base._CELL_DOUBLE_HEIGHT);
        if (cell.size_ === CellSize.DOUBLE_WIDTH_ || cell.size_ === CellSize.DOUBLE_SIZE_)
            use.attr_('width', Base._CELL_DOUBLE_WIDTH);
        if (cell.flashing_) use.addClass_('flash');
        if (cell.concealed_) use.addClass_('conceal');
    }

    _resetGraphicRow(rowNum) {
        if (this._graphicrows[rowNum]) this._graphicrows[rowNum].remove_();
        this._graphicrows[rowNum] = this._graphicLayer.group_();
    }

    _getCellAttr(cellType, isMosaicChar, isCursive) {
        if (cellType == CellType.G3_) {
            return {
                dx: Base._MOSAIC_METRIC._contiguous._DX,
                dy: -0.15,
                textLength: Base._MOSAIC_METRIC._contiguous._textLength,
                lengthAdjust: 'spacingAndGlyphs',
                'text-anchor': 'start',
                transform: null,
                class: null,
            };
        }
        return {
            dx: null,
            dy: null,
            textLength: isCursive ? Base._CELL_WIDTH : null,
            lengthAdjust: isCursive ? 'spacingAndGlyphs' : null,
            'text-anchor': null,
            transform: null,
            class: null,
        };
    }
}
