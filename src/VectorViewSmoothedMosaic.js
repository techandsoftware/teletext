// TODO
// change code to be a plugin?
// investigate http://blog.pkh.me/p/19-butchering-hqx-scaling-filters.html


import { Attributes, CellType, CellSize } from './Attributes.js';
import { View as Base } from './VectorViewGraphicMosaic.js';
import hqx from 'js-hqx';

export class View extends Base {
    constructor(model) {
        super(model);

        this._scaledGraphicsLayer = null;
        this._doubleHeightCellsInRowAbove = new Set(); // keep track of double height cells to avoid clearing bottom half on graphics canvas

        const canvas = document.createElement('canvas');
        this._canvasCtx = canvas.getContext('2d');
        this._canvasCtx.width = Base._COLS * 2;
        this._canvasCtx.height = Base._ROWS * 3;
        canvas.width = this._canvasCtx.width;
        canvas.height = this._canvasCtx.height;
        canvas.style.width = canvas.width * 2 + 'px';
        canvas.style.height = canvas.height * 2 + 'px';
        this._canvasEl = canvas;

        document.querySelector('#canvas').appendChild(canvas); // TODO - move to svg?

        console.debug('VectorViewSmoothedMosaic constructed');
    }

    // _randomiseCanvas() {
    //     for (let r = 0; r < Base._ROWS; r++) {
    //         this._canvasCtx.fillStyle = this._getRandomRGB();
    //         this._canvasCtx.fillRect(0, r*3, this._canvasCtx.width, 4);
    //         for (let c = 0; c < Base._COLS; c++) {
    //             this._canvasCtx.fillStyle = this._getRandomRGB();
    //             for (let s = 0; s < 6; s++) {
    //                 if (Math.round(Math.random())) {
    //                     this._canvasCtx.fillRect((s % 2) + (c*2), Math.floor(s/2) + (r*3), 1, 1);
    //                 }
    //             }
    //         }
    //     }
    // }

    // _getRandomRGB() {
    //     let rgb = [
    //         Math.round(Math.random()),
    //         Math.round(Math.random()),
    //         Math.round(Math.random())
    //     ];
    //     rgb = rgb.map(c => c.toString().replace('1', 'f'));
    //     return '#' + rgb.join('');
    // }


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


    _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
        // plugin draw cell background
        const bgHeight = cell.size == CellSize.DOUBLE_HEIGHT ? 6 : 3;
        this._canvasCtx.clearRect(cellIndex * 2, rowIndex * 3, 2, bgHeight);
        this._canvasCtx.fillStyle = Attributes.fillColourFromColourAttrib(cell.bgColour) + '7';  // draw almost-transparent fill
        this._canvasCtx.fillRect(cellIndex * 2, rowIndex * 3, 2, bgHeight);
        // end of plugin

        super._renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic);
    }

    _renderMosaic(row, col, cell, fill) {
        if (cell.type == CellType.MOSAIC_SEPARATED || cell.flashing || cell.concealed) {
            super._renderMosaic(row, col, cell, fill);
            return;
        }

        const sextants = cell.getSextants();
        if (!sextants.includes('1')) return;
        this._canvasCtx.fillStyle = fill;
        if (cell.size == CellSize.DOUBLE_HEIGHT) {
            this._canvasCtx.clearRect(col*2, row*4, 2, 3);
            for (let s = 0; s < 6; s++) {
                sextants[s] == '1' && this._canvasCtx.fillRect((s % 2) + (col*2), (Math.floor(s/2)*2) + (row*3), 1, 2);
            }
            this._doubleHeightCellsInRowAbove.add(col);
        } else {
            for (let s = 0; s < 6; s++) {
                sextants[s] == '1' && this._canvasCtx.fillRect((s % 2) + (col*2), Math.floor(s/2) + (row*3), 1, 1);
            }
        }
    }

    _clearRowCells(rowView, rowNum) {
        super._clearRowCells(rowView, rowNum);
        for (let colNum = 0; colNum < rowView.length; colNum++) {
            if (!this._doubleHeightCellsInRowAbove.has(colNum)) {
                this._canvasCtx.clearRect(colNum * 2, rowNum * 3, 2, 3);
            }
        }
        this._doubleHeightCellsInRowAbove.clear();
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
