import { SVG } from '@svgdotjs/svg.js';
import { Attributes, CellType } from './Attributes.js';

const WIDTH_PX = 400;
const HEIGHT_PX = 240;
const COLS = 40;
const ROWS = 24;
const SCREEN_SCALE = 1.5;

const CELL_HEIGHT = HEIGHT_PX / ROWS;
const CELL_WIDTH = WIDTH_PX / COLS;

export class View {
    constructor(model) {
        this.d = SVG().addTo('body')
            .viewbox(`0 0 ${WIDTH_PX-1} ${HEIGHT_PX-1}`)
            .size(WIDTH_PX*SCREEN_SCALE, HEIGHT_PX*SCREEN_SCALE);

        this._createRows();
        this._createCells();
        // this._drawGrid();

        this._model = model;
        this._model.onSet.attach(
            () => this._update()
        );
        // FUDGE following is used to tweak the mosaic cell size/position to avoid tiny gaps
        // Suspect the gaps are due to font antialiasing, with no way to switch antialiasing off)
        this._mosaicTextLength = CELL_WIDTH + 0.2;    
        this._mosaicDX = -0.1;
        this._mosaicDY = 0.15;
        console.debug('VectorView constructed');
    }

    _update() {
        console.debug('## View._update');
        this.gridrows.forEach((rowView, rowIndex) => {
            const rowData = this._model.getRow(rowIndex);
            let previousBg;
            rowView.forEach((cellView, cellIndex) => {
                const cell = rowData[cellIndex];
                const fill = Attributes.fillColourFromColourAttrib(cell.fgColour);
                const bg = Attributes.fillColourFromColourAttrib(cell.bgColour);
                if (cell.type == CellType.MOSAIC_CONTIGUOUS) {
                    cellView.addClass('mosaic').attr({
                        dx: this._mosaicDX,
                        dy: this._mosaicDY,
                        textLength: this._mosaicTextLength,
                        lengthAdjust: 'spacingAndGlyphs',
                        'text-anchor': 'start',
                    });
                } else if (cell.type == CellType.MOSAIC_SEPARATED) {
                    cellView.addClass('mosaic_separated').attr({
                        dx: 1,
                        dy: null,
                        textLength: this._mosaicTextLength - 1,
                        lengthAdjust: 'spacingAndGlyphs',
                        'text-anchor': 'start',
                        stroke: 'transparent',
                        'stroke-width': '0.4',
                    });
                } else {
                    cellView.removeClass('mosaic mosaic_separated').attr({
                        dx: null,
                        dy: null,
                        textLength: null,
                        lengthAdjust: null,
                        'text-anchor': null,
                        stroke: null,
                        'stroke-width': null,
                    });
                }
                if (previousBg == bg) {
                    this._extendBackgroundForRow(rowIndex);
                } else {
                    this._setBackgroundForRow(rowIndex, cellIndex, bg);
                }
                previousBg = bg;
                if (cell.flashing) {
                    cellView.addClass('flash');
                } else {
                    cellView.removeClass('flash');
                }
                cellView.plain(cell.char).fill(fill);
            });
        });
    }

    _drawGrid() {
        for (let row = 0; row < ROWS; row++) {
            this.d.line(0, row * CELL_HEIGHT, WIDTH_PX-1, row * CELL_HEIGHT).attr({
                stroke: '#555',
                'stroke-width': 0.5,
            });
        }
        for (let col = 0; col < COLS; col++) {
            this.d.line(col * CELL_WIDTH, 0, col*CELL_WIDTH, HEIGHT_PX - 1).attr({
                stroke: '#555',
                'stroke-width': 0.5,
            });
        }
    }

    _createRows() {
        const bgrows = [];
        const bgGroup = this.d.group();
        bgGroup.attr( { 'shape-rendering': 'crispEdges' })
        for (let rowNum = 0; rowNum < ROWS; rowNum++) {
            bgrows.push(bgGroup.group());
        }
        this.bgrows = bgrows;   // store backgrounds per row
        this.bgLayer = bgGroup;
    }

    _createCells() {
        const gridrows = [];
        const fontSize = CELL_HEIGHT;// * (9/10);
        const cellXOffset = CELL_WIDTH / 2;
        const cellYOffset = CELL_HEIGHT * (4/5);
        const textGroup = this.d.group().attr({
            'text-anchor': 'middle',
            'fill': '#fff'
        }).font({ size: fontSize });
        for (let rowNum = 0; rowNum < ROWS; rowNum++) {
            const rowCells = [];
            for (let colNum = 0; colNum < COLS; colNum++) {
                rowCells.push(textGroup.plain(getRandomLetter()).attr({
                    x: (colNum * CELL_WIDTH) + cellXOffset,
                    y: (rowNum * CELL_HEIGHT) + cellYOffset,
                }));
            }
            gridrows.push(rowCells);
        }
        this.gridrows = gridrows;   // text per cell per row: [rowNum][colNum]
        this.textLayer = textGroup;
    }

    _resetBackgroundForRow(rowNum) {
        this.bgrows[rowNum] = this.bgLayer.group();
    }

    _extendBackgroundForRow(rowNum) {
        const last = this.bgrows[rowNum].last();
        const width = last.width();
        last.width(width + CELL_WIDTH);
    }

    _setBackgroundForRow(rowNum, colNum, colour) {
        const x = colNum * CELL_WIDTH;
        const y = rowNum * CELL_HEIGHT;
        this.bgrows[rowNum]
            .rect(CELL_WIDTH, CELL_HEIGHT)
            .fill(colour)
            .move(x, y)
    }

    setTestPage() {
        this.gridrows.forEach(row => {
            row.forEach(cell => {
                cell.plain(getRandomLetter())
            });
        });
    }
}

function getRandomLetter() {
    return String.fromCharCode(32 + Math.random() * 95); // returns letter in ASCII range
    // return String.fromCharCode(48 + Math.random() * 75);
}

// const app = new App();

// window.addEventListener('DOMContentLoaded', (event) => {
//     document.querySelector('#testPageButton').addEventListener('click', () => app.setTestPage());
// });
