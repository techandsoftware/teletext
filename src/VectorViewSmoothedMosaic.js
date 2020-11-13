// TODO
// double height
// conceal/flash
// background colour to fix anti-aliasing
// change code to be a plugin?


import { CellType, CellSize } from './Attributes.js';
import { VectorViewBase as Base } from './VectorViewBase.js';
import hqx from 'js-hqx'; 

export class View extends Base {
    constructor(model) {
        super(model);
        this._mosaicSymbols = new Set();
        this._scaledGraphicsLayer = null;

        const canvas = document.createElement('canvas');
        this._canvasCtx = canvas.getContext('2d');
        this._canvasCtx.width = Base._COLS * 2;
        this._canvasCtx.height = Base._ROWS * 3;
        canvas.width = this._canvasCtx.width;
        canvas.height = this._canvasCtx.height;
        this._canvasEl = canvas;

        // this._randomiseCanvas();
        document.querySelector('#canvas').appendChild(canvas);

        console.debug('VectorViewSmoothedMosaic constructed');
    }

    _randomiseCanvas() {
        for (let r = 0; r < Base._ROWS; r++) {
            this._canvasCtx.fillStyle = this._getRandomRGB();
            this._canvasCtx.fillRect(0, r*3, this._canvasCtx.width, 4);
            for (let c = 0; c < Base._COLS; c++) {
                this._canvasCtx.fillStyle = this._getRandomRGB();
                for (let s = 0; s < 6; s++) {
                    if (Math.round(Math.random())) {
                        this._canvasCtx.fillRect((s % 2) + (c*2), Math.floor(s/2) + (r*3), 1, 1);
                    }
                }
            }
        }
    }

    _getRandomRGB() {
        let rgb = [
            Math.round(Math.random()),
            Math.round(Math.random()),
            Math.round(Math.random())
        ];
        rgb = rgb.map(c => c.toString().replace('1', 'f'));
        return '#' + rgb.join('');
    }

    _createDisplay() {
        super._createDisplay();
        this._graphicrows = [];
        this._graphicLayer = this.d.group();
    }

    _endOfUpdateHook() {
        const targetCanvas = cloneCanvas(this._canvasEl);
        hqx(targetCanvas, 4);
        targetCanvas.style.width = `${this._svg.width()}px`;
        targetCanvas.style.height = `${this._svg.height()}px`;
        targetCanvas.style.position = 'relative';
        targetCanvas.style['z-index'] = '1';

        if (this._scaledGraphicsLayer) this._scaledGraphicsLayer.parentNode.removeChild(this._scaledGraphicsLayer);
        this._svg._node().parentNode.appendChild(targetCanvas);
        this._scaledGraphicsLayer = targetCanvas;
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
            this._renderMosaic(rowIndex, cellIndex, cell, fill);
        }
    }

    _renderMosaic(row, col, cell, fill) {
        if (cell.type == CellType.MOSAIC_SEPARATED) {
            this._renderMosaicSeparated(row, col, cell, fill);
            return;
        }

        const sextants = cell.getSextants();
        if (!sextants.includes('1')) return;
        this._canvasCtx.fillStyle = fill;
        for (let s = 0; s < 6; s++) {
            sextants[s] == '1' && this._canvasCtx.fillRect((s % 2) + (col*2), Math.floor(s/2) + (row*3), 1, 1);
        }
    }

    _renderMosaicSeparated(row, col, cell, fill) {
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
        this._canvasCtx.clearRect(0, rowNum * 3, this._canvasCtx.width, 3);
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


function cloneCanvas(oldCanvas) {
    const newCanvas = document.createElement('canvas');
    const context = newCanvas.getContext('2d');
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    context.drawImage(oldCanvas, 0, 0);
    return newCanvas;
}
