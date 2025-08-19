// SPDX-FileCopyrightText: © 2025 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

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
        if (!this._graphicrows[rowIndex])
            this._graphicrows[rowIndex] = this._graphicLayer.group_();
    }

    _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
        if ('_background' in this._plugins) {
            this._plugins._background(rowIndex, cellIndex, cell.size_, cell.bgColour_);
        }

        // remove the old rendered mosaic at this row,col
        this._graphicrows[rowIndex].removeChildWithProperty_('col', cellIndex);

        if (cell.type_ == CellType.ALPHA_ || cell.type_ == CellType.G3_ || !isMosaic) {
            this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);
            if (cell.type_ == CellType.G3_) cellView.addClass_('mosaic');
        } else if (isMosaic) {
            cellView.plain_(' ').attr_(attr);
            this._renderMosaic(rowIndex, cellIndex, cell, fill);
        }
    }

    // eslint-disable-next-line complexity
    _renderMosaic(row, col, cell, fill) { // TODO refactor
        if ('_mosaic' in this._plugins) {
            const wrappedCell = new WrappedCell(cell);
            const rendered = this._plugins._mosaic(row, col, wrappedCell, fill);
            if (rendered) return;
        }

        const sextants = cell.getSextants_();
        if (!sextants.includes('1')) return;
        const id = (cell.type_ == CellType.MOSAIC_CONTIGUOUS_ ? 'c' : 's') + sextants.join('');

        let width = Base._CELL_WIDTH;
        let height = Base._CELL_HEIGHT;
        if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_) {
            width = Base._CELL_WIDTH + 0.3;
            height = Base._CELL_HEIGHT + 0.2;
        }

        // create a new <symbol> if needed
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
            } else { // MOSAIC_SEPARATED_
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
        
        // create a new <use> element which refers to the <symbol>
        let use;
        if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_)
            use = this._graphicrows[row]
                .use_(id)
                .move_(col * Base._CELL_WIDTH - 0.15, row * Base._CELL_HEIGHT - 0.1)
                .fill_(fill)
                .property_('col', col);
        else // MOSAIC_SEPARATED
            use = this._graphicrows[row]
                .use_(id)
                .move_(col * Base._CELL_WIDTH, row * Base._CELL_HEIGHT)
                .fill_(fill)
                .property_('col', col);
        if (this._webkitCompat) // FUDGE need width/height for webkit browsers as they don't inherit them from symbol
            use.attr_({width: width, height: height})
        if (cell.size_ == CellSize.DOUBLE_HEIGHT_ || cell.size_ == CellSize.DOUBLE_SIZE_)
            use.attr_('height', Base._CELL_DOUBLE_HEIGHT);
        if (cell.size_ == CellSize.DOUBLE_WIDTH_ || cell.size_ == CellSize.DOUBLE_SIZE_)
            use.attr_('width', Base._CELL_DOUBLE_WIDTH);
        if (cell.flashing_) use.addClass_('flash');
        if (cell.concealed_) use.addClass_('conceal');
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
