// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

const NS = "http://www.w3.org/2000/svg";

let clipPathId = 0; // used by ClipPath constructor
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

    attr(objOrName, val) {
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

    addClass(name) {
        if (!this.hasClass(name)) {
            const classes = this.classes();
            classes.push(name);
            this._e.setAttribute('class', classes.join(' '));
        }
        return this;
    }

    hasClass(name) {
        return this.classes().indexOf(name) !== -1;
    }

    classes() {
        const classes = this._e.getAttribute('class');
        return classes == null ? [] : classes.split(' ');
    }

    removeClass(name) {
        if (this.hasClass(name))
            this._e.setAttribute('class', this.classes().filter(c => c !== name).join(' '));
        return this;
    }

    toggleClass(name) {
        if (this.hasClass(name))
            this.removeClass(name);
        else
            this.addClass(name);
        return this;
    }

    data(objOrName, val) {
        if (typeof objOrName == 'object') {
            for (const dataProp in objOrName) {
                if (objOrName[dataProp] == null)
                    delete this._e.dataset[dataProp];
                else
                    this._e.dataset[dataProp] = objOrName[dataProp];
            }
        } else {
            if (typeof val == 'undefined')
                return this._e.dataset[objOrName];
            else if (val == null)
                delete this._e.dataset[objOrName];
            else
                this._e.dataset[objOrName] = val;
        }
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

    addTo(selector) {
        const node = _doc.querySelector(selector);
        if (node) {
            node.appendChild(this._e);
        } else {
            throw new Error('@techandsoftware/teletext: E117: addTo failed to match provided selector')
        }
        return this;
    }

    viewbox(viewbox) {
        this._e.setAttribute('viewBox', viewbox);
        return this;
    }

    size(width, height) {
        this._e.setAttribute('width', width);
        this._e.setAttribute('height', height);
        return this;
    }

    style(style) {
        const styleNode = _doc.createElementNS(NS, 'style');
        styleNode.append(style);
        this._e.append(styleNode);
        return this;
    }

    group() {
        const group = new Group();
        this._e.append(group._node());
        return group;
    }

    width() {
        return this._e.clientWidth;
    }

    height() {
        return this._e.clientHeight;
    }

    symbol(id) {
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

    group() {
        const group = new Group();
        this._e.append(group._node());
        this._c.push(group);
        return group;
    }

    plain(text) {
        const textObj = new Text(text);
        this._e.append(textObj._node());
        this._c.push(textObj);
        return textObj;
    }

    defs() {
        const defs = new Defs();
        this._e.append(defs._node());
        return defs;
    }

    rect(width, height) {
        const rect = new Rect(width, height);
        this._e.append(rect._node());
        this._c.push(rect);
        return rect;
    }

    last() {
        return this._c[this._c.length - 1];
    }

    children() {
        return this._c;
    }

    clipWith(clipPath) {
        this._e.setAttribute('clip-path', `url("#${clipPath._node().id}")`);
        return this;
    }

    unclip() {
        this._e.removeAttribute('clip-path');
        return this;
    }

    remove() {
        this._e.parentNode && this._e.parentNode.removeChild(this._e);
        this._e = null;
        this._c.forEach(c => c._removeNode());
        this._c = [];
    }

    line(x1, y1, x2, y2) {
        const line = new Line(x1, y1, x2, y2);
        this._e.append(line._node());
        this._c.push(line);
        return line;
    }

    use(id) {
        const use = new Use(id);
        this._e.append(use._node());
        this._c.push(use);
        return use;
    }

    image(width, height) {
        const image = new Image(width, height);
        this._e.append(image._node());
        this._c.push(image);
        return image;
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
}

class Use extends Element {
    constructor(id) {
        super();
        this._e = _doc.createElementNS(NS, 'use');
        this._e.setAttribute('href', `#${id}`);
        return this;
    }

    fill(fill) {
        this._e.setAttribute('fill', fill);
        return this;
    }

    move(x, y) {
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

    rect(width, height) {
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

    plain(text) {
        this._e.textContent = text;
        return this;
    }

    fill(fill) {
        this._e.setAttribute('fill', fill);
        return this;
    }

}

class Defs extends Element {
    constructor() {
        super();
        this._e = _doc.createElementNS(NS, 'defs');
        return this;
    }

    clip() {
        const clip = new ClipPath();
        this._e.append(clip._node());
        return clip;
    }

    find(selector) {
        const matchedEls = this._e.querySelectorAll(selector);
        return [...matchedEls].map(wrapSVGElement);
    }

    rect(width, height) {
        const rect = new Rect(width, height);
        this._e.append(rect._node());
        return rect;
    }
}

class ClipPath extends Element {
    constructor() {
        super();
        this._e = _doc.createElementNS(NS, 'clipPath');
        this._e.setAttribute('id', `clipPath-${clipPathId}`);
        clipPathId++;
        return this;
    }

    children() {
        return [...this._e.children].map(wrapSVGElement);
    }

    add(shape) {
        this._e.appendChild(shape._node());
    }
}

class Rect extends Element {
    constructor(widthOrEl, height) {
        super();
        if (widthOrEl instanceof _window.SVGElement) {
            this._e = widthOrEl;
            return this;
        }
        const width = widthOrEl;
        this._e = _doc.createElementNS(NS, 'rect');
        this._e.setAttribute('width', parseInt(width));
        this._e.setAttribute('height', parseInt(height));
        return this;
    }

    fill(fill) {
        this._e.setAttribute('fill', fill);
        return this;
    }

    move(x, y) {
        this._e.setAttribute('x', x);
        this._e.setAttribute('y', y);
        return this;
    }

    width(width) {
        if (width === undefined)
            return parseInt(this._e.getAttribute('width'));

        this._e.setAttribute('width', parseInt(width));
        return this;
    }

    height(height) {
        if (height === undefined)
            return parseInt(this._e.getAttribute('height'));

        this._e.setAttribute('height', parseInt(height));
        return this;
    }

    remove() {
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


function wrapSVGElement(el) {
    let wrappedEl;
    switch (el.constructor.name) {
        case "SVGRectElement":
            wrappedEl = new Rect(el);
            break;
        default:
            throw new Error("SVG:wrapSVGElement Unable to wrap SVG element of type " + el.constructor.name);
    }
    return wrappedEl;
}
