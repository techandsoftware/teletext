import { SVG } from './SVG.js'
import { Attributes, CellType, CellSize } from './Attributes.js';

const WIDTH_PX = 400;
const HEIGHT_PX = 250;
const COLS = 40;
const ROWS = 25;
const SCREEN_SCALE = 2;
const ASPECT_RATIO_VERTICAL_SCALE = {
    "1":    1,
    "1.33": WIDTH_PX/(1.33 * HEIGHT_PX),
    "1.2":  WIDTH_PX/(1.2  * HEIGHT_PX),
    "1.22": WIDTH_PX/(1.22 * HEIGHT_PX),
};
const DEFAULT_ASPECT_RATIO = 1.2;

const CELL_HEIGHT = HEIGHT_PX / ROWS;
const CELL_WIDTH = WIDTH_PX / COLS;
const CELL_DOUBLE_HEIGHT = CELL_HEIGHT * 2;

const TEXT_X_OFFSET = CELL_WIDTH / 2;           // middle of cell
const TEXT_Y_OFFSET = CELL_HEIGHT * (4 / 5);    // font baseline

// FUDGE contiguous mosaics are slightly bigger than they should be to avoid tiny gaps on adjacent characters.
// Suspect the gaps are due to font antialiasing, with no way to switch antialiasing off.
const MOSAIC_METRIC = {
    contiguous: {
        textLength: CELL_WIDTH + 0.2,
        DX: 0 - TEXT_X_OFFSET -0.1,
    },
    separated: {
        textLength: CELL_WIDTH,
        DX: 0 - TEXT_X_OFFSET + 0.5,
    }
};
Object.freeze(MOSAIC_METRIC);

export class View {
    constructor(model) {
        this._svg = new SVG()
            .viewbox(`0 0 ${WIDTH_PX - 1} ${HEIGHT_PX - 1}`)
            .size(WIDTH_PX * SCREEN_SCALE, HEIGHT_PX * SCREEN_SCALE * ASPECT_RATIO_VERTICAL_SCALE[DEFAULT_ASPECT_RATIO])
            .attr('preserveAspectRatio', 'none')
            .style(getStyle());

        this.d = this._svg.group().attr('class', 'conceal_concealed flash_flashing');

        this._createRowBackgrounds();
        this._createCells();
        this._createBoxModeClip();
        this._gridLayer = null;

        this._model = model;
        this._model.onSet.attach(
            () => this._update()
        );
        this._boxMode = false;
        this._mixMode = false;
        console.debug('VectorView constructed');
    }

    addTo(selector) {
        this._svg.addTo(selector);
    }

    _update() {
        console.debug('## View._update');
        let nextRowHidden = false;
        let pageContainsFlash = false;
        this.gridrows.forEach((rowView, rowIndex) => {
            this._resetBackgroundForRow(rowIndex);
            this._resetBoxClipForRow(rowIndex);
            if (nextRowHidden) {
                nextRowHidden = false;
                this._resetRowCells(rowView, rowIndex);
                return;
            }

            const rowModel = this._model.getRow(rowIndex);
            let previousBg, previousBoxed;
            rowView.forEach((cellView, cellIndex) => {
                const cell = rowModel.getCell(cellIndex);
                const isMosaicByte = cell.isMosaicByte();
                const fill = Attributes.fillColourFromColourAttrib(cell.fgColour);
                const bg = Attributes.fillColourFromColourAttrib(cell.bgColour);
                const attr = getCellAttr(cell.type, isMosaicByte);

                cellView.plain(cell.char).attr(attr).fill(fill);
                if (cell.size == CellSize.DOUBLE_HEIGHT) {
                    const yTranslate = (2 * ((CELL_HEIGHT * rowIndex) + TEXT_Y_OFFSET)) - ((CELL_HEIGHT * rowIndex) + (2 * TEXT_Y_OFFSET))
                    cellView.attr('transform', `translate(0 -${yTranslate}) scale(1 2)`);
                }
                setCellClasses(cellView, cell.type, cell.flashing, cell.concealed, isMosaicByte);

                if (cell.boxed) {
                    if (previousBoxed) this._extendBox();
                    else this._setBoxForRow(rowIndex, cellIndex);
                }

                if (previousBg == bg) this._extendBackgroundForRow(rowIndex);
                else this._setBackgroundForRow(rowIndex, cellIndex, bg);

                previousBoxed = cell.boxed;
                previousBg = bg;
                if (cell.flashing) pageContainsFlash = true;
            });

            if (rowModel.doubleHeight) {
                this._setRowDoubleHeight(rowIndex);
                this._setBoxDoubleHeight();
                nextRowHidden = true;
            } else {
                nextRowHidden = false;
            }

            this._makeClipFromBoxesForRow(rowIndex);
        });
        this.d.addClass('conceal_concealed');
        // FUDGE keep flashing synchronised
        if (pageContainsFlash) {
            this.d.removeClass('flash_flashing');
            setTimeout(() => this.d.addClass('flash_flashing'), 0);
        }
    }

    reveal() {
        this.d.toggleClass('conceal_concealed');
    }

    grid() {
        if (this._gridLayer) {
            this._gridLayer.remove();
            this._gridLayer = null;
        } else {
            this._drawGrid();
        }
    }

    mixMode() {
        if (this._mixMode) {
            this._mixMode = false;
            this.bgLayer.attr('opacity', null);
        } else {
            this._mixMode = true;
            if (this._boxMode) this.bgLayer.attr('opacity', 0.3);
            else this.bgLayer.attr('opacity', 0);
        }
    }

    boxMode() {
        if (!this._boxMode) {
            this.d.clipWith(this.boxLayer)
            this._boxMode = true;
            console.log('box activated');
        } else {
            this.d.unclip();
            this._boxMode = false;
            console.log('box deactivated');
        }
    }

    _drawGrid() {
        this._gridLayer = this.d.group();
        for (let row = 0; row < ROWS; row++) {
            this._gridLayer.line(0, row * CELL_HEIGHT, WIDTH_PX - 1, row * CELL_HEIGHT).attr({
                stroke: '#555',
                'stroke-width': 0.5,
            });
        }
        for (let col = 0; col < COLS; col++) {
            this._gridLayer.line(col * CELL_WIDTH, 0, col * CELL_WIDTH, HEIGHT_PX - 1).attr({
                stroke: '#555',
                'stroke-width': 0.5,
            });
        }
    }

    _resetRowCells(rowView) {
        rowView.forEach((cellView) => {
            cellView.plain(' ')
                .attr({
                    dx: null,
                    textLength: null,
                    lengthAdjust: null,
                    'text-anchor': null,
                    transform: null,
                    class: null,
                })
            ;
        });
    }

    _createBoxModeClip() {
        // FUDGE can't use groups directly in <clipPath> https://github.com/w3c/fxtf-drafts/issues/17
        // Boxed cells are buffered and tagged with data-boxbuffer as the row is constructed
        // Then moved to the <clipPath> stored in this.boxLayer and tagged with data-r=rowNum
        this.defs = this.d.defs();
        this.lastBoxBuffer = null;
        this.boxLayer = this.defs.clip();
    }

    _createRowBackgrounds() {
        const bgrows = [];
        const bgGroup = this.d.group();
        bgGroup.attr({
            'shape-rendering': 'crispEdges',
            id: 'background'
        });
        this.bgrows = bgrows;   // store backgrounds per row
        this.bgLayer = bgGroup;
    }

    _createCells() {
        const gridrows = [];
        const textGroup = this.d.group().attr({
            'text-anchor': 'middle',
            'fill': '#fff'
        }).attr('id', 'textlayer');
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

    _resetBoxClipForRow(rowNum) {
        this.boxLayer.children()
            .filter(b => b.data('r') == rowNum)
            .forEach(b => b.remove());
    }

    _resetBackgroundForRow(rowNum) {
        if (this.bgrows[rowNum]) this.bgrows[rowNum].remove();
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

    _extendBox() {
        const width = this.lastBoxBuffer.width();
        this.lastBoxBuffer.width(width + CELL_WIDTH);
    }

    _setRowDoubleHeight(rowNum) {
        this.bgrows[rowNum].children().forEach(bg => bg.attr('height', CELL_DOUBLE_HEIGHT));
    }

    _setBoxDoubleHeight() {
        this.defs.find('[data-boxbuffer]').forEach(box => box.height(CELL_DOUBLE_HEIGHT));
        // TODO might be quicker to filter instead of using a selector
    }

    _setBoxForRow(rowNum, colNum) {
        const x = colNum * CELL_WIDTH;
        const y = rowNum * CELL_HEIGHT;
        this.lastBoxBuffer = this.defs.rect(CELL_WIDTH, CELL_HEIGHT).data('boxbuffer', true).move(x, y);
    }

    // FUDGE move boxes tagged with data-boxbuffer into the clip layer.
    _makeClipFromBoxesForRow(rowNum) {
        this.defs.find('[data-boxbuffer]').forEach(box => {
            box.data({
                r: rowNum,
                boxbuffer: null
            });
            this.boxLayer.add(box);
        });
    }
}

function getCellAttr(cellType, isMosaicChar) {
    if (cellType == CellType.MOSAIC_CONTIGUOUS && isMosaicChar) {
        return {
            dx: MOSAIC_METRIC.contiguous.DX,
            textLength: MOSAIC_METRIC.contiguous.textLength,
            lengthAdjust: 'spacingAndGlyphs',
            'text-anchor': 'start',
            transform: null,
            class: null,
        };
    } else if (cellType == CellType.MOSAIC_SEPARATED && isMosaicChar) {
        return {
            dx: MOSAIC_METRIC.separated.DX,
            textLength: MOSAIC_METRIC.separated.textLength,
            lengthAdjust: 'spacingAndGlyphs',
            'text-anchor': 'start',
            transform: null,
            class: null,
        };
    } 
    return {
        dx: null,
        textLength: null,
        lengthAdjust: null,
        'text-anchor': null,
        transform: null,
        class: null,
    };
}

function getRandomLetter() {
    return String.fromCharCode(32 + Math.random() * 95); // returns letter in ASCII range
}

function setCellClasses(cellView, cellType, flashing, concealed, isMosaic) {
    if (cellType == CellType.MOSAIC_CONTIGUOUS && isMosaic) cellView.addClass('mosaic');
    else if (cellType == CellType.MOSAIC_SEPARATED && isMosaic) cellView.addClass('mosaic_separated');

    if (flashing) cellView.addClass('flash');
    if (concealed) cellView.addClass('conceal');
}

function getStyle() {
    return `@font-face {
font-family: 'Unscii';
src: url('fonts/unscii-16.woff') format('woff'), 
url('fonts/unscii-16.ttf') format('truetype'),
url('fonts/unscii-16.otf') format('opentype');
unicode-range: U+20, U+2022, U+2500, U+2502, U+250C, U+2510, U+2514, U+2518, U+251C, U+251D, U+2524, U+2525, U+252C, U+252F, U+2534, U+2537, U+253C, U+253F, U+2588, U+258C, U+2590, U+2592, U+25CB, U+25CF, U+25E2-25E5, U+2B60-2B63, U+E0C0-E0FF, U+1FB00-1FB70, U+1FB75, U+1FBA0-1FBA7;
-webkit-font-smoothing: none;
font-smooth: never;
}
@keyframes blink {
66% {
visibility: hidden;
}
to {
visibility: hidden;
}
}
@keyframes fancyblink {
0% {
filter: none;
opacity: 0.8;
}
33% {
filter: none;
opacity: 1;
}
66% {
filter: none;
opacity: 1;
}
to {
filter: blur(1px);
opacity: 0;
}
}
#textlayer {
    font-size: 10px;
}
.mosaic {
font-family: 'Unscii';
font-size: 10.1px; /* FUDGE bigger than 10px to close tiny gaps vertically */
}
.mosaic_separated {
font-family: 'Unscii';
font-size: 10px;
}
.flash_flashing .flash {
/* animation: blink 2s steps(3, start) infinite; */
animation: fancyblink 2s linear infinite;
}
.conceal_concealed  .conceal {
visibility: hidden;
}
svg #background {
transition-property: opacity;
transition-duration: 0.25s;
}
svg {
background-color: transparent;
}`;
}
