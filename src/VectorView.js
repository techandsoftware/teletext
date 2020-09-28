import { SVG } from '@svgdotjs/svg.js';
import { Attributes } from './Attributes.js';

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

        // const rect = this.draw.rect(100, 100).attr({ fill: '#03e' })
        this._drawGrid();
        this._createCells();

        this._model = model;
        this._model.onSet.attach(
            () => this._update()
        );
        console.debug('VectorView constructed');
    }

    _update() {
        console.debug('## View._update');
        this.gridrows.forEach((rowView, index) => {
            const rowData = this._model.getRow(index);
            rowView.forEach((cellView, cellIndex) => {
                const cell = rowData[cellIndex];
                const fill = Attributes.colourAttribToFillColour(cell.getFgColour());
                cellView.plain(cell.getByte()).fill(fill);
            });
        });
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
        const group = this.d.group().attr({
            'text-anchor': 'middle',
            'fill': '#fff'
        }).font({ size: fontSize });
        for (let rowNum = 0; rowNum < ROWS; rowNum++) {
            const row = [];
            for (let colNum = 0; colNum < COLS; colNum++) {
                row.push(group.plain(getRandomLetter()).attr({
                    x: (colNum * CELL_WIDTH) + cellXOffset,
                    y: (rowNum * CELL_HEIGHT) + cellYOffset,
                }));
            }
            rows.push(row);
        }
        this.gridrows = rows;
        this.textLayer = group;
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
