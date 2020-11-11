import { CellType, CellSize } from './Attributes.js';
import { ViewBase } from './ViewBase.js';

export class View extends ViewBase {
    constructor(model) {
        super(model);
        this._mosaicSymbols = new Set();
        console.debug('VectorView 3 constructed');
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
        if (cell.type == CellType.ALPHA || !isMosaic) {
            cellView.plain(cell.char).attr(attr).fill(fill);
            if (cell.size == CellSize.DOUBLE_HEIGHT) {
                cellView.attr('transform', View._getDoubleHeightTransform(rowIndex));
            }
            if (cell.flashing) cellView.addClass('flash');
            if (cell.concealed) cellView.addClass('conceal');
        } else if (isMosaic) {
            cellView.plain(' ').attr(attr);
            this._drawMosaic(rowIndex, cellIndex, cell, fill);
        }
    }

    _drawMosaic(row, col, cell, fill) {
        const sextants = cell.getSextants();
        // console.debug('row', row, 'col', col, cell.byte.charCodeAt(0).toString(16), sextants);
        if (!sextants.includes('1')) return;
        let id = cell.type == CellType.MOSAIC_CONTIGUOUS ? 'c' : 's';
        id += sextants.join('');

        if (!this._mosaicSymbols.has(id)) {
            this._mosaicSymbols.add(id);
            const symbol = this._svg.symbol(id);
            symbol.attr({
                preserveAspectRatio: 'none',
                width: ViewBase.CELL_WIDTH,
                height: ViewBase.CELL_HEIGHT,
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

        const use = this._graphicrows[row].use(id).move(col * ViewBase.CELL_WIDTH, row * ViewBase.CELL_HEIGHT).fill(fill);
        if (cell.size == CellSize.DOUBLE_HEIGHT) use.attr('height', ViewBase.CELL_DOUBLE_HEIGHT);
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
