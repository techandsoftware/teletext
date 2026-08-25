// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

const NS = "http://www.w3.org/2000/svg";

let _window;        // set by SVG constructor
let _doc;           // set by SVG constructor

// The API exposed here is a subset of svg.js v3 - https://svgjs.com/docs/3.0/
// This wraps objects around DOM Elements

class Element {
    constructor() {
        // subclass should create this._e
    }

    _node() {
        return this._e;
    }

    _removeNode() {
        this._e = null;
    }

    attr_(objOrName, val) {
        if (typeof objOrName == 'object') {
            for (const attrName in objOrName) {
                if (objOrName[attrName] == null)
                    this._e.removeAttribute(attrName);
                else
                    this._e.setAttribute(attrName, objOrName[attrName]);
            }
        } else {
            if (typeof val == 'undefined')
                return this._e.getAttribute(objOrName);
            else if (val == null)
                this._e.removeAttribute(objOrName);
            else
                this._e.setAttribute(objOrName, val);
        }
        return this;
    }

    addClass_(name) {
        if (!this.hasClass_(name)) {
            const classes = this.classes_();
            classes.push(name);
            this._e.setAttribute('class', classes.join(' '));
        }
        return this;
    }

    hasClass_(name) {
        return this.classes_().indexOf(name) !== -1;
    }

    classes_() {
        const classes = this._e.getAttribute('class');
        return classes == null ? [] : classes.split(' ');
    }

    removeClass_(name) {
        if (this.hasClass_(name))
            this._e.setAttribute('class', this.classes_().filter(c => c !== name).join(' '));
        return this;
    }

    toggleClass_(name) {
        if (this.hasClass_(name))
            this.removeClass_(name);
        else
            this.addClass_(name);
        return this;
    }


}

export class SVG extends Element {
    constructor(windowDom) {
        super();
        _window = windowDom;
        _doc = _window.document;
        this._e = _doc.createElementNS(NS, "svg");
        this._e.setAttribute('xmlns', NS);
        return this;
    }

    headStyle_(css) {
        this._headStyle = css;
        return this;
    }

    addTo_(selector) {
        const node = _doc.querySelector(selector);
        if (node) {
            // FUDGE load fonts in the doc head as they don't reliably from shadow dom
            if (this._headStyle && !_doc.getElementById('ttx-font-faces')) {
                const style = _doc.createElement('style');
                style.id = 'ttx-font-faces';
                style.append(this._headStyle);
                _doc.head.appendChild(style);
            }
            const root = node.shadowRoot ||
                (node.attachShadow ? node.attachShadow({ mode: 'open' }) : node);
            root.appendChild(this._e);
        } else {
            throw new Error('@techandsoftware/teletext: E117: addTo failed to match provided selector')
        }
        return this;
    }

    viewbox_(viewbox) {
        this._e.setAttribute('viewBox', viewbox);
        return this;
    }

    size_(width, height) {
        this._e.setAttribute('width', width);
        this._e.setAttribute('height', height);
        return this;
    }

    style_(style) {
        const styleNode = _doc.createElementNS(NS, 'style');
        styleNode.append(style);
        this._e.append(styleNode);
        return this;
    }

    group_() {
        const group = new Group();
        this._e.append(group._node());
        return group;
    }

    width_() {
        return this._e.clientWidth;
    }

    height_() {
        return this._e.clientHeight;
    }

    symbol_(id) {
        const symbol = new SVGSymbol(id);
        this._e.append(symbol._node());
        return symbol;
    }
}


class Group extends Element {
    constructor() {
        super();
        this._e = _doc.createElementNS(NS, 'g');
        this._c = [];
        return this;
    }

    group_() {
        const group = new Group();
        this._e.append(group._node());
        this._c.push(group);
        return group;
    }

    plain_(text) {
        const textObj = new Text(text);
        this._e.append(textObj._node());
        this._c.push(textObj);
        return textObj;
    }

    defs_() {
        const defs = new Defs();
        this._e.append(defs._node());
        return defs;
    }

    rect_(width, height) {
        const rect = new Rect(width, height);
        this._e.append(rect._node());
        this._c.push(rect);
        return rect;
    }

    last_() {
        return this._c[this._c.length - 1];
    }

    children_() {
        return this._c;
    }

    clipWith_(clipPath) {
        this._e.setAttribute('clip-path', `url("#${clipPath._node().id}")`);
        return this;
    }

    unclip_() {
        this._e.removeAttribute('clip-path');
        return this;
    }

    remove_() {
        this._e.parentNode && this._e.parentNode.removeChild(this._e);
        this._e = null;
        this._c.forEach(c => c._removeNode());
        this._c = [];
    }

    line_(x1, y1, x2, y2) {
        const line = new Line(x1, y1, x2, y2);
        this._e.append(line._node());
        this._c.push(line);
        return line;
    }

    use_(id) {
        const use = new Use(id);
        this._e.append(use._node());
        this._c.push(use);
        return use;
    }

    image_(width, height) {
        const image = new Image(width, height);
        this._e.append(image._node());
        this._c.push(image);
        return image;
    }

    svg_(width, height) {
        const svg = new SVGNested(width, height);
        this._e.append(svg._node());
        this._c.push(svg);
        return svg;
    }
}

class SVGNested extends Element {
    constructor() {
        super();
        this._e = _doc.createElementNS(NS, 'svg');
        return this;
    }

    attr(...params) {
        return this.attr_(...params);
    }

    get node() {
        return this._node();
    }
}

class Image extends Element {
    constructor(width, height) {
        super();
        this._e = _doc.createElementNS(NS, 'image');
        this._e.setAttribute('width', parseInt(width));
        this._e.setAttribute('height', parseInt(height));
        return this;
    }

    attr(...params) {
        return this.attr_(...params);
    }
}

class Use extends Element {
    constructor(id) {
        super();
        this._e = _doc.createElementNS(NS, 'use');
        this._e.setAttribute('href', `#${id}`);
        return this;
    }

    fill_(fill) {
        this._e.setAttribute('fill', fill);
        return this;
    }

    move_(x, y) {
        this._e.setAttribute('x', x);
        this._e.setAttribute('y', y);
        return this;
    }
}

// Called SVGSymbol to avoid clash with built-in Symbol
class SVGSymbol extends Element {
    constructor(id) {
        super();
        this._e = _doc.createElementNS(NS, 'symbol');
        this._e.setAttribute('id', id);
        return this;
    }

    rect_(width, height) {
        const rect = new Rect(width, height);
        this._e.append(rect._node());
        return rect;
    }
}

class Text extends Element {
    constructor(text) {
        super();
        this._e = _doc.createElementNS(NS, 'text');
        this._e.append(text);
        return this;
    }

    plain_(text) {
        this._e.textContent = text;
        return this;
    }

    fill_(fill) {
        this._e.setAttribute('fill', fill);
        return this;
    }

}

class Defs extends Element {
    constructor() {
        super();
        this._e = _doc.createElementNS(NS, 'defs');
        this._clipPathId = 0;
        return this;
    }

    clip_() {
        const clip = new ClipPath(this._clipPathId++);
        this._e.append(clip._node());
        return clip;
    }
}

class ClipPath extends Element {
    constructor(id) {
        super();
        this._e = _doc.createElementNS(NS, 'clipPath');
        this._e.setAttribute('id', `clipPath-${id}`);
        this._c = [];
        return this;
    }

    rect_(width, height) {
        const rect = new Rect(width, height);
        this._e.appendChild(rect._node());
        this._c.push(rect);
        return rect;
    }

    children_() {
        return this._c;
    }

    removeChild_(rect) {
        this._c = this._c.filter(c => c !== rect);
        rect.remove_();
    }
}

class Rect extends Element {
    constructor(width, height) {
        super();
        this._e = _doc.createElementNS(NS, 'rect');
        this._e.setAttribute('width', parseInt(width));
        this._e.setAttribute('height', parseInt(height));
        return this;
    }

    fill_(fill) {
        this._e.setAttribute('fill', fill);
        return this;
    }

    move_(x, y) {
        this._e.setAttribute('x', x);
        this._e.setAttribute('y', y);
        return this;
    }

    width_(width) {
        if (width === undefined)
            return parseInt(this._e.getAttribute('width'));

        this._e.setAttribute('width', parseInt(width));
        return this;
    }

    height_(height) {
        if (height === undefined)
            return parseInt(this._e.getAttribute('height'));

        this._e.setAttribute('height', parseInt(height));
        return this;
    }

    remove_() {
        this._e.parentNode && this._e.parentNode.removeChild(this._e);
        this._e = null;
    }

}

class Line extends Element {
    constructor(x1, y1, x2, y2) {
        super();
        this._e = _doc.createElementNS(NS, 'line');
        this._e.setAttribute('x1', x1);
        this._e.setAttribute('y1', y1);
        this._e.setAttribute('x2', x2);
        this._e.setAttribute('y2', y2);
        return this;
    }
}


