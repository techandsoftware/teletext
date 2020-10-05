import { SVG } from '@svgdotjs/svg.js';
import { Attributes, CellType, CellSize } from './Attributes.js';

const WIDTH_PX = 400;
const HEIGHT_PX = 240;
const COLS = 40;
const ROWS = 24;
const SCREEN_SCALE = 10;

const CELL_HEIGHT = HEIGHT_PX / ROWS;
const CELL_WIDTH = WIDTH_PX / COLS;
const CELL_DOUBLE_HEIGHT = CELL_HEIGHT * 2;

const TEXT_X_OFFSET = CELL_WIDTH / 2;           // middle of cell
const TEXT_Y_OFFSET = CELL_HEIGHT * (4 / 5);    // font baseline
const TEXT_DOUBLE_HEIGHT_DY = TEXT_Y_OFFSET / 4;

// FUDGE contiguous mosaics are slightly bigger than they should be to avoid tiny gaps on adjacent characters.
// Suspect the gaps are due to font antialiasing, with no way to switch antialiasing off.
const MOSAIC_METRIC = {
    contiguous: {
        textLength: CELL_WIDTH + 0.2,
        DX: 0 - TEXT_X_OFFSET -0.1,
        DY: null,   
        doubleHeightDY: 2.3
    }
};
MOSAIC_METRIC.separated = {
    textLength: MOSAIC_METRIC.contiguous.textLength - 1,
    DX: 0 - TEXT_X_OFFSET - 0.3,
    DY: null,
    doubleHeightDY: 2.1
};
Object.freeze(MOSAIC_METRIC);

const dyLookup = {
    [CellSize.NORMAL_SIZE]: {
        [CellType.ALPHA]            : null,
        [CellType.MOSAIC_CONTIGUOUS]: MOSAIC_METRIC.contiguous.DY,
        [CellType.MOSAIC_SEPARATED] : MOSAIC_METRIC.separated.DY,
    },
    [CellSize.DOUBLE_HEIGHT]: {
        [CellType.ALPHA]            : TEXT_DOUBLE_HEIGHT_DY,
        [CellType.MOSAIC_CONTIGUOUS]: MOSAIC_METRIC.contiguous.doubleHeightDY,
        [CellType.MOSAIC_SEPARATED] : MOSAIC_METRIC.separated.doubleHeightDY,
    }
};
Object.freeze(dyLookup);


export class View {
    constructor(model) {
        this.d = SVG().addTo('body')
            .viewbox(`0 0 ${WIDTH_PX - 1} ${HEIGHT_PX - 1}`)
            .size(WIDTH_PX * SCREEN_SCALE, HEIGHT_PX * SCREEN_SCALE)
            .toggleClass('conceal_concealed');

        this._createRowBackgrounds();
        this._createCells();
        // this._drawGrid();

        this._model = model;
        this._model.onSet.attach(
            () => this._update()
        );
        console.debug('VectorView constructed');
    }

    _update() {
        console.debug('## View._update');
        let nextRowHidden = false;
        this.gridrows.forEach((rowView, rowIndex) => {
            if (nextRowHidden) {
                nextRowHidden = false;
                this._resetRowCells(rowView);
                this._resetBackgroundForRow(rowIndex);
                return;
            }

            const rowModel = this._model.getRow(rowIndex);
            let previousBg;
            rowView.forEach((cellView, cellIndex) => {
                const cell = rowModel.getCell(cellIndex);
                const fill = Attributes.fillColourFromColourAttrib(cell.fgColour);
                const bg = Attributes.fillColourFromColourAttrib(cell.bgColour);
                const dy = View._getCellDY(cell.type, cell.size);
                const attr = View._getCellAttr(cell.type);

                View._setCellClasses(cellView, cell.type, cell.flashing, cell.concealed);
                if (cell.size == CellSize.NORMAL_SIZE) {
                    cellView.transform(null);
                } else if (cell.size == CellSize.DOUBLE_HEIGHT) {
                    cellView.scale(1, 2);
                }
                cellView.plain(cell.char).attr(attr).fill(fill).dy(dy);

                if (previousBg == bg) {
                    this._extendBackgroundForRow(rowIndex);
                } else {
                    this._setBackgroundForRow(rowIndex, cellIndex, bg);
                }
                previousBg = bg;
            });

            if (rowModel.doubleHeight) {
                this.bgrows[rowIndex].height(CELL_DOUBLE_HEIGHT);
                nextRowHidden = true;
            } else {
                this.bgrows[rowIndex].transform(null);
                nextRowHidden = false;
            }
        });
    }

    reveal() {
        this.d.toggleClass('conceal_concealed');
    }

    static _setCellClasses(cellView, cellType, flashing, concealed) {
        if (cellType == CellType.MOSAIC_CONTIGUOUS) {
            cellView.addClass('mosaic');
            cellView.removeClass('mosaic_separated');
        } else if (cellType == CellType.MOSAIC_SEPARATED) {
            cellView.addClass('mosaic_separated');
            cellView.removeClass('mosaic');
        } else {
            cellView.removeClass('mosaic mosaic_separated');
        }

        if (flashing) cellView.addClass('flash');
        else cellView.removeClass('flash');

        if (concealed) cellView.addClass('conceal');
        else cellView.removeClass('conceal');
    }

    static _getCellAttr(cellType) {
        if (cellType == CellType.MOSAIC_CONTIGUOUS) {
            return {
                dx: MOSAIC_METRIC.contiguous.DX,
                textLength: MOSAIC_METRIC.contiguous.textLength,
                lengthAdjust: 'spacingAndGlyphs',
                'text-anchor': 'start',
            };
        } else if (cellType == CellType.MOSAIC_SEPARATED) {
            return {
                dx: MOSAIC_METRIC.separated.DX,
                textLength: MOSAIC_METRIC.separated.textLength,
                lengthAdjust: 'spacingAndGlyphs',
                'text-anchor': 'start',
                stroke: 'transparent',
                'stroke-width': '0.4',
            };
        } 
        return {
            dx: null,
            textLength: null,
            lengthAdjust: null,
            'text-anchor': null,
            stroke: null,
            'stroke-width': null,
        };
    }

    static _getCellDY(type, size) {
        if (size == CellSize.NORMAL_SIZE || size == CellSize.DOUBLE_WIDTH) {
            return dyLookup[CellSize.NORMAL_SIZE][type];
        }
        return dyLookup[CellSize.DOUBLE_HEIGHT][type];
    }

    _drawGrid() {
        for (let row = 0; row < ROWS; row++) {
            this.d.line(0, row * CELL_HEIGHT, WIDTH_PX - 1, row * CELL_HEIGHT).attr({
                stroke: '#555',
                'stroke-width': 0.5,
            });
        }
        for (let col = 0; col < COLS; col++) {
            this.d.line(col * CELL_WIDTH, 0, col * CELL_WIDTH, HEIGHT_PX - 1).attr({
                stroke: '#555',
                'stroke-width': 0.5,
            });
        }
    }

    _resetRowCells(rowView) {
        rowView.forEach(cellView => {
            cellView.plain(' ')
                .removeClass('flash mosaic mosaic_separated')
                .attr({
                    dx: null,
                    dy: null,
                    textLength: null,
                    lengthAdjust: null,
                    'text-anchor': null,
                    stroke: null,
                    'stroke-width': null,
                })
            ;
        });
    }

    _createRowBackgrounds() {
        const bgrows = [];
        const bgGroup = this.d.group();
        bgGroup.attr({ 'shape-rendering': 'crispEdges' })
        for (let rowNum = 0; rowNum < ROWS; rowNum++) {
            bgrows.push(bgGroup.group());
        }
        this.bgrows = bgrows;   // store backgrounds per row
        this.bgLayer = bgGroup;
    }

    _createCells() {
        const gridrows = [];
        const fontSize = CELL_HEIGHT;// * (9/10);
        const textGroup = this.d.group().attr({
            'text-anchor': 'middle',
            'fill': '#fff'
        }).font({ size: fontSize });
        for (let rowNum = 0; rowNum < ROWS; rowNum++) {
            const rowCells = [];
            for (let colNum = 0; colNum < COLS; colNum++) {
                rowCells.push(textGroup.plain(getRandomLetter()).attr({
                    x: (colNum * CELL_WIDTH) + TEXT_X_OFFSET,
                    y: (rowNum * CELL_HEIGHT) + TEXT_Y_OFFSET,
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
