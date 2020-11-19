import { Attributes, CellType, CellSize } from './Attributes.js';
import hqx from 'js-hqx';

export class SmoothMosaicPlugin {

    constructor(rows, cols) {
        this._scaledGraphicsLayer = null;
        this._doubleHeightCellsInRowAbove = new Set(); // keep track of double height cells to avoid clearing bottom half on graphics canvas

        const canvas = document.createElement('canvas');
        this._canvasCtx = canvas.getContext('2d');
        this._canvasCtx.width = cols * 2;
        this._canvasCtx.height = rows * 3;
        canvas.width = this._canvasCtx.width;
        canvas.height = this._canvasCtx.height;
        canvas.style.width = canvas.width * 2 + 'px';
        canvas.style.height = canvas.height * 2 + 'px';
        this._canvasEl = canvas;

        document.querySelector('#canvas').appendChild(canvas); // TODO - move to svg?

        console.debug('SmoothMosaicPlugin constructed');
    }

    static registerWithView(view) {
        const rows = view.constructor._ROWS;
        const cols = view.constructor._COLS;
        const instance = new SmoothMosaicPlugin(rows, cols);
        view.registerPlugin(SmoothMosaicPlugin.name, {
            renderBackground: instance.renderBackground.bind(instance),
            renderMosaic: instance.renderMosaic.bind(instance),
            endOfPageUpdate: instance.endOfUpdate.bind(instance),
            clearCellsForRow: instance.clearRowCells.bind(instance)
        });
    }

    renderBackground(rowIndex, cellIndex, size, bgColour) {
        const bgHeight = size == CellSize.DOUBLE_HEIGHT ? 6 : 3;
        this._canvasCtx.clearRect(cellIndex * 2, rowIndex * 3, 2, bgHeight);
        // transparency is '7' so anti-aliasing uses correct bg colour and transpancy isn't rendered in scaled canvas
        this._canvasCtx.fillStyle = Attributes.fillColourFromColourAttrib(bgColour) + '7';
        this._canvasCtx.fillRect(cellIndex * 2, rowIndex * 3, 2, bgHeight);
    }

    endOfUpdate(width, height) {
        const targetCanvas = cloneCanvas(this._canvasEl);
        hqx(targetCanvas, 4);
        targetCanvas.style.width = `${width}px`;
        targetCanvas.style.height = `${height}px`;
        targetCanvas.style.position = 'relative';
        targetCanvas.style['z-index'] = '1';

        if (this._scaledGraphicsLayer) this._scaledGraphicsLayer.parentNode.removeChild(this._scaledGraphicsLayer);
        document.querySelector('#teletextscreen svg').parentNode.appendChild(targetCanvas);
        this._scaledGraphicsLayer = targetCanvas;
    }

    renderMosaic(row, col, cell, fill) {
        if (cell.type == CellType.MOSAIC_SEPARATED || cell.flashing || cell.concealed) {
            return false;
        }
        const sextants = cell.getSextants();
        if (!sextants.includes('1')) return true;
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
        return true;
    }

    clearRowCells(rowLength, rowNum) {
        for (let colNum = 0; colNum < rowLength; colNum++) {
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
