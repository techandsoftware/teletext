import { SVG } from '@svgdotjs/svg.js';

const WIDTH_PX = 400;
const HEIGHT_PX = 250;
const COLS = 40;
const ROWS = 25;

const CELL_HEIGHT = HEIGHT_PX / ROWS;
const CELL_WIDTH = WIDTH_PX / COLS;

class App {
    constructor() {
        this.d = SVG().addTo('body').viewbox(`0 0 ${WIDTH_PX-1} ${HEIGHT_PX-1}`).size(WIDTH_PX*1.5, HEIGHT_PX*1.5);

        // const rect = this.draw.rect(100, 100).attr({ fill: '#03e' })
        this._drawGrid();
        this._createCells();
    }

    _drawGrid() {
        // for (let row = 0; row < ROWS; row++) {
        //     this.d.line(0, row * CELL_HEIGHT, WIDTH_PX-1, row * CELL_HEIGHT).attr({
        //         stroke: '#555',
        //         'stroke-width': 0.5,
        //     });
        // }
        // for (let col = 0; col < COLS; col++) {
        //     this.d.line(col * CELL_WIDTH, 0, col*CELL_WIDTH, HEIGHT_PX - 1).attr({
        //         stroke: '#555',
        //         'stroke-width': 0.5,
        //     });
        // }
    }

    _createCells() {
        const rows = [];
        const fontSize = CELL_HEIGHT;// * (9/10);
        const cellXOffset = CELL_WIDTH / 2;
        const cellYOffset = CELL_HEIGHT * (4/5);
        for (let rowNum = 0; rowNum < ROWS; rowNum++) {
            const row = [];
            for (let colNum = 0; colNum < COLS; colNum++) {
                row.push(this.d.plain(getRandomLetter()).attr({
                    fill: '#fff',
                    x: (colNum * CELL_WIDTH) + cellXOffset,
                    y: (rowNum * CELL_HEIGHT) + cellYOffset,
                    'text-anchor': 'middle',

                }).font({ size: fontSize }));
            }
            rows.push(row);
        }
        this.gridrows = rows;
    }
}

function getRandomLetter() {
    return String.fromCharCode(48 + Math.random() * 75);
}

new App();
