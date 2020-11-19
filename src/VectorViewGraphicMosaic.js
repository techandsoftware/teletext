import { CellType, CellSize } from './Attributes.js';
import { VectorViewBase as Base } from './VectorViewBase.js';

export class View extends Base {
    constructor(model) {
        super(model);
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
            cellView.plain(cell.char).attr(attr).fill(fill);
            if (cell.size == CellSize.DOUBLE_HEIGHT) {
                cellView.attr('transform', View._getDoubleHeightTransform(rowIndex));
            }
            if (cell.flashing) cellView.addClass('flash');
            if (cell.concealed) cellView.addClass('conceal');
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

        if (!this._mosaicSymbols.has(id)) {
            this._mosaicSymbols.add(id);
            const symbol = this._svg.symbol(id);
            symbol.attr({
                preserveAspectRatio: 'none',
                width: Base._CELL_WIDTH,
                height: Base._CELL_HEIGHT,
                viewBox: '0 0 12 18',
            });

            if (cell.type == CellType.MOSAIC_CONTIGUOUS) {
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect(6, 6).move((i % 2) * 6, Math.floor(i/2) * 6);
                }
            } else {
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect(4, 4).move(((i % 2) * 6) + 1, (Math.floor(i/2) * 6) + 2);
                }
            }
        }

        const use = this._graphicrows[row].use(id).move(col * Base._CELL_WIDTH, row * Base._CELL_HEIGHT).fill(fill);
        if (cell.size == CellSize.DOUBLE_HEIGHT) use.attr('height', Base._CELL_DOUBLE_HEIGHT);
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
