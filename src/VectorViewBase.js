import { SVG } from './SVG.js'
import { Attributes, CellType, CellSize } from './Attributes.js';

const WIDTH_PX = 400;
const HEIGHT_PX = 250;
const COLS = 40;
const ROWS = 25;
const SCREEN_SCALE = 2;
const ASPECT_RATIO_VERTICAL_SCALE = {
    1.33: WIDTH_PX/(1.33 * HEIGHT_PX),
    1.2:  WIDTH_PX/(1.2  * HEIGHT_PX),
    1.22: WIDTH_PX/(1.22 * HEIGHT_PX),
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
    _contiguous: {
        _textLength: CELL_WIDTH + 0.4,
        _DX: 0 - TEXT_X_OFFSET - 0.2,
    },
    _separated: {
        _textLength: CELL_WIDTH,
        _DX: 0 - TEXT_X_OFFSET + 0.5,
    }
};
Object.freeze(MOSAIC_METRIC);

export class VectorViewBase {
    constructor(model) {
        this._svg = new SVG()
            .viewbox(`0 0 ${WIDTH_PX - 1} ${HEIGHT_PX - 1}`)
            .size(WIDTH_PX * SCREEN_SCALE, HEIGHT_PX * SCREEN_SCALE * ASPECT_RATIO_VERTICAL_SCALE[DEFAULT_ASPECT_RATIO])
            .attr({
                'preserveAspectRatio': 'none',
                'style': 'font-family: "sans-serif"'
            })
            .style(getStyle());

        this.d = this._svg.group().attr('class', 'conceal_concealed flash_flashing');

        this._aspectRatio = DEFAULT_ASPECT_RATIO;

        this._createDisplay();
        this._createBoxModeClip();
        this._gridLayer = null;

        this._model = model;
        this._listenerId = this._model.onSet.attach(
            () => this._update()
        );
        this._boxMode = false;
        this._mixMode = false;
        this._pageContainsBox = false;

        this._plugins = {};
        console.debug('VectorViewBase constructed');
    }

    addTo(selector) {
        this._svg.addTo(selector);
    }

    detach() {
        this._model.onSet.detach(this._listenerId);
        this._listenerId = null;
    }

    _update() {
        console.debug('## View._update');
        let nextRowHidden = false;  // row might be hidden if row above contains double height or size
        let pageContainsFlash = false;
        this._pageContainsBox = false;
        this._gridrows.forEach((rowView, rowIndex) => {
            let nextCellObscured = false;   // cell might be obscured if previous cell contains double width or size
            this._resetRow(rowIndex);
            if (nextRowHidden) {
                nextRowHidden = false;
                this._clearRowCells(rowView, rowIndex);
                return;
            }

            const rowModel = this._model.getRow(rowIndex);
            let previousBg, previousBoxed;
            rowView.forEach((cellView, cellIndex) => {
                const cell = rowModel.getCell(cellIndex);
                const bg = Attributes.fillColourFromColourAttrib(cell.bgColour);
                if (nextCellObscured) {
                    nextCellObscured = false;
                    this._clearCell(cellView);
                    this._extendBackgroundForRow(rowIndex);
                    if (previousBoxed) this._extendBox();
                } else {
                    const isMosaicByte = cell.isMosaicByte();
                    const fill = Attributes.fillColourFromColourAttrib(cell.fgColour);
                    const attr = this._getCellAttr(cell.type, isMosaicByte);

                    this._renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaicByte);

                    if (cell.boxed) {
                        if (previousBoxed) this._extendBox();
                        else this._setBoxForRow(rowIndex, cellIndex);
                        this._pageContainsBox = true;
                    }

                    if (previousBg == bg) this._extendBackgroundForRow(rowIndex);
                    else this._setBackgroundForRow(rowIndex, cellIndex, bg);

                    if (cell.size == CellSize.DOUBLE_WIDTH) nextCellObscured = true;
                    previousBg = bg;
                    previousBoxed = cell.boxed;
                    if (cell.flashing) pageContainsFlash = true;
                }
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
        if ('_endOfUpdate' in this._plugins) this._plugins._endOfUpdate(this._svg.width(), this._svg.height());
        this.d.addClass('conceal_concealed');
        // FUDGE keep flashing synchronised
        if (pageContainsFlash) {
            this.d.removeClass('flash_flashing');
            setTimeout(() => this.d.addClass('flash_flashing'), 10);
        }
        this._refreshMixMode();
    }

    _resetRow(rowIndex) {
        this._resetBackgroundForRow(rowIndex);
        this._resetBoxClipForRow(rowIndex);
    }

    _clearRowCells(rowView, rowNum) {
        if ('_clearCellsForRow' in this._plugins)
            this._plugins._clearCellsForRow(rowView.length, rowNum);

        rowView.forEach(cellView => this._clearCell(cellView));
    }

    _clearCell(cellView) {
        cellView.plain(' ')
            .attr({
                dx: null,
                dy: null,
                textLength: null,
                lengthAdjust: null,
                'text-anchor': null,
                transform: null,
                class: null,
            })
        ;
    }

    _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
        this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);

        if (cell.type == CellType.MOSAIC_CONTIGUOUS && isMosaic) cellView.addClass('mosaic');
        else if (cell.type == CellType.MOSAIC_SEPARATED && isMosaic) cellView.addClass('mosaic_separated');
    }

    _renderText(cellView, cell, attr, fill, cellIndex, rowIndex) {
        cellView.plain(cell.char).attr(attr).fill(fill);
        if (cell.size == CellSize.DOUBLE_HEIGHT) {
            cellView.attr('transform', VectorViewBase._getDoubleHeightTransform(rowIndex));
        } else if (cell.size == CellSize.DOUBLE_WIDTH) {
            cellView.attr('transform', VectorViewBase._getDoubleWidthTransform(cellIndex));
        }
        if (cell.flashing) cellView.addClass('flash');
        if (cell.concealed) cellView.addClass('conceal');
    }

    reveal() {
        this.d.toggleClass('conceal_concealed');
    }

    setFont(font) {
        let newFont = '"' + font + '"';
        if (font == 'native')
            newFont = '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif';
        else if (font == 'default')
            newFont = 'sans-serif';

        this._svg.attr('style', `font-family: ${newFont}`);
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
            this._bgLayer.attr('opacity', null).unclip();
        } else {
            this._mixMode = true;
            this._setMixMode();
        }
    }

    setAspectRatio(aspectRatio) {
        this._aspectRatio = aspectRatio;
        this.setHeight(this._svg.height());
    }

    setHeight(height) {
        const width = this._aspectRatio == 'natural' ? height * (WIDTH_PX / HEIGHT_PX) : height * this._aspectRatio;
        this._svg.size(width, height);
    }

    _setMixMode() {
        if (this._boxMode && this._pageContainsBox)
            this._bgLayer.attr('opacity', 0.3);
        else if (this._pageContainsBox)
            this._bgLayer.clipWith(this._boxLayer).attr('opacity', 0.3);
        else
            this._bgLayer.attr('opacity', 0);
    }

    _refreshMixMode() {
        if (this._mixMode) this._setMixMode();
    }

    boxMode() {
        if (!this._boxMode) {
            this.d.clipWith(this._boxLayer)
            this._boxMode = true;
            console.log('box activated');
        } else {
            this.d.unclip();
            this._boxMode = false;
            console.log('box deactivated');
        }
        this._refreshMixMode();
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

    _createBoxModeClip() {
        // FUDGE can't use groups directly in <clipPath> https://github.com/w3c/fxtf-drafts/issues/17
        // Boxed cells are buffered and tagged with data-boxbuffer as the row is constructed
        // Then moved to the <clipPath> stored in this._boxLayer and tagged with data-r=rowNum
        this._defs = this.d.defs();
        this._lastBoxBuffer = null;
        this._boxLayer = this._defs.clip();
    }

    _createDisplay() {
        this._createRowBackgrounds();
        this._createCells();
    }

    _createRowBackgrounds() {
        const bgrows = [];
        const bgGroup = this.d.group();
        bgGroup.attr({
            'shape-rendering': 'crispEdges',
            id: 'background'
        });
        this._bgrows = bgrows;   // store backgrounds per row
        this._bgLayer = bgGroup;
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
        this._gridrows = gridrows;   // text per cell per row: [rowNum][colNum]
        this._textLayer = textGroup;
    }

    _resetBoxClipForRow(rowNum) {
        this._boxLayer.children()
            .filter(b => b.data('r') == rowNum)
            .forEach(b => b.remove());
    }

    _resetBackgroundForRow(rowNum) {
        if (this._bgrows[rowNum]) this._bgrows[rowNum].remove();
        this._bgrows[rowNum] = this._bgLayer.group();
    }

    _extendBackgroundForRow(rowNum) {
        const last = this._bgrows[rowNum].last();
        const width = last.width();
        last.width(width + CELL_WIDTH);
    }

    _setBackgroundForRow(rowNum, colNum, colour) {
        const x = colNum * CELL_WIDTH;
        const y = rowNum * CELL_HEIGHT;
        this._bgrows[rowNum]
            .rect(CELL_WIDTH, CELL_HEIGHT)
            .fill(colour)
            .move(x, y)
    }

    _extendBox() {
        const width = this._lastBoxBuffer.width();
        this._lastBoxBuffer.width(width + CELL_WIDTH);
    }

    _setRowDoubleHeight(rowNum) {
        this._bgrows[rowNum].children().forEach(bg => bg.attr('height', CELL_DOUBLE_HEIGHT));
    }

    _setBoxDoubleHeight() {
        this._defs.find('[data-boxbuffer]').forEach(box => box.height(CELL_DOUBLE_HEIGHT));
        // TODO might be quicker to filter instead of using a selector
    }

    _setBoxForRow(rowNum, colNum) {
        const x = colNum * CELL_WIDTH;
        const y = rowNum * CELL_HEIGHT;
        this._lastBoxBuffer = this._defs.rect(CELL_WIDTH, CELL_HEIGHT).data('boxbuffer', true).move(x, y);
    }

    // FUDGE move boxes tagged with data-boxbuffer into the clip layer.
    _makeClipFromBoxesForRow(rowNum) {
        this._defs.find('[data-boxbuffer]').forEach(box => {
            box.data({
                r: rowNum,
                boxbuffer: null
            });
            this._boxLayer.add(box);
        });
    }

    _getCellAttr(cellType, isMosaicChar) {
        if (cellType == CellType.MOSAIC_CONTIGUOUS && isMosaicChar) {
            return {
                dx: MOSAIC_METRIC._contiguous._DX,
                dy: -0.15,
                textLength: MOSAIC_METRIC._contiguous._textLength,
                lengthAdjust: 'spacingAndGlyphs',
                'text-anchor': 'start',
                transform: null,
                class: null,
            };
        } else if (cellType == CellType.MOSAIC_SEPARATED && isMosaicChar) {
            return {
                dx: MOSAIC_METRIC._separated._DX,
                dy: null,
                textLength: MOSAIC_METRIC._separated._textLength,
                lengthAdjust: 'spacingAndGlyphs',
                'text-anchor': 'start',
                transform: null,
                class: null,
            };
        } 
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

    static _getDoubleHeightTransform(row) {
        const yTranslate = (2 * ((CELL_HEIGHT * row) + TEXT_Y_OFFSET)) - ((CELL_HEIGHT * row) + (2 * TEXT_Y_OFFSET));
        // TODO - can that be simplified
        return `translate(0 -${yTranslate}) scale(1 2)`;
    }

    static _getDoubleWidthTransform(col) {
        const xTranslate = 0 - (col * CELL_WIDTH);
        // const xTranslate = (2 * ((CELL_WIDTH * col) + TEXT_X_OFFSET)) - ((CELL_WIDTH * col) + (2 * TEXT_X_OFFSET));
        return `translate(${xTranslate} 0) scale(2 1)`;
    }

    registerPlugin(name, methods) {
        if ('renderBackground' in methods)
            this._plugins._background = methods.renderBackground;
        if ('renderMosaic' in methods)
            this._plugins._mosaic = methods.renderMosaic; 
        if ('endOfPageUpdate' in methods)
            this._plugins._endOfUpdate = methods.endOfPageUpdate;
        if ('clearCellsForRow' in methods)
            this._plugins._clearCellsForRow = methods.clearCellsForRow;

        return {
            lookupColour: colourLookupFn,
            isDoubleHeight: isDoubleHeightFn,
            isSeparatedMosaic: isSeparatedMosaicFn,
            createImageOverlay: this._createImageOverlay.bind(this)
        };
    }

    _createImageOverlay() {
        const image = this.d.image(WIDTH_PX, HEIGHT_PX);
        image.attr('preserveAspectRatio', 'none');
        return image;
    }
}

// expose constants here for subclasses
VectorViewBase._CELL_WIDTH = CELL_WIDTH;
VectorViewBase._CELL_HEIGHT = CELL_HEIGHT;
VectorViewBase._CELL_DOUBLE_HEIGHT = CELL_DOUBLE_HEIGHT;
VectorViewBase._WIDTH_PX = WIDTH_PX;
VectorViewBase._HEIGHT_PX = HEIGHT_PX;
// constants for plugins
VectorViewBase.ROWS = ROWS;
VectorViewBase.COLS = COLS;

// helper functions used by plugin
const colourLookupFn = colourSymbol => Attributes.fillColourFromColourAttrib(colourSymbol);
const isDoubleHeightFn = size => size == CellSize.DOUBLE_HEIGHT;
const isSeparatedMosaicFn = type => type == CellType.MOSAIC_SEPARATED;

function getRandomLetter() {
    return String.fromCharCode(32 + Math.random() * 95); // returns letter in ASCII range
}

function getStyle() {

    // .mosaic class font size - FUDGE bigger than 10px to close tiny gaps vertically */
    return `@font-face {
font-family: 'Unscii';
src: url('fonts/unscii-16.woff') format('woff'), 
url('fonts/unscii-16.ttf') format('truetype'),
url('fonts/unscii-16.otf') format('opentype');
unicode-range: U+0000-00FF, U+2022, U+2500, U+2502, U+250C, U+2510, U+2514, U+2518, U+251C, U+251D, U+2524, U+2525, U+252C, U+252F, U+2534, U+2537, U+253C, U+253F, U+2588, U+258C, U+2590, U+2592, U+25CB, U+25CF, U+25E2-25E5, U+2B60-2B63, U+E0C0-E0FF, U+1FB00-1FB70, U+1FB75, U+1FBA0-1FBA7;
-webkit-font-smoothing: none;
font-smooth: never;
}
@font-face {
font-family: 'Bedstead';
src: url('fonts/bedstead.otf') format('opentype');
unicode-range: U+0000-00FF;
}
@keyframes blink {
to {
visibility: hidden;
}
}
@keyframes fancyblink {
0% {
filter: none;
opacity: 0.7;
}
33% {
filter: none;
opacity: 1;
}
66% {
filter: none;
opacity: 1;
}
99% {
filter: blur(2px);
opacity: 0;
}
to {
filter: none;
opacity: 0;
}
}
#textlayer {
font-size: 10px;
}
.mosaic {
font-family: 'Unscii';
font-size: 10.3px;
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
}
svg use {
shape-rendering: crispEdges;
}
rect { color: orange; }
`;
}
