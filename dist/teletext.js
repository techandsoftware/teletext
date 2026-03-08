const CURSIVE_CHARS = "ﻰﺋﺊﭼﭽﭘﭙﮔﻎﻼﻬﻪﻊﺔﺒﺘﺎﺑﺗﺛﺟﺣﺧﺳﺷﺻﺿﻃﻇﻋﻏﺜﺠﺤﺨـﻓﻗﻛﻟﻣﻧﻫﻰﻳﻴﻌﻐﻔﻘﻠﻤﻨ";
class Utils {
  // "base64url" encoding defined here https://tools.ietf.org/html/rfc4648
  // the packed data format is from https://github.com/rawles/edit.tf
  static decodeBase64URLEncoded_(input, atob) {
    input = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = input.length % 4;
    if (pad) {
      if (pad === 1) throw new Error("Utils.decodeBase64URLEncoded E16: Input base64url string is the wrong length to determine padding");
      input += new Array(5 - pad).join("=");
    }
    const data = atob(input);
    const rows = [];
    let row = [];
    for (const val of dataTo7Bits(data)) {
      row.push(String.fromCharCode(val));
      if (row.length == 40) {
        rows.push(row.join(""));
        row = [];
      }
    }
    if (row.length < 40)
      rows.push(row.join(""));
    return rows;
  }
  // Output Line format from .tti file format https://zxnet.co.uk/teletext/documents/ttiformat.pdf
  static decodeOutputLine_(line) {
    const decoded = [];
    let decodeNextChar = false;
    for (const c of [...line]) {
      const code = c.charCodeAt(0);
      if (code == 27) {
        decodeNextChar = true;
      } else if (code >= 128 && code <= 159) {
        const char = String.fromCharCode(code - 128);
        decoded.push(char);
        decodeNextChar = false;
      } else if (code >= 160) {
        console.warn("W47 decodeOutputLine: bad character:", c);
        decoded.push("");
        decodeNextChar = false;
      } else if (decodeNextChar) {
        const char = String.fromCharCode(code - 64);
        decoded.push(char);
        decodeNextChar = false;
      } else {
        decoded.push(c);
      }
    }
    return decoded;
  }
  static getRowsFromOutputLines_(lines) {
    const rows = [];
    const regEx = /^OL,(\d{1,2}),(.*)/;
    for (const line of [...lines]) {
      const matches = line.match(regEx);
      if (matches != null) {
        rows[matches[1]] = Utils.decodeOutputLine_(matches[2]);
      } else {
        console.warn("E66 getRowsFromOutputLines_: bad line", line);
      }
    }
    return rows;
  }
  static isCursive_(char) {
    return CURSIVE_CHARS.indexOf(char) != -1;
  }
}
function intToBits(n) {
  let bits = [];
  for (let b = 7; b >= 0; b--) {
    bits.push(n & 1 << b ? 1 : 0);
  }
  return bits;
}
function* dataTo7Bits(data) {
  let bShift = 6;
  let val = 0;
  for (const d of data) {
    const bits = intToBits(d.charCodeAt(0));
    for (const b of bits) {
      val |= b << bShift;
      bShift--;
      if (bShift < 0) {
        yield val;
        bShift = 6;
        val = 0;
      }
    }
  }
  if (bShift < 6) yield val;
}
const ENGINEERING = "QIECBAgQIIcWLGg2EDdy3QIKnXKgYtUE7f2QA2TB0wYr2DECAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYMS54fzJmix4-YCDToOLOjyZ0WLSkzo6AkcGHuZUcRHlB4dgyAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAWDP9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YNCho9zImSoAqBGoAp0FUy8-iChhz5UCA4MPEuZYgTAFyAFg1_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2DYCAAoACACeQHkBdYTJlixIkSKlSJEoUKIEBQABAAQAEABYN_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39g4AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGDn9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YsAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIBix_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2LICAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYs_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39i0AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGLX9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_Ytq-jT0yg7OXZs39w0Pzh3Ao_LLl3BZuHPl3dMIGllyBIWzrlLmkKJGTSJUycsoUqlZJYtXLzLBiyZlWjVs3IuHLp2UePXz9AgQokaBIlTJ0ChSqVoFi1cvQMGLJmgaNWzdA4cunaB49fP0ECDChoIkWNHQSJMqWgmTZ09BQo0qaCpVrV0FizatoLl29fQYMOLGgyZc2dBo06taDZt3b0HDjy5oOnXt3QePPr2g-ff38pgw4sZHJlzZyujTq1ktm3dvNcOPLmW6de3cn48-vZf59_fwZiHv3Y8uHYIjbMPPQDVCxcLf4E0-mXDk8mI-_dlFCn5a9_DKr6q-qvqr6q-qvqr6AFS390DJoGQKr6q-qvqr6q-qvqr6o";
const ADVERT = "QIECBAgQIJ9KDDmRUDZi3QU8PRk1QQeHIHDaIEDJiwYumDACdDwcnbLy6aeeXbl3dECBAgQIECBAgQIECBAgQIHwZkvcoCx0og8LNGjYwQPEjzpoWaNjBA82YHnTQwabEjTpowPEiBAgLHSiBbs1atjFA9SPe2pZqQNUHX1qQatSlrqQNW-5UsaIECAsdKIFidUqQJUCVAlVKlipchQJUCJanVIEqpAlSqlC5CgQIEB0ogQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQHSKBAgQYEH7ogQaGCApw_fEm54R3PCm5JuSKHoFUEVIECAudIoECBB6-___TB-_v0JTU_WqkZHFyQKHmjYgYBECpAqQIC50igQIEH___3_-iD__6FFSAig-IP6JCg26lzRr3avEgFUgLnSKBAg1f1X9lv_9NSBAgI6G-HX1V_EqBUqQJUqXBzagVSAudIoECD9_Qa2qL__6IMDzoq682qdAgQIEARAgQIECBAgVIC50igQIP_9AiaoFX__0VfV_1kjQIECBAgQBECBAgAoECpAgLnSKBBq__0CBCgQa___oreokCBAgQIECBAgQBECBAgVIECAudIoEHr__QIECBAg3_36FAgQIECBAgQIECAIgQIFSBAgQIAZ0igQf_7dAgKIECAinKf9bTR9QIv-N6i_ofzNagQIECBAgJnSKDR__tUBRAoe6NiBB_XYf_rqg_q2iD-gRb-iBAgQIECAmdIoNX_-1QFECDrq9IMH9h664P_D-w34P7DZ4ToECBAgQICZ0ig___5TQ8SfEHzQ82MPCzpoedEHzA82MPjDQ0-LNDSk0JnSOD___lNXVh_Qf9T3cx_oP-prqa_1S3Y0_q_zX-s1NdTUmdI6v_9-U1NUH9B_1NdTX-g_6mvpL_wMNTX-g1Nf6DAz1tSZ0j-_v0JREjQokaFEhRIUSNCiRoUCNAjRoEaBEhRo0CNGgBnSP9OgQFECCNPpIIVKfDkVaUWmggzoiCFPny5M6PTQIECAGdIjUAGlJnR0DBu5coGrFm0YMEE-kgpxYqChBjxUDNuwQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAy92np007s6AFSy9tOXvzQA7O_ryQTd-7L5DQVtpBJ3ZMvg";
const UK = "QIECBAgQIIcWLGg2EDFy2QIJu_cgZNUETLjQA2TN0xYr2DAodJIECBAgQIEGDB4_PUCBAgQIECBAgQIECBAgQIEANkvaMih0kgQIECDA1Qfv__OgQYGCBAgQIECBAgQIECBAgQIECBAgKHSSBAgQIH6FR-__-v7___oECBAgQIEAORPmxUE6LXpoECAodJIECBAoQKum7______9-gQIECBAgQA82_Zs39-aB8-QIAh0kgQIECBAgSev_____v06BAgQIECBAgQIECBAgQIECBAgKHSSBAgQIECBR00____-_w9GCBAgQIECBAgQIECBAgQIECAodJIECBAgQIECD8rx________ECBAgQIECBAgQIECBAgQICh0kgQIECBAgQLETRlv_______6oECBAgQIECBAgQIECBAgKHSyBAgQIHGQlwYIEH_-_x_____9-dECBAgQIECBAgQIECAIdLIECDAmJbfz_-0RJ0qBV________7sECBAgQIECBAgQIAh0sgQIMzAl-__fX5Sg0JECvX______586IECBAgQIECBAgCHSyBAgwJiW9OjX_0qBAgQIEX________-l8fPjBAgQIECAIdLIEHBYhQIECBQxQICWDhg5fv____________tUCBAgQIAh0sgzIECBAgQIEGlAgQEtP_______________-lQIECBAgCHSyBUwQIECBAgQakCBASQqv_____________-6FAgQIECAIdLIECJygQIECBAgaoEBJBg______________5-OiBAgQIAh0sgQKGKBAgQIEHBKgJIMH7____8v__________QoECBAgCHSyBRmQIECBA4RoECAkgVoVaNel________r16FAgQIECAIdLINCFAgwOEyBAgQICSBAgQePn7___r06RAgQIECBAgQIAh0sgQLeKxCgQIECBAgJIECDR__v0aNGhQIECBAgQIECBAgCHSSBAgQIECBAgQIECBAgQYP3_-1QIECBAgQIECBAgQIECAIdJIECBAgQIECBAgQIECBB6boUSBAgQIECBAgQIECBAgQIAh0kgQIECBAgQIECBAgQIFStAgQIECBAgQIECBAgQIECBAgAzsvjognZe_MFIy4cmzTuy8wdTfwQU-G_l0DVKy-lhyad6A";
const SPLASH = "QIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECAsaMIEGDx8YIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQICxowg0N2bdmgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgLGjCBFvz9_6BAZQIECBAgQIECAig0NECBAgQIECBAgQIECAsaMcOD5tjyoGCBAgQIECBAgQICLhCgQIECBAgQIECBAgQICxowoTod79ArSEcHBAgQIECBAg0ITKBAgQcGCBAgQIECBAgLGjCBBgXIUCAyRXmlLBAgQIECBuZ4fPn___aoECBAgQIECBAaQIECBAgQIEBFAgQaTPDh8-f___-vXo9f9qgQIECBAgQIECBAgQIEBFAgQcOHz5____69ejRoECBAg__0CBAgQIECBAgQIECBAgQEUCL___r16NGXQIOHDh8-NCOD-3QIECBAgQIECBAgQIECBARQINf0ug-fPi9evRo0aBAgI6v6VAgQIECBAgQIECBAgQIEBFAgRf2hfBw4cOHD58-fPiAj-_oECBAgQIECBAgQIECBAgQEUCBBr-l0SNGjRo0CBAgQEcH9qgQIECBAgQIECBAgQIECBARQIECL-0Lr169ev-fPnxAR1f0KBAgQIECBAgQIAiBAgQIEBFAgQINf3hw4cOCBAgQIEBH-_QIECBAgQIECBAgCIECBAgQIEB1ARRL1-_____________7VAgOIECBAgQIECAIgQIECBAgQHUBNAgQf26BAgQIN_8ijRoECA4gQIECBAgQIAiBAgQIECA6gQE0CDV_QoECBAgRf2iBAgQIEBxAgQIECBAgCIECBAgQIDqBAgQE0aFAgQIECBAgQIECBAgQHECBAgQIECAIgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIBp0Kg3cNqDSggdMuPRh3ZOe_N074eWVf0y7MvTL46IECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQKMalAyYMmyClvxIJGHlk8oECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECA";
const testpages = {
  ENGINEERING,
  ADVERT,
  UK,
  SPLASH
};
const NS = "http://www.w3.org/2000/svg";
let clipPathId = 0;
let _window;
let _doc;
class Element {
  constructor() {
  }
  _node() {
    return this._e;
  }
  _removeNode() {
    this._e = null;
  }
  attr_(objOrName, val) {
    if (typeof objOrName == "object") {
      for (const attrName in objOrName) {
        if (objOrName[attrName] == null)
          this._e.removeAttribute(attrName);
        else
          this._e.setAttribute(attrName, objOrName[attrName]);
      }
    } else {
      if (typeof val == "undefined")
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
      this._e.setAttribute("class", classes.join(" "));
    }
    return this;
  }
  hasClass_(name) {
    return this.classes_().indexOf(name) !== -1;
  }
  classes_() {
    const classes = this._e.getAttribute("class");
    return classes == null ? [] : classes.split(" ");
  }
  removeClass_(name) {
    if (this.hasClass_(name))
      this._e.setAttribute("class", this.classes_().filter((c) => c !== name).join(" "));
    return this;
  }
  toggleClass_(name) {
    if (this.hasClass_(name))
      this.removeClass_(name);
    else
      this.addClass_(name);
    return this;
  }
  data_(objOrName, val) {
    if (typeof objOrName == "object") {
      for (const dataProp in objOrName) {
        if (objOrName[dataProp] == null)
          delete this._e.dataset[dataProp];
        else
          this._e.dataset[dataProp] = objOrName[dataProp];
      }
    } else {
      if (typeof val == "undefined")
        return this._e.dataset[objOrName];
      else if (val == null)
        delete this._e.dataset[objOrName];
      else
        this._e.dataset[objOrName] = val;
    }
    return this;
  }
}
class SVG extends Element {
  constructor(windowDom) {
    super();
    _window = windowDom;
    _doc = _window.document;
    this._e = _doc.createElementNS(NS, "svg");
    this._e.setAttribute("xmlns", NS);
    return this;
  }
  addTo_(selector) {
    const node = _doc.querySelector(selector);
    if (node) {
      node.appendChild(this._e);
    } else {
      throw new Error("@techandsoftware/teletext: E117: addTo failed to match provided selector");
    }
    return this;
  }
  viewbox_(viewbox) {
    this._e.setAttribute("viewBox", viewbox);
    return this;
  }
  size_(width, height) {
    this._e.setAttribute("width", width);
    this._e.setAttribute("height", height);
    return this;
  }
  style_(style) {
    const styleNode = _doc.createElementNS(NS, "style");
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
    this._e = _doc.createElementNS(NS, "g");
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
    this._e.setAttribute("clip-path", `url("#${clipPath._node().id}")`);
    return this;
  }
  unclip_() {
    this._e.removeAttribute("clip-path");
    return this;
  }
  remove_() {
    this._e.parentNode && this._e.parentNode.removeChild(this._e);
    this._e = null;
    this._c.forEach((c) => c._removeNode());
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
    this._e = _doc.createElementNS(NS, "svg");
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
    this._e = _doc.createElementNS(NS, "image");
    this._e.setAttribute("width", parseInt(width));
    this._e.setAttribute("height", parseInt(height));
    return this;
  }
  attr(...params) {
    return this.attr_(...params);
  }
}
class Use extends Element {
  constructor(id) {
    super();
    this._e = _doc.createElementNS(NS, "use");
    this._e.setAttribute("href", `#${id}`);
    return this;
  }
  fill_(fill) {
    this._e.setAttribute("fill", fill);
    return this;
  }
  move_(x, y) {
    this._e.setAttribute("x", x);
    this._e.setAttribute("y", y);
    return this;
  }
}
class SVGSymbol extends Element {
  constructor(id) {
    super();
    this._e = _doc.createElementNS(NS, "symbol");
    this._e.setAttribute("id", id);
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
    this._e = _doc.createElementNS(NS, "text");
    this._e.append(text);
    return this;
  }
  plain_(text) {
    this._e.textContent = text;
    return this;
  }
  fill_(fill) {
    this._e.setAttribute("fill", fill);
    return this;
  }
}
class Defs extends Element {
  constructor() {
    super();
    this._e = _doc.createElementNS(NS, "defs");
    return this;
  }
  clip_() {
    const clip = new ClipPath();
    this._e.append(clip._node());
    return clip;
  }
  find_(selector) {
    const matchedEls = this._e.querySelectorAll(selector);
    return [...matchedEls].map(wrapSVGElement);
  }
  rect_(width, height) {
    const rect = new Rect(width, height);
    this._e.append(rect._node());
    return rect;
  }
}
class ClipPath extends Element {
  constructor() {
    super();
    this._e = _doc.createElementNS(NS, "clipPath");
    this._e.setAttribute("id", `clipPath-${clipPathId}`);
    clipPathId++;
    return this;
  }
  children_() {
    return [...this._e.children].map(wrapSVGElement);
  }
  add_(shape) {
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
    this._e = _doc.createElementNS(NS, "rect");
    this._e.setAttribute("width", parseInt(width));
    this._e.setAttribute("height", parseInt(height));
    return this;
  }
  fill_(fill) {
    this._e.setAttribute("fill", fill);
    return this;
  }
  move_(x, y) {
    this._e.setAttribute("x", x);
    this._e.setAttribute("y", y);
    return this;
  }
  width_(width) {
    if (width === void 0)
      return parseInt(this._e.getAttribute("width"));
    this._e.setAttribute("width", parseInt(width));
    return this;
  }
  height_(height) {
    if (height === void 0)
      return parseInt(this._e.getAttribute("height"));
    this._e.setAttribute("height", parseInt(height));
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
    this._e = _doc.createElementNS(NS, "line");
    this._e.setAttribute("x1", x1);
    this._e.setAttribute("y1", y1);
    this._e.setAttribute("x2", x2);
    this._e.setAttribute("y2", y2);
    return this;
  }
}
function wrapSVGElement(el) {
  let wrappedEl;
  switch (el.tagName) {
    case "rect":
      wrappedEl = new Rect(el);
      break;
    default:
      throw new Error("SVG:wrapSVGElement Unable to wrap SVG element " + el.tagName);
  }
  return wrappedEl;
}
const Colour = {
  BLACK: /* @__PURE__ */ Symbol("BLACK"),
  RED: /* @__PURE__ */ Symbol("RED"),
  GREEN: /* @__PURE__ */ Symbol("GREEN"),
  YELLOW: /* @__PURE__ */ Symbol("YELLOW"),
  BLUE: /* @__PURE__ */ Symbol("BLUE"),
  MAGENTA: /* @__PURE__ */ Symbol("MAGENTA"),
  CYAN: /* @__PURE__ */ Symbol("CYAN"),
  WHITE: /* @__PURE__ */ Symbol("WHITE")
};
Object.freeze(Colour);
const CellType = {
  ALPHA_: /* @__PURE__ */ Symbol("ALPHA"),
  MOSAIC_CONTIGUOUS_: /* @__PURE__ */ Symbol("MOSAIC_CONTIGUOUS"),
  MOSAIC_SEPARATED_: /* @__PURE__ */ Symbol("MOSAIC_SEPARATED"),
  G3_: /* @__PURE__ */ Symbol("G3")
};
Object.freeze(CellType);
const CellSize = {
  NORMAL_SIZE_: /* @__PURE__ */ Symbol("NORMAL_SIZE"),
  DOUBLE_HEIGHT_: /* @__PURE__ */ Symbol("DOUBLE_HEIGHT"),
  DOUBLE_WIDTH_: /* @__PURE__ */ Symbol("DOUBLE_WIDTH"),
  DOUBLE_SIZE_: /* @__PURE__ */ Symbol("DOUBLE_SIZE")
};
Object.freeze(CellSize);
const Level = {
  0: /* @__PURE__ */ Symbol("0"),
  // 7 colour text and contiguous graphics, flashing
  1: /* @__PURE__ */ Symbol("1"),
  // + background colours, separated graphics, conceal, box, double height
  1.5: /* @__PURE__ */ Symbol("1.5"),
  // + black text/graphics
  2.5: /* @__PURE__ */ Symbol("2.5")
  // + double width, double size
};
Object.freeze(Level);
class Attributes {
  static charFromTextColour(colour) {
    if (colour in textColourToChar) return textColourToChar[colour];
    throw new Error("Attributes.charFromTextColour: bad colour: " + colour);
  }
  static charFromGraphicColour(colour) {
    if (colour in graphicColourToChar) return graphicColourToChar[colour];
    throw new Error("Attributes.charFromGraphicColour: bad colour");
  }
  static charFromAttribute(attrib) {
    if (attrib in spacingAttributesToChar) return spacingAttributesToChar[attrib];
    throw new Error("Attributes.charFromAttribute: bad attribute");
  }
}
Object.assign(Attributes, {
  TEXT_COLOUR: CellType.ALPHA,
  MOSAIC_COLOUR: /* @__PURE__ */ Symbol("MOSAIC_COLOUR"),
  NEW_BACKGROUND: /* @__PURE__ */ Symbol("NEW_BACKGROUND"),
  BLACK_BACKGROUND: /* @__PURE__ */ Symbol("BLACK_BACKGROUND"),
  CONTIGUOUS_GRAPHICS: CellType.MOSAIC_CONTIGUOUS_,
  SEPARATED_GRAPHICS: CellType.MOSAIC_SEPARATED_,
  ESC: /* @__PURE__ */ Symbol("ESC"),
  FLASH: /* @__PURE__ */ Symbol("FLASH"),
  STEADY: /* @__PURE__ */ Symbol("STEADY"),
  NORMAL_SIZE: CellSize.NORMAL_SIZE_,
  DOUBLE_HEIGHT: CellSize.DOUBLE_HEIGHT_,
  DOUBLE_WIDTH: CellSize.DOUBLE_WIDTH_,
  DOUBLE_SIZE: CellSize.DOUBLE_SIZE_,
  CONCEAL: /* @__PURE__ */ Symbol("CONCEAL"),
  HOLD_MOSAICS: /* @__PURE__ */ Symbol("HOLD_MOSAICS"),
  RELEASE_MOSAICS: /* @__PURE__ */ Symbol("RELEASE_MOSAICS"),
  START_BOX: /* @__PURE__ */ Symbol("START_BOX"),
  END_BOX: /* @__PURE__ */ Symbol("END_BOX"),
  UNKNOWN_: /* @__PURE__ */ Symbol("UNKNOWN")
  // pseudo-attribute
});
function attribFromChar(level, char) {
  let attribute = null;
  let colour = null;
  if (char in attributeChars && charCodesByLevel[level].includes(char.charCodeAt(0))) {
    if (char in charToTextColour) {
      attribute = Attributes.TEXT_COLOUR;
      colour = attributeChars[char];
    } else if (char in charToGraphicColour) {
      attribute = Attributes.MOSAIC_COLOUR;
      colour = attributeChars[char];
    } else
      attribute = attributeChars[char];
  } else if (char.charCodeAt(0) <= 31)
    attribute = Attributes.UNKNOWN_;
  return {
    attribute_: attribute,
    colour_: colour
  };
}
function fillColourFromColourAttrib(colour) {
  return colourAttribToFillColour[colour];
}
const colourAttribToFillColour = {
  [Colour.BLACK]: "#000",
  [Colour.RED]: "#f00",
  [Colour.GREEN]: "#0f0",
  [Colour.YELLOW]: "#ff0",
  [Colour.BLUE]: "#00f",
  [Colour.MAGENTA]: "#f0f",
  [Colour.CYAN]: "#0ff",
  [Colour.WHITE]: "#fff"
};
Object.freeze(colourAttribToFillColour);
const charToTextColour = {
  "\0": Colour.BLACK,
  "": Colour.RED,
  "": Colour.GREEN,
  "": Colour.YELLOW,
  "": Colour.BLUE,
  "": Colour.MAGENTA,
  "": Colour.CYAN,
  "\x07": Colour.WHITE
};
Object.freeze(charToTextColour);
const textColourToChar = createReverseLookup(charToTextColour);
const charToGraphicColour = {
  "": Colour.BLACK,
  "": Colour.RED,
  "": Colour.GREEN,
  "": Colour.YELLOW,
  "": Colour.BLUE,
  "": Colour.MAGENTA,
  "": Colour.CYAN,
  "": Colour.WHITE
};
Object.freeze(charToGraphicColour);
const graphicColourToChar = createReverseLookup(charToGraphicColour);
const attributeChars = {
  "\b": Attributes.FLASH,
  "	": Attributes.STEADY,
  "\n": Attributes.END_BOX,
  "\v": Attributes.START_BOX,
  "\f": Attributes.NORMAL_SIZE,
  "\r": Attributes.DOUBLE_HEIGHT,
  "": Attributes.DOUBLE_WIDTH,
  "": Attributes.DOUBLE_SIZE,
  "": Attributes.CONCEAL,
  "": Attributes.CONTIGUOUS_GRAPHICS,
  "": Attributes.SEPARATED_GRAPHICS,
  "\x1B": Attributes.ESC,
  "": Attributes.BLACK_BACKGROUND,
  "": Attributes.NEW_BACKGROUND,
  "": Attributes.HOLD_MOSAICS,
  "": Attributes.RELEASE_MOSAICS
};
Object.assign(attributeChars, charToTextColour);
Object.assign(attributeChars, charToGraphicColour);
Object.freeze(attributeChars);
const spacingAttributesToChar = createReverseLookup(attributeChars);
const charCodesByLevel = {
  [Level[0]]: [
    // pre-release level
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    // text colours
    8,
    9,
    // flash/steady
    17,
    18,
    19,
    20,
    21,
    22,
    23
    // graphic colours
  ]
};
charCodesByLevel[Level[1]] = [
  ...charCodesByLevel[Level[0]],
  10,
  11,
  // start/end boxed
  12,
  13,
  // normal or double height
  24,
  // conceal
  25,
  26,
  // contiguous/separated graphics
  27,
  // esc (g0 set switching)
  28,
  29,
  // black background, new background
  30,
  31
  // hold/release mosaics
];
charCodesByLevel[Level[1.5]] = [...charCodesByLevel[Level[1]], 0, 16];
charCodesByLevel[Level[2.5]] = [...charCodesByLevel[Level[1.5]], 14, 15];
Object.freeze(charCodesByLevel);
function createReverseLookup(input) {
  const reverseLookup = {};
  for (const key in input) {
    reverseLookup[input[key]] = key;
  }
  return Object.freeze(reverseLookup);
}
const WIDTH_PX = 400;
const HEIGHT_PX = 250;
const COLS = 40;
const ROWS$1 = 25;
const SCREEN_SCALE = 1.5;
const ASPECT_RATIO_VERTICAL_SCALE = {
  1.33: WIDTH_PX / (1.33 * HEIGHT_PX),
  1.2: WIDTH_PX / (1.2 * HEIGHT_PX),
  1.22: WIDTH_PX / (1.22 * HEIGHT_PX)
};
const DEFAULT_ASPECT_RATIO = 1.2;
const CELL_HEIGHT = HEIGHT_PX / ROWS$1;
const CELL_WIDTH = WIDTH_PX / COLS;
const CELL_DOUBLE_HEIGHT = CELL_HEIGHT * 2;
const CELL_DOUBLE_WIDTH = CELL_WIDTH * 2;
const TEXT_X_OFFSET = CELL_WIDTH / 2;
const TEXT_Y_OFFSET = CELL_HEIGHT * (4 / 5);
const MOSAIC_METRIC = {
  _contiguous: {
    _textLength: CELL_WIDTH + 0.4,
    _DX: 0 - TEXT_X_OFFSET - 0.2
  },
  _separated: {
    _textLength: CELL_WIDTH,
    _DX: 0 - TEXT_X_OFFSET + 0.5
  }
};
Object.freeze(MOSAIC_METRIC);
class VectorViewBase {
  constructor(model, dom) {
    this._svg = new SVG(dom).viewbox_(`0 0 ${WIDTH_PX} ${HEIGHT_PX}`).size_(WIDTH_PX * SCREEN_SCALE, HEIGHT_PX * SCREEN_SCALE * ASPECT_RATIO_VERTICAL_SCALE[DEFAULT_ASPECT_RATIO]).attr_({
      "preserveAspectRatio": "none",
      "style": "font-family: sans-serif"
    }).style_(getStyle());
    this.d = this._svg.group_().attr_("class", "conceal_concealed flash_flashing");
    this._aspectRatio = DEFAULT_ASPECT_RATIO;
    this._createDisplay();
    this._createBoxModeClip();
    this._gridLayer = null;
    this._model = model;
    this._listenerId = this._model.onSet_.attach_(
      () => this._update()
    );
    this._boxMode = false;
    this._mixMode = false;
    this._pageContainsBox = false;
    this._plugins = {};
    console.debug("VectorViewBase constructed");
  }
  addTo_(selector) {
    this._svg.addTo_(selector);
  }
  detach_() {
    this._model.onSet_.detach_(this._listenerId);
    this._listenerId = null;
  }
  _update() {
    console.debug("## View._update");
    let nextRowHidden = false;
    let pageContainsFlash = false;
    this._pageContainsBox = false;
    this.d.removeClass_("flash_flashing");
    this._gridrows.forEach((rowView, rowIndex) => {
      let nextCellObscured = false;
      this._resetRow(rowIndex);
      if (nextRowHidden) {
        nextRowHidden = false;
        this._clearRowCells(rowView, rowIndex);
        return;
      }
      const rowModel = this._model.getRow_(rowIndex);
      let previousBg, previousBoxed;
      rowView.forEach((cellView, cellIndex) => {
        if (nextCellObscured) {
          nextCellObscured = false;
          this._clearCell(cellView);
          this._extendBackgroundForRow(rowIndex);
          if (previousBoxed) this._extendBox();
          return;
        }
        const cell = rowModel.getCell_(cellIndex);
        const bg = fillColourFromColourAttrib(cell.bgColour_);
        const isMosaicByte = cell.isMosaicCell_();
        const fill = fillColourFromColourAttrib(cell.fgColour_);
        const attr = this._getCellAttr(cell.type_, isMosaicByte, cell.isCursive_);
        this._renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaicByte);
        if (cell.boxed_) {
          if (previousBoxed) this._extendBox();
          else this._setBoxForRow(rowIndex, cellIndex);
          this._pageContainsBox = true;
        }
        if (previousBg == bg) this._extendBackgroundForRow(rowIndex);
        else this._setBackgroundForRow(rowIndex, cellIndex, bg);
        if (cell.size_ == CellSize.DOUBLE_WIDTH_ || cell.size_ == CellSize.DOUBLE_SIZE_) nextCellObscured = true;
        previousBg = bg;
        previousBoxed = cell.boxed_;
        if (cell.flashing_) pageContainsFlash = true;
      });
      if (rowModel.doubleHeight_) {
        this._setRowDoubleHeight(rowIndex);
        this._setBoxDoubleHeight();
        nextRowHidden = true;
      } else {
        nextRowHidden = false;
      }
      this._makeClipFromBoxesForRow(rowIndex);
    });
    if ("_endOfUpdate" in this._plugins) this._plugins._endOfUpdate(this._svg.width_(), this._svg.height_());
    this.d.addClass_("conceal_concealed");
    if (pageContainsFlash) setTimeout(() => this.d.addClass_("flash_flashing"), 100);
    this._refreshMixMode();
  }
  _resetRow(rowIndex) {
    this._resetBackgroundForRow(rowIndex);
    this._resetBoxClipForRow(rowIndex);
  }
  _clearRowCells(rowView, rowNum) {
    if ("_clearCellsForRow" in this._plugins)
      this._plugins._clearCellsForRow(rowView.length, rowNum);
    rowView.forEach((cellView) => this._clearCell(cellView));
  }
  _clearCell(cellView) {
    cellView.plain_(" ").attr_({
      dx: null,
      dy: null,
      textLength: null,
      lengthAdjust: null,
      "text-anchor": null,
      transform: null,
      class: null
    });
  }
  _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
    this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);
    if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_ && isMosaic || cell.type_ == CellType.G3_) cellView.addClass_("mosaic");
    else if (cell.type_ == CellType.MOSAIC_SEPARATED_ && isMosaic) cellView.addClass_("mosaic_separated");
  }
  _renderText(cellView, cell, attr, fill, cellIndex, rowIndex) {
    cellView.plain_(cell.char_).attr_(attr).fill_(fill);
    if (cell.size_ == CellSize.DOUBLE_HEIGHT_)
      cellView.attr_("transform", `translate(0 ${_getYTranslate(rowIndex)}) scale(1 2)`);
    else if (cell.size_ == CellSize.DOUBLE_WIDTH_)
      cellView.attr_("transform", `translate(${_getXTranslate(cellIndex)} 0) scale(2 1)`);
    else if (cell.size_ == CellSize.DOUBLE_SIZE_)
      cellView.attr_("transform", `translate(${_getXTranslate(cellIndex)} ${_getYTranslate(rowIndex)}) scale(2 2)`);
    if (cell.flashing_) cellView.addClass_("flash");
    if (cell.concealed_) cellView.addClass_("conceal");
  }
  reveal_() {
    this.d.toggleClass_("conceal_concealed");
  }
  setFont_(font) {
    let newFont = font;
    if (font == "native")
      newFont = '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif';
    else if (font == "default")
      newFont = "sans-serif";
    this._svg.attr_("style", `font-family: ${newFont}`);
  }
  grid_() {
    if (this._gridLayer) {
      this._gridLayer.remove_();
      this._gridLayer = null;
    } else {
      this._drawGrid();
    }
  }
  mixMode_() {
    if (this._mixMode) {
      this._mixMode = false;
      this._bgLayer.attr_("opacity", null).unclip_();
    } else {
      this._mixMode = true;
      this._setMixMode();
    }
  }
  setAspectRatio_(aspectRatio) {
    this._aspectRatio = aspectRatio;
    this.setHeight_(this._svg.height_());
  }
  setHeight_(height) {
    const width = this._aspectRatio == "natural" ? height * (WIDTH_PX / HEIGHT_PX) : height * this._aspectRatio;
    this._svg.size_(width, height);
  }
  _setMixMode() {
    if (this._boxMode && this._pageContainsBox)
      this._bgLayer.attr_("opacity", 0.3);
    else if (this._pageContainsBox)
      this._bgLayer.clipWith_(this._boxLayer).attr_("opacity", 0.3);
    else
      this._bgLayer.attr_("opacity", 0);
  }
  _refreshMixMode() {
    if (this._mixMode) this._setMixMode();
  }
  boxMode_() {
    if (!this._boxMode) {
      this.d.clipWith_(this._boxLayer);
      this._boxMode = true;
      console.log("box activated");
    } else {
      this.d.unclip_();
      this._boxMode = false;
      console.log("box deactivated");
    }
    this._refreshMixMode();
  }
  getStaticScreen_() {
    return this._svg._node().outerHTML;
  }
  _drawGrid() {
    this._gridLayer = this.d.group_();
    for (let row = 0; row < ROWS$1; row++) {
      this._gridLayer.line_(0, row * CELL_HEIGHT, WIDTH_PX - 1, row * CELL_HEIGHT).attr_({
        stroke: "#555",
        "stroke-width": 0.5
      });
    }
    for (let col = 0; col < COLS; col++) {
      this._gridLayer.line_(col * CELL_WIDTH, 0, col * CELL_WIDTH, HEIGHT_PX - 1).attr_({
        stroke: "#555",
        "stroke-width": 0.5
      });
    }
  }
  _createBoxModeClip() {
    this._defs = this.d.defs_();
    this._lastBoxBuffer = null;
    this._boxLayer = this._defs.clip_();
  }
  _createDisplay() {
    this._createRowBackgrounds();
    this._createCells();
  }
  _createRowBackgrounds() {
    const bgrows = [];
    const bgGroup = this.d.group_();
    bgGroup.attr_({
      "shape-rendering": "crispEdges",
      id: "background"
    });
    this._bgrows = bgrows;
    this._bgLayer = bgGroup;
  }
  _createCells() {
    const gridrows = [];
    const textGroup = this.d.group_().attr_({
      "text-anchor": "middle",
      "fill": "#fff"
    }).attr_("id", "textlayer");
    for (let rowNum = 0; rowNum < ROWS$1; rowNum++) {
      const rowCells = [];
      for (let colNum = 0; colNum < COLS; colNum++) {
        rowCells.push(textGroup.plain_(getRandomLetter()).attr_({
          x: colNum * CELL_WIDTH + TEXT_X_OFFSET,
          y: rowNum * CELL_HEIGHT + TEXT_Y_OFFSET
        }));
      }
      gridrows.push(rowCells);
    }
    this._gridrows = gridrows;
    this._textLayer = textGroup;
  }
  _resetBoxClipForRow(rowNum) {
    this._boxLayer.children_().filter((b) => b.data_("r") == rowNum).forEach((b) => b.remove_());
  }
  _resetBackgroundForRow(rowNum) {
    if (this._bgrows[rowNum]) {
      this._bgrows[rowNum].remove_();
      this._bgrows[rowNum] = null;
    }
    this._bgrows[rowNum] = this._bgLayer.group_();
  }
  _extendBackgroundForRow(rowNum) {
    const last = this._bgrows[rowNum].last_();
    const width = last.width_();
    last.width_(width + CELL_WIDTH);
  }
  _setBackgroundForRow(rowNum, colNum, colour) {
    const x = colNum * CELL_WIDTH;
    const y = rowNum * CELL_HEIGHT;
    this._bgrows[rowNum].rect_(CELL_WIDTH, CELL_HEIGHT).fill_(colour).move_(x, y);
  }
  _extendBox() {
    const width = this._lastBoxBuffer.width_();
    this._lastBoxBuffer.width_(width + CELL_WIDTH);
  }
  _setRowDoubleHeight(rowNum) {
    this._bgrows[rowNum].children_().forEach((bg) => bg.attr_("height", CELL_DOUBLE_HEIGHT));
  }
  _setBoxDoubleHeight() {
    this._defs.find_("[data-boxbuffer]").forEach((box) => box.height_(CELL_DOUBLE_HEIGHT));
  }
  _setBoxForRow(rowNum, colNum) {
    const x = colNum * CELL_WIDTH;
    const y = rowNum * CELL_HEIGHT;
    this._lastBoxBuffer = this._defs.rect_(CELL_WIDTH, CELL_HEIGHT).data_("boxbuffer", true).move_(x, y);
  }
  // FUDGE move boxes tagged with data-boxbuffer into the clip layer.
  _makeClipFromBoxesForRow(rowNum) {
    this._defs.find_("[data-boxbuffer]").forEach((box) => {
      box.data_({
        r: rowNum,
        boxbuffer: null
      });
      this._boxLayer.add_(box);
    });
  }
  _getCellAttr(cellType, isMosaicChar, isCursive) {
    if (cellType == CellType.MOSAIC_CONTIGUOUS_ && isMosaicChar || cellType == CellType.G3_) {
      return {
        dx: MOSAIC_METRIC._contiguous._DX,
        dy: -0.15,
        textLength: MOSAIC_METRIC._contiguous._textLength,
        lengthAdjust: "spacingAndGlyphs",
        "text-anchor": "start",
        transform: null,
        class: null
      };
    } else if (cellType == CellType.MOSAIC_SEPARATED_ && isMosaicChar) {
      return {
        dx: MOSAIC_METRIC._separated._DX,
        dy: null,
        textLength: MOSAIC_METRIC._separated._textLength,
        lengthAdjust: "spacingAndGlyphs",
        "text-anchor": "start",
        transform: null,
        class: null
      };
    }
    return {
      dx: null,
      dy: null,
      textLength: isCursive ? CELL_WIDTH : null,
      lengthAdjust: isCursive ? "spacingAndGlyphs" : null,
      "text-anchor": null,
      transform: null,
      class: null
    };
  }
  registerPlugin(name, methods) {
    if ("renderBackground" in methods)
      this._plugins._background = methods.renderBackground;
    if ("renderMosaic" in methods)
      this._plugins._mosaic = methods.renderMosaic;
    if ("endOfPageUpdate" in methods)
      this._plugins._endOfUpdate = methods.endOfPageUpdate;
    if ("clearCellsForRow" in methods)
      this._plugins._clearCellsForRow = methods.clearCellsForRow;
    return {
      lookupColour: colourLookupFn,
      isDoubleHeight: isDoubleHeightFn,
      isDoubleWidth: isDoubleWidthFn,
      isDoubleSize: isDoubleSizeFn,
      isSeparatedMosaic: isSeparatedMosaicFn,
      createImageOverlay: this._createImageOverlay.bind(this),
      createSVGOverlay: this._createSVGOverlay.bind(this)
    };
  }
  _createImageOverlay() {
    const image = this.d.image_(WIDTH_PX, HEIGHT_PX);
    image.attr_("preserveAspectRatio", "none");
    return image;
  }
  _createSVGOverlay() {
    const svg = this.d.svg_();
    svg.attr_("preserveAspectRatio", "none");
    return svg;
  }
}
VectorViewBase._CELL_WIDTH = CELL_WIDTH;
VectorViewBase._CELL_HEIGHT = CELL_HEIGHT;
VectorViewBase._CELL_DOUBLE_WIDTH = CELL_DOUBLE_WIDTH;
VectorViewBase._CELL_DOUBLE_HEIGHT = CELL_DOUBLE_HEIGHT;
VectorViewBase._WIDTH_PX = WIDTH_PX;
VectorViewBase._HEIGHT_PX = HEIGHT_PX;
VectorViewBase._MOSAIC_METRIC = MOSAIC_METRIC;
VectorViewBase.ROWS = ROWS$1;
VectorViewBase.COLS = COLS;
const colourLookupFn = (colourSymbol) => fillColourFromColourAttrib(colourSymbol);
const isDoubleHeightFn = (size) => size == CellSize.DOUBLE_HEIGHT_;
const isDoubleWidthFn = (size) => size == CellSize.DOUBLE_WIDTH_;
const isDoubleSizeFn = (size) => size == CellSize.DOUBLE_SIZE_;
const isSeparatedMosaicFn = (type) => type == CellType.MOSAIC_SEPARATED_;
const _getYTranslate = (row) => 0 - row * CELL_HEIGHT;
const _getXTranslate = (col) => 0 - col * CELL_WIDTH;
function getRandomLetter() {
  return String.fromCharCode(32 + Math.random() * 95);
}
function getStyle() {
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
from {
filter: none;
opacity: 0.7;
}
33% {
filter: none;
opacity: 1;
}
66% {
filter: blur(0px);
opacity: 1;
}
95% {
filter: blur(4px);
opacity: 0;
}
to {
filter: blur(0px);
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
const g0_latin = { "$": "¤", "": "■" };
const g0_latin__czech_slovak = { "#": "#", "$": "ů", "@": "č", "[": "ť", "\\": "ž", "]": "ý", "^": "í", "_": "ř", "`": "é", "{": "á", "|": "|", "}": "ú", "~": "š" };
const g0_latin__english = { "#": "£", "$": "$", "@": "@", "[": "←", "\\": "½", "]": "→", "^": "↑", "_": "#", "`": "—", "{": "¼", "|": "‖", "}": "¾", "~": "÷" };
const g0_latin__estonian = { "#": "#", "$": "õ", "@": "Š", "[": "Ä", "\\": "Ö", "]": "Ž", "^": "Ü", "_": "Õ", "`": "š", "{": "ä", "|": "ö", "}": "ž", "~": "ü" };
const g0_latin__french = { "#": "é", "$": "ï", "@": "à", "[": "ë", "\\": "ê", "]": "ù", "^": "î", "_": "#", "`": "è", "{": "â", "|": "ô", "}": "û", "~": "ç" };
const g0_latin__german = { "#": "#", "$": "$", "@": "§", "[": "Ä", "\\": "Ö", "]": "Ü", "^": "^", "_": "_", "`": "°", "{": "ä", "|": "ö", "}": "ü", "~": "ß" };
const g0_latin__italian = { "#": "£", "$": "$", "@": "é", "[": "°", "\\": "ç", "]": "→", "^": "↑", "_": "#", "`": "ù", "{": "à", "|": "ò", "}": "è", "~": "ì" };
const g0_latin__latvian_lithuanian = { "#": "#", "$": "$", "@": "Š", "[": "ė", "\\": "ę", "]": "Ž", "^": "č", "_": "ū", "`": "š", "{": "ą", "|": "ų", "}": "ž", "~": "į" };
const g0_latin__polish = { "#": "#", "$": "ń", "@": "ą", "[": "Ƶ", "\\": "Ś", "]": "Ł", "^": "ć", "_": "ó", "`": "ę", "{": "ż", "|": "ś", "}": "ł", "~": "ź" };
const g0_latin__portuguese_spanish = { "#": "ç", "$": "$", "@": "¡", "[": "á", "\\": "é", "]": "í", "^": "ó", "_": "ú", "`": "¿", "{": "ü", "|": "ñ", "}": "è", "~": "à" };
const g0_latin__romanian = { "#": "#", "$": "¤", "@": "Ț", "[": "Â", "\\": "Ș", "]": "Ă", "^": "Î", "_": "ı", "`": "ț", "{": "â", "|": "ș", "}": "ă", "~": "î" };
const g0_latin__serbian_croatian_slovenian = { "#": "#", "$": "Ë", "@": "Č", "[": "Ć", "\\": "Ž", "]": "Đ", "^": "Š", "_": "ë", "`": "č", "{": "ć", "|": "ž", "}": "đ", "~": "š" };
const g0_latin__swedish_finnish_hungarian = { "#": "#", "$": "¤", "@": "É", "[": "Ä", "\\": "Ö", "]": "Å", "^": "Ü", "_": "_", "`": "é", "{": "ä", "|": "ö", "}": "å", "~": "ü" };
const g0_latin__turkish = { "#": "₺", "$": "ğ", "@": "İ", "[": "Ş", "\\": "Ö", "]": "Ç", "^": "Ü", "_": "Ğ", "`": "ı", "{": "ş", "|": "ö", "}": "ç", "~": "ü" };
const g2_latin = { "0": "°", "1": "±", "2": "²", "3": "³", "4": "×", "5": "µ", "6": "¶", "7": "·", "8": "÷", "9": "’", "!": "¡", '"': "¢", "#": "£", "%": "¥", "&": "#", "'": "§", "(": "¤", ")": "‘", "*": "“", "+": "«", ",": "←", "-": "↑", ".": "→", "/": "↓", ":": "”", ";": "»", "<": "¼", "=": "½", ">": "¾", "?": "¿", "@": " ", "A": "̀", "B": "́", "C": "̂", "D": "̃", "E": "̄", "F": "̆", "G": "̇", "H": "̈", "I": "̣", "J": "̊", "K": "̧", "L": "̲", "M": "̋", "N": "̨", "O": "̌", "P": "—", "Q": "¹", "R": "®", "S": "©", "T": "™", "U": "♪", "V": "₠", "W": "‰", "X": "α", "Y": null, "Z": null, "[": null, "\\": "⅛", "]": "⅜", "^": "⅝", "_": "⅞", "`": "Ω", "a": "Æ", "b": "Ð", "c": "ª", "d": "Ħ", "e": null, "f": "Ĳ", "g": "Ŀ", "h": "Ł", "i": "Ø", "j": "Œ", "k": "º", "l": "Þ", "m": "Ŧ", "n": "Ŋ", "o": "ŉ", "p": "ĸ", "q": "æ", "r": "đ", "s": "ð", "t": "ħ", "u": "ı", "v": "ĳ", "w": "ŀ", "x": "ł", "y": "ø", "z": "œ", "{": "ß", "|": "þ", "}": "ŧ", "~": "ŋ", "": "■" };
const g0_greek = { "<": "«", ">": "»", "@": "ΐ", "A": "Α", "B": "Β", "C": "Γ", "D": "Δ", "E": "Ε", "F": "Ζ", "G": "Η", "H": "Θ", "I": "Ι", "J": "Κ", "K": "Λ", "L": "Μ", "M": "Ν", "N": "Ξ", "O": "Ο", "P": "Π", "Q": "Ρ", "R": "ʹ", "S": "Σ", "T": "Τ", "U": "Υ", "V": "Φ", "W": "Χ", "X": "Ψ", "Y": "Ω", "Z": "Ϊ", "[": "Ϋ", "\\": "ά", "]": "έ", "^": "ή", "_": "ί", "`": "ΰ", "a": "α", "b": "β", "c": "γ", "d": "δ", "e": "ε", "f": "ζ", "g": "η", "h": "θ", "i": "ι", "j": "κ", "k": "λ", "l": "μ", "m": "ν", "n": "ξ", "o": "ο", "p": "π", "q": "ρ", "r": "ς", "s": "σ", "t": "τ", "u": "υ", "v": "φ", "w": "χ", "x": "ψ", "y": "ω", "z": "ϊ", "{": "ϋ", "|": "ό", "}": "ύ", "~": "ώ", "": "■" };
const g2_greek = { "0": "°", "1": "±", "2": "²", "3": "³", "4": "×", "5": "m", "6": "n", "7": "p", "8": "÷", "9": "’", "!": "a", '"': "b", "#": "£", "$": "e", "%": "h", "&": "i", "'": "§", "(": ":", ")": "‘", "*": "“", "+": "k", ",": "←", "-": "↑", ".": "→", "/": "↓", ":": "”", ";": "t", "<": "¼", "=": "½", ">": "¾", "?": "x", "@": " ", "A": "̀", "B": "́", "C": "̂", "D": "̃", "E": "̄", "F": "̆", "G": "̇", "H": "̈", "I": "̣", "J": "̊", "K": "̧", "L": "̲", "M": "̋", "N": "̨", "O": "̌", "P": "?", "Q": "¹", "R": "®", "S": "©", "T": "™", "U": "♪", "V": "₠", "W": "‰", "X": "ɑ", "Y": "Ί", "Z": "Ύ", "[": "Ώ", "\\": "⅛", "]": "⅜", "^": "⅝", "_": "⅞", "`": "C", "a": "D", "b": "F", "c": "G", "d": "J", "e": "L", "f": "Q", "g": "R", "h": "S", "i": "U", "j": "V", "k": "W", "l": "Y", "m": "Z", "n": "Ά", "o": "Ή", "p": "c", "q": "d", "r": "f", "s": "g", "t": "j", "u": "l", "v": "q", "w": "r", "x": "s", "y": "u", "z": "v", "{": "w", "|": "y", "}": "z", "~": "Έ", "": "■" };
const g0_cyrillic = { "@": "Ю", "A": "А", "B": "Б", "C": "Ц", "D": "Д", "E": "Е", "F": "Ф", "G": "Г", "H": "Х", "I": "И", "J": "Ѝ", "K": "К", "L": "Л", "M": "М", "N": "Н", "O": "О", "P": "П", "Q": "Я", "R": "Р", "S": "С", "T": "Т", "U": "У", "V": "Ж", "W": "В", "X": "Ь", "Z": "З", "[": "Ш", "]": "Щ", "^": "Ч", "`": "ю", "a": "а", "b": "б", "c": "ц", "d": "д", "e": "е", "f": "ф", "g": "г", "h": "х", "i": "и", "j": "ѝ", "k": "к", "l": "л", "m": "м", "n": "н", "o": "о", "p": "п", "q": "я", "r": "р", "s": "с", "t": "т", "u": "у", "v": "ж", "w": "в", "x": "ь", "z": "з", "{": "ш", "}": "щ", "~": "ч", "": "■" };
const g0_cyrillic__russian_bulgarian = { "&": "ы", "Y": "Ъ", "\\": "Э", "_": "Ы", "y": "ъ", "|": "э" };
const g0_cyrillic__serbian_croatian = { "@": "Ч", "J": "Ј", "Q": "Ќ", "V": "В", "W": "Ѓ", "X": "Љ", "Y": "Њ", "[": "Ћ", "\\": "Ж", "]": "Ђ", "^": "Ш", "_": "Џ", "`": "ч", "j": "ј", "q": "ќ", "v": "в", "w": "ѓ", "x": "љ", "y": "њ", "{": "ћ", "|": "ж", "}": "ђ", "~": "ш" };
const g0_cyrillic__ukranian = { "&": "ї", "Y": "І", "\\": "Є", "_": "Ї", "y": "і", "|": "є" };
const g2_cyrillic = { "0": "m", "1": "n", "2": "p", "3": "t", "4": "x", "5": "x", "6": "°", "7": "±", "8": "²", "9": "³", "!": "a", '"': "b", "#": "£", "$": "e", "%": "h", "&": "i", "'": "§", "(": ":", ")": "‘", "*": "“", "+": "k", ",": "←", "-": "↑", ".": "→", "/": "↓", ":": "¼", ";": "½", "<": "¾", "=": "÷", ">": "’", "?": "”", "@": " ", "A": "̀", "B": "́", "C": "̂", "D": "̃", "E": "̄", "F": "̆", "G": "̇", "H": "̈", "I": "̣", "J": "̊", "K": "̧", "L": "̲", "M": "̋", "N": "̨", "O": "̌", "P": "?", "Q": "©", "R": "®", "S": "¹", "T": "ɑ", "U": "Ί", "V": "Ύ", "W": "Ώ", "X": "‰", "Y": "₠", "Z": "™", "[": "⅛", "\\": "⅜", "]": "⅝", "^": "⅞", "_": "♪", "`": "C", "a": "D", "b": "F", "c": "G", "d": "J", "e": "L", "f": "Q", "g": "R", "h": "S", "i": "U", "j": "V", "k": "W", "l": "Y", "m": "Z", "n": "Ά", "o": "Ή", "p": "c", "q": "d", "r": "f", "s": "g", "t": "j", "u": "l", "v": "q", "w": "r", "x": "s", "y": "u", "z": "v", "{": "w", "|": "y", "}": "z", "~": "Έ", "": "■" };
const g0_arabic = { "#": "£", "&": "ﻰ", "'": "ﻱ", "(": ")", ")": "(", ";": "؛", "<": ">", ">": "<", "?": "؟", "@": "ﺔ", "A": "ﺀ", "B": "ﺒ", "C": "ﺏ", "D": "ﺘ", "E": "ﺕ", "F": "ﺎ", "G": "ﺍ", "H": "ﺑ", "I": "ﺓ", "J": "ﺗ", "K": "ﺛ", "L": "ﺟ", "M": "ﺣ", "N": "ﺧ", "O": "ﺩ", "P": "ﺫ", "Q": "ﺭ", "R": "ﺯ", "S": "ﺳ", "T": "ﺷ", "U": "ﺻ", "V": "ﺿ", "W": "ﻃ", "X": "ﻇ", "Y": "ﻋ", "Z": "ﻏ", "[": "ﺜ", "\\": "ﺠ", "]": "ﺤ", "^": "ﺨ", "_": "#", "`": "ـ", "a": "ﻓ", "b": "ﻗ", "c": "ﻛ", "d": "ﻟ", "e": "ﻣ", "f": "ﻧ", "g": "ﻫ", "h": "ﻭ", "i": "ﻰ", "j": "ﻳ", "k": "ﺙ", "l": "ﺝ", "m": "ﺡ", "n": "ﺥ", "o": "ﻴ", "p": "ﻯ", "q": "ﻌ", "r": "ﻐ", "s": "ﻔ", "t": "ﻑ", "u": "ﻘ", "v": "ﻕ", "w": "ﻙ", "x": "ﻠ", "y": "ﻝ", "z": "ﻤ", "{": "ﻡ", "|": "ﻨ", "}": "ﻥ", "~": "ﻻ", "": "■" };
const g2_arabic = { "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤", "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩", "!": "ﻉ", '"': "ﺁ", "#": "ﺃ", "$": "ﺅ", "%": "ﺇ", "&": "ﺋ", "'": "ﺊ", "(": "ﭼ", ")": "ﭽ", "*": "ﭺ", "+": "ﭘ", ",": "ﭙ", "-": "ﭖ", ".": "ﮊ", "/": "ﮔ", ":": "ﻎ", ";": "ﻍ", "<": "ﻼ", "=": "ﻬ", ">": "ﻪ", "?": "ﻩ", "@": "à", "[": "ë", "\\": "ê", "]": "ù", "^": "î", "_": "ﻊ", "`": "é", "{": "â", "|": "ô", "}": "û", "~": "ç", "": "■" };
const g0_hebrew = { "#": "£", "[": "←", "\\": "½", "]": "→", "^": "↑", "_": "#", "`": "א", "a": "ב", "b": "ג", "c": "ד", "d": "ה", "e": "ו", "f": "ז", "g": "ח", "h": "ט", "i": "י", "j": "ך", "k": "כ", "l": "ל", "m": "ם", "n": "מ", "o": "ן", "p": "נ", "q": "ס", "r": "ע", "s": "ף", "t": "פ", "u": "ץ", "v": "צ", "w": "ק", "x": "ר", "y": "ש", "z": "ת", "{": "₪", "|": "‖", "}": "¾", "~": "÷", "": "■" };
const g1_block_mosaic_to_unicode__legacy_computing = { "0": "🬏", "1": "🬐", "2": "🬑", "3": "🬒", "4": "🬓", "5": "▌", "6": "🬔", "7": "🬕", "8": "🬖", "9": "🬗", " ": " ", "!": "🬀", '"': "🬁", "#": "🬂", "$": "🬃", "%": "🬄", "&": "🬅", "'": "🬆", "(": "🬇", ")": "🬈", "*": "🬉", "+": "🬊", ",": "🬋", "-": "🬌", ".": "🬍", "/": "🬎", ":": "🬘", ";": "🬙", "<": "🬚", "=": "🬛", ">": "🬜", "?": "🬝", "`": "🬞", "a": "🬟", "b": "🬠", "c": "🬡", "d": "🬢", "e": "🬣", "f": "🬤", "g": "🬥", "h": "🬦", "i": "🬧", "j": "▐", "k": "🬨", "l": "🬩", "m": "🬪", "n": "🬫", "o": "🬬", "p": "🬭", "q": "🬮", "r": "🬯", "s": "🬰", "t": "🬱", "u": "🬲", "v": "🬳", "w": "🬴", "x": "🬵", "y": "🬶", "z": "🬷", "{": "🬸", "|": "🬹", "}": "🬺", "~": "🬻", "": "█" };
const g1_block_mosaic_to_unicode__unscii_separated = { "0": "", "1": "", "2": "", "3": "", "4": "", "5": "", "6": "", "7": "", "8": "", "9": "", " ": " ", "!": "", '"': "", "#": "", "$": "", "%": "", "&": "", "'": "", "(": "", ")": "", "*": "", "+": "", ",": "", "-": "", ".": "", "/": "", ":": "", ";": "", "<": "", "=": "", ">": "", "?": "", "`": "", "a": "", "b": "", "c": "", "d": "", "e": "", "f": "", "g": "", "h": "", "i": "", "j": "", "k": "", "l": "", "m": "", "n": "", "o": "", "p": "", "q": "", "r": "", "s": "", "t": "", "u": "", "v": "", "w": "", "x": "", "y": "", "z": "", "{": "", "|": "", "}": "", "~": "", "": "" };
const g3 = { "0": "🭇", "1": "🭈", "2": "🭉", "3": "🭊", "4": "🭋", "5": "◢", "6": "🭌", "7": "🭍", "8": "🭎", "9": "🭏", " ": "🬼", "!": "🬽", '"': "🬾", "#": "🬿", "$": "🭀", "%": "◣", "&": "🭁", "'": "🭂", "(": "🭃", ")": "🭄", "*": "🭅", "+": "🭆", ",": "🭨", "-": "🭩", ".": "🭰", "/": "▒", ":": "🭐", ";": "🭑", "<": "🭪", "=": "🭫", ">": "🭵", "?": "█", "@": "┷", "A": "┯", "B": "┝", "C": "┥", "D": "🮤", "E": "🮥", "F": "🮦", "G": "🮧", "H": "🮠", "I": "🮡", "J": "🮢", "K": "🮣", "L": "┿", "M": "•", "N": "●", "O": "○", "P": "│", "Q": "─", "R": "┌", "S": "┐", "T": "└", "U": "┘", "V": "├", "W": "┤", "X": "┬", "Y": "┴", "Z": "┼", "[": "→", "\\": "←", "]": "↑", "^": "↓", "_": " ", "`": "🭒", "a": "🭓", "b": "🭔", "c": "🭕", "d": "🭖", "e": "◥", "f": "🭗", "g": "🭘", "h": "🭙", "i": "🭚", "j": "🭛", "k": "🭜", "l": "🭬", "m": "🭭", "n": null, "o": null, "p": "🭝", "q": "🭞", "r": "🭟", "s": "🭠", "t": "🭡", "u": "◤", "v": "🭢", "w": "🭣", "x": "🭤", "y": "🭥", "z": "🭦", "{": "🭧", "|": "🭮", "}": "🭯", "~": null, "": null };
const encodings = {
  g0_latin,
  g0_latin__czech_slovak,
  g0_latin__english,
  g0_latin__estonian,
  g0_latin__french,
  g0_latin__german,
  g0_latin__italian,
  g0_latin__latvian_lithuanian,
  g0_latin__polish,
  g0_latin__portuguese_spanish,
  g0_latin__romanian,
  g0_latin__serbian_croatian_slovenian,
  g0_latin__swedish_finnish_hungarian,
  g0_latin__turkish,
  g2_latin,
  g0_greek,
  g2_greek,
  g0_cyrillic,
  g0_cyrillic__russian_bulgarian,
  g0_cyrillic__serbian_croatian,
  g0_cyrillic__ukranian,
  g2_cyrillic,
  g0_arabic,
  g2_arabic,
  g0_hebrew,
  g1_block_mosaic_to_unicode__legacy_computing,
  g1_block_mosaic_to_unicode__unscii_separated,
  g3
};
const sextants = {};
class WrappedCell {
  constructor(cell) {
    this.type = cell.type_;
    this.flashing = cell.flashing_;
    this.concealed = cell.concealed_;
    this.size = cell.size_;
    this.sextants = cell.getSextants_();
  }
}
class Cell {
  constructor() {
    this._byte = " ";
    this._char = " ";
    this._fgColour = Colour.WHITE;
    this._bgColour = Colour.BLACK;
    this._type = CellType.ALPHA_;
    this._flashing = false;
    this._size = CellSize.NORMAL_SIZE_;
    this._concealed = false;
    this._boxed = false;
    this._byteHeld = null;
    this._isCursive = false;
    this._diacriticCode = null;
    this._enhancedChar = null;
  }
  set byte_(byte) {
    this._byte = byte;
  }
  get byte_() {
    return this._byte;
  }
  set fgColour_(colour) {
    this._fgColour = colour;
  }
  get fgColour_() {
    return this._fgColour;
  }
  set bgColour_(colour) {
    this._bgColour = colour;
  }
  get bgColour_() {
    return this._bgColour;
  }
  get isCursive_() {
    return this._isCursive;
  }
  setMappedChar_(encoding) {
    const type = this._type;
    const byte = this._byte;
    if (isAlphaOrG1ButNotMosaic(type, byte)) {
      this._char = getCharWithEncoding(byte, encoding);
      if (this._diacriticCode > 0) {
        const diacriticKey = String.fromCharCode(this._diacriticCode + 64);
        this._char += encodings["g2_latin"][diacriticKey];
      }
      if (encoding.includes("arabic")) {
        this._isCursive = Utils.isCursive_(this._char);
      } else {
        this._isCursive = false;
      }
    } else {
      this._char = getCharForGraphic(type, byte);
    }
    this._byteHeld = null;
  }
  setSpace_(heldMosaic) {
    if ((this._type == CellType.MOSAIC_CONTIGUOUS_ || this._type == CellType.MOSAIC_SEPARATED_) && heldMosaic.active_) {
      this._byteHeld = heldMosaic.char_;
      this._type = heldMosaic.type_;
      let charEncoding = "g1_block_mosaic_to_unicode__legacy_computing";
      if (this._type == CellType.MOSAIC_SEPARATED_) charEncoding = "g1_block_mosaic_to_unicode__unscii_separated";
      this._char = getCharWithEncoding(heldMosaic.char_, charEncoding);
    } else {
      this._byteHeld = null;
      this._char = " ";
    }
  }
  get char_() {
    return this._char;
  }
  get type_() {
    return this._type;
  }
  set type_(type) {
    this._type = type;
  }
  set flashing_(state) {
    this._flashing = state;
  }
  get flashing_() {
    return this._flashing;
  }
  get size_() {
    return this._size;
  }
  set size_(size) {
    this._size = size;
  }
  set concealed_(concealed) {
    this._concealed = concealed;
  }
  get concealed_() {
    return this._concealed;
  }
  set boxed_(boxed) {
    this._boxed = boxed;
  }
  get boxed_() {
    return this._boxed;
  }
  // used in rendering to distinguish burn-through characters in G1 set
  // (should get type_ handle this instead?)
  // applies to the base byte or the held byte
  isMosaicCell_() {
    if (this._byteHeld) return true;
    const code = this._byte.charCodeAt(0);
    return code <= 127 && (code & 32) == 32;
  }
  // used in page model to keep track of mosaic to hold: G1, and MSB is 1
  // applies to the base byte
  isMosaic_() {
    const code = this._byte.charCodeAt(0);
    const isMosaic = (this._type == CellType.MOSAIC_CONTIGUOUS_ || this._type == CellType.MOSAIC_SEPARATED_) && code <= 127 && (code & 32) == 32;
    return isMosaic;
  }
  getSextants_() {
    const code = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
    if (code > 127) return null;
    if (code in sextants) return sextants[code];
    const sextant = code >= 96 ? code - 64 : code - 32;
    const bits = [];
    for (let b = 0; b < 6; b++) {
      bits.push(sextant & 1 << b ? "1" : "0");
    }
    sextants[code] = bits;
    return bits;
  }
}
class EnhancedCell extends Cell {
  constructor(cell) {
    super();
    Object.assign(this, cell);
  }
  set diacritic_(diacriticCode) {
    this._diacriticCode = diacriticCode;
  }
  get diacritic_() {
    return this._diacriticCode;
  }
  set enhancedChar_(char) {
    this._enhancedChar = char;
  }
  get char_() {
    return this._enhancedChar == null ? this._char : this._enhancedChar;
  }
}
function getCharWithEncoding(byte, encoding) {
  if (!(encoding in encodings)) throw new Error(`Cell getCharWithEncoding: bad encoding: ${encoding}`);
  if (byte in encodings[encoding]) return encodings[encoding][byte];
  const matches = encoding.match(/^(.+)__/);
  if (matches != null) {
    const baseEncoding = matches[1];
    if (byte in encodings[baseEncoding]) {
      encodings[encoding][byte] = encodings[baseEncoding][byte];
      return encodings[baseEncoding][byte];
    }
  }
  return byte;
}
function isAlphaOrG1ButNotMosaic(type, byte) {
  const isAlpha = type === CellType.ALPHA_;
  const isG1Type = type === CellType.MOSAIC_CONTIGUOUS_ || type === CellType.MOSAIC_SEPARATED_;
  const isNotMosaic = (byte.charCodeAt(0) & 32) == 0;
  return isAlpha || isG1Type && isNotMosaic;
}
function getCharForGraphic(type, byte) {
  switch (type) {
    case CellType.MOSAIC_CONTIGUOUS_:
      return getCharWithEncoding(byte, "g1_block_mosaic_to_unicode__legacy_computing");
    case CellType.MOSAIC_SEPARATED_:
      return getCharWithEncoding(byte, "g1_block_mosaic_to_unicode__unscii_separated");
    case CellType.G3_:
      return getCharWithEncoding(byte, "g3");
    default:
      return null;
  }
}
class View extends VectorViewBase {
  constructor(model, webkitCompat, dom) {
    super(model, dom);
    this._webkitCompat = webkitCompat;
    this._mosaicSymbols = /* @__PURE__ */ new Set();
    console.debug("VectorViewGraphicMosaic constructed");
  }
  _createDisplay() {
    super._createDisplay();
    this._graphicrows = [];
    this._graphicLayer = this.d.group_();
  }
  _resetRow(rowIndex) {
    super._resetRow(rowIndex);
    this._resetGraphicRow(rowIndex);
  }
  _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
    if ("_background" in this._plugins) {
      this._plugins._background(rowIndex, cellIndex, cell.size_, cell.bgColour_);
    }
    if (cell.type_ == CellType.ALPHA_ || cell.type_ == CellType.G3_ || !isMosaic) {
      this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);
      if (cell.type_ == CellType.G3_) cellView.addClass_("mosaic");
    } else if (isMosaic) {
      cellView.plain_(" ").attr_(attr);
      this._renderMosaic(rowIndex, cellIndex, cell, fill);
    }
  }
  _renderMosaic(row, col, cell, fill) {
    if ("_mosaic" in this._plugins) {
      const wrappedCell = new WrappedCell(cell);
      const rendered = this._plugins._mosaic(row, col, wrappedCell, fill);
      if (rendered) return;
    }
    const sextants2 = cell.getSextants_();
    if (!sextants2.includes("1")) return;
    const id = (cell.type_ == CellType.MOSAIC_CONTIGUOUS_ ? "c" : "s") + sextants2.join("");
    let width = VectorViewBase._CELL_WIDTH;
    let height = VectorViewBase._CELL_HEIGHT;
    if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_) {
      width = VectorViewBase._CELL_WIDTH + 0.3;
      height = VectorViewBase._CELL_HEIGHT + 0.2;
    }
    if (!this._mosaicSymbols.has(id)) {
      this._mosaicSymbols.add(id);
      const symbol = this._svg.symbol_(id);
      if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_) {
        symbol.attr_({
          preserveAspectRatio: "none",
          width,
          // FUDGE cell is bigger than it should be
          height,
          // to close tiny gaps on Chromecast
          viewBox: "0 0 12 18"
        });
        for (let i = 0; i < 6; i++) {
          sextants2[i] == "1" && symbol.rect_(6, 6).move_(i % 2 * 6, Math.floor(i / 2) * 6);
        }
      } else {
        symbol.attr_({
          preserveAspectRatio: "none",
          width,
          height,
          viewBox: "0 0 12 18"
        });
        for (let i = 0; i < 6; i++) {
          sextants2[i] == "1" && symbol.rect_(4, 4).move_(i % 2 * 6 + 1, Math.floor(i / 2) * 6 + 2);
        }
      }
    }
    let use;
    if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_)
      use = this._graphicrows[row].use_(id).move_(col * VectorViewBase._CELL_WIDTH - 0.15, row * VectorViewBase._CELL_HEIGHT - 0.1).fill_(fill);
    else
      use = this._graphicrows[row].use_(id).move_(col * VectorViewBase._CELL_WIDTH, row * VectorViewBase._CELL_HEIGHT).fill_(fill);
    if (this._webkitCompat)
      use.attr_({ width, height });
    if (cell.size_ == CellSize.DOUBLE_HEIGHT_ || cell.size_ == CellSize.DOUBLE_SIZE_)
      use.attr_("height", VectorViewBase._CELL_DOUBLE_HEIGHT);
    if (cell.size_ == CellSize.DOUBLE_WIDTH_ || cell.size_ == CellSize.DOUBLE_SIZE_)
      use.attr_("width", VectorViewBase._CELL_DOUBLE_WIDTH);
    if (cell.flashing_) use.addClass_("flash");
    if (cell.concealed_) use.addClass_("conceal");
  }
  _resetGraphicRow(rowNum) {
    if (this._graphicrows[rowNum]) this._graphicrows[rowNum].remove_();
    this._graphicrows[rowNum] = this._graphicLayer.group_();
  }
  _getCellAttr(cellType, isMosaicChar, isCursive) {
    if (cellType == CellType.G3_) {
      return {
        dx: VectorViewBase._MOSAIC_METRIC._contiguous._DX,
        dy: -0.15,
        textLength: VectorViewBase._MOSAIC_METRIC._contiguous._textLength,
        lengthAdjust: "spacingAndGlyphs",
        "text-anchor": "start",
        transform: null,
        class: null
      };
    }
    return {
      dx: null,
      dy: null,
      textLength: isCursive ? VectorViewBase._CELL_WIDTH : null,
      lengthAdjust: isCursive ? "spacingAndGlyphs" : null,
      "text-anchor": null,
      transform: null,
      class: null
    };
  }
}
class Enhancement {
  constructor(model) {
    this._model = model;
    this._x = 0;
    this._y = 0;
    this._data = [];
  }
  // printPos() {
  //     console.log(this._x, this._y);
  //     return this;
  // }
  pos(x, y) {
    x = parseInt(x);
    y = parseInt(y);
    if (x < 0 || x > 39)
      return this;
    if (y < 0 || y > 24)
      return this;
    this._x = x;
    this._y = y;
    return this;
  }
  putG0(char, diacriticCode) {
    let dcode = null;
    if (typeof diacriticCode != "undefined") {
      const code = parseInt(diacriticCode);
      if (code >= 0 && code <= 15)
        dcode = code;
    }
    const charCode = char.charCodeAt(0);
    if (charCode < 32 || charCode > 127)
      return this;
    this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g0",
      char_: char,
      diacritic_: dcode
    });
    return this;
  }
  putG1(char) {
    const charCode = char.charCodeAt(0);
    if (charCode < 32 || charCode > 127)
      return this;
    this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g1",
      char_: char
    });
    return this;
  }
  putG2(char) {
    const charCode = char.charCodeAt(0);
    if (charCode < 32 || charCode > 127)
      return this;
    this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g2",
      char_: char
    });
    return this;
  }
  putG3(char) {
    const charCode = char.charCodeAt(0);
    if (charCode < 32 || charCode > 127)
      return this;
    this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g3",
      char_: char
    });
    return this;
  }
  putAt() {
    this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "char",
      char_: "@"
    });
    return this;
  }
  end() {
    this._model.enhance_(this._data);
    this._model.notify_();
    return this;
  }
}
class ViewClassic extends VectorViewBase {
}
const TEST_PAGE_NAMES = ["SPLASH", "ENGINEERING", "ADVERT", "UK"];
class TeletextController {
  constructor(model, options) {
    this._windowDom = null;
    if (typeof window == "object") this._windowDom = window;
    this._opt = {
      webkitCompat_: true
      // generate SVG that's compatible with webkit by default. The resulting SVG is larger
    };
    if (typeof options == "object") {
      if ("webkitCompat" in options && !options.webkitCompat) this._opt.webkitCompat_ = false;
      if ("dom" in options) this._windowDom = options.dom;
    }
    if (this._windowDom == null)
      throw new Error("TeletextController E24: No window dom object available");
    this._view = new View(model, this._opt.webkitCompat_, this._windowDom);
    this._model = model;
    this._levelIndex = 1;
    this._testPageIndex = 0;
    this._initEventHandlers();
    this._viewSelector = null;
    this._height = null;
    this._posX = 0;
    this._posY = 0;
    this._font = null;
    console.debug("TeletextController constructed");
  }
  setRowFromOutputLine(rowNum, string) {
    const chars = Utils.decodeOutputLine_(string);
    this._model.setRowFromChars_(rowNum, chars);
  }
  setRow(rowNum, string) {
    this._model.setRowFromChars_(rowNum, string);
  }
  setPageFromOutputLines(lines, header) {
    const rows = Utils.getRowsFromOutputLines_(lines);
    if (typeof header != "undefined") rows[0] = this._processHeader(header);
    this.setPageRows(rows);
  }
  setPageRows(rows) {
    this._model.clearEnhancements_();
    this._model.setRows_(rows);
  }
  _processHeader(header) {
    header = Utils.decodeOutputLine_(header);
    return header.join("").substring(0, 32).padStart(40, " ");
  }
  showTestPage(name) {
    let page;
    if (name in testpages) {
      page = testpages[name];
    } else {
      page = testpages[TEST_PAGE_NAMES[this._testPageIndex]];
      this._testPageIndex++;
      if (this._testPageIndex == TEST_PAGE_NAMES.length) this._testPageIndex = 0;
    }
    this.loadPageFromEncodedString(page);
  }
  showRandomisedPage() {
    const rows = [];
    for (let row = 0; row < 25; row++) {
      const cols = [];
      for (let col = 0; col < 40; col++) {
        cols.push(String.fromCharCode(Math.random() * 127));
      }
      rows.push(cols.join(""));
    }
    this.setPageRows(rows);
  }
  loadPageFromEncodedString(input, header) {
    const decoded = Utils.decodeBase64URLEncoded_(input, this._windowDom.atob);
    if (typeof header != "undefined") decoded[0] = this._processHeader(header);
    this.setPageRows(decoded);
  }
  _initEventHandlers() {
    this._handlers = {
      _reveal: () => this._view.reveal_(),
      _mix: () => this._view.mixMode_(),
      _subtitlemode: () => this._view.boxMode_()
    };
    this._windowDom.addEventListener("ttx.reveal", this._handlers._reveal);
    this._windowDom.addEventListener("ttx.mix", this._handlers._mix);
    this._windowDom.addEventListener("ttx.subtitlemode", this._handlers._subtitlemode);
    console.log("handlers innit", this._handlers);
  }
  // Clean-up method for SPAs
  destroy() {
    this._windowDom.removeEventListener("ttx.reveal", this._handlers._reveal);
    this._windowDom.removeEventListener("ttx.mix", this._handlers._mix);
    this._windowDom.removeEventListener("ttx.subtitlemode", this._handlers._subtitlemode);
    this._handlers = null;
  }
  toggleReveal() {
    this._view.reveal_();
  }
  toggleMixMode() {
    this._view.mixMode_();
  }
  toggleBoxMode() {
    this._view.boxMode_();
  }
  toggleGrid() {
    this._view.grid_();
  }
  setLevel(level) {
    this._model.setLevel_(level);
  }
  addTo(selector) {
    this._selector = selector;
    this._view.addTo_(selector);
  }
  setFont(font) {
    this._font = font;
    this._view.setFont_(font);
  }
  clearScreen(withUpdate) {
    this._model.clearEnhancements_();
    this._model.clearScreen_(withUpdate);
  }
  setAspectRatio(aspectRatio) {
    if (aspectRatio == "natural") {
      this._view.setAspectRatio_(aspectRatio);
      return;
    }
    const ar = parseFloat(aspectRatio);
    if (Number.isNaN(ar)) throw new Error("E80 setAspectRatio: bad number");
    this._view.setAspectRatio_(ar);
  }
  setHeight(height) {
    const newHeight = parseFloat(height);
    if (Number.isNaN(newHeight)) throw new Error("E98 setHeight: bad number");
    this._view.setHeight_(newHeight);
    this._height = newHeight;
  }
  setDefaultG0Charset(encoding, withUpdate) {
    const matches = encoding.match(/g0_/);
    if (matches == null) throw new Error("E130 setDefaultG0Charset: Bad g0 set");
    this._model.setPrimaryG0CharacterEncoding_(encoding, withUpdate);
  }
  setSecondG0Charset(encoding, withUpdate) {
    const matches = encoding.match(/g0_/);
    if (matches == null) throw new Error("E136 setSecondG0Charset: Bad g0 set");
    this._model.setSecondaryG0CharacterEncoding_(encoding, withUpdate);
  }
  setG2Charset(encoding, withUpdate) {
    const matches = encoding.match(/g2_/);
    if (matches == null) throw new Error("E142 setG2Charset: Bad g2 set");
    this._model.setG2CharacterEncoding_(encoding, withUpdate);
  }
  remove() {
    this._view.detach_();
    if (this._selector) {
      const el = this._windowDom.document.querySelector(this._selector);
      if (el) el.removeChild(el.firstChild);
    }
    this._view = null;
  }
  setView(view) {
    this.remove();
    switch (view) {
      case "classic__font-for-mosaic":
        this._view = new ViewClassic(this._model, this._windowDom);
        break;
      case "classic__graphic-for-mosaic":
        this._view = new View(this._model, this._opt.webkitCompat_, this._windowDom);
        break;
      default:
        throw new Error("setView E126: bad view name:" + view);
    }
    if (this._height) this._view.setHeight_(this._height);
    if (this._font) this._view.setFont_(this._font);
    if (this._selector) this._view.addTo_(this._selector);
    this._model.notify_();
  }
  registerViewPlugin(plugin) {
    plugin.registerWithView(this._view);
    this._model.notify_();
  }
  enhance() {
    return new Enhancement(this._model);
  }
  writeBytes(colNum, rowNum, byteRows, withUpdate) {
    this._model.writeBytes_(colNum, rowNum, byteRows, withUpdate);
  }
  writeByte(colNum, rowNum, byte, withUpdate) {
    this._model.writeByte_(colNum, rowNum, byte, withUpdate);
  }
  plot(graphicColNum, graphicRowNum) {
    this._model.plot_(graphicColNum, graphicRowNum);
  }
  plotPoints(graphicColNum, graphicRowNum, numPointsPerRow, points) {
    this._model.plotPoints_(graphicColNum, graphicRowNum, numPointsPerRow, points);
  }
  getBytes() {
    return this._model.getBytes_();
  }
  getScreenImage() {
    return this._view.getStaticScreen_();
  }
  // getScreenBitmap() {
  //     // TODO - convert the vector to a bitmap
  // }
  updateDisplay() {
    this._model.notify_();
  }
  // dumpToConsole() {
  //     this._model.dumpToConsole();
  // }
}
class Event {
  constructor(sender) {
    this._sender = sender;
    this._listeners = [];
  }
  attach_(listener) {
    this._listeners.push(listener);
    return this._listeners.length - 1;
  }
  notify_(args) {
    this._listeners.forEach((fn) => fn != null && fn(this._sender, args));
  }
  detach_(index) {
    this._listeners[index] = null;
  }
}
class RowModel {
  constructor() {
    this._doubleHeight = false;
    this._cells = [];
  }
  get doubleHeight_() {
    return this._doubleHeight;
  }
  set doubleHeight_(isDoubleHeight) {
    this._doubleHeight = isDoubleHeight;
  }
  addCell_(cell) {
    this._cells.push(cell);
  }
  getCell_(i) {
    if (i >= this._cells.length) throw new Error("RowModel.getCell E20 bad cell index");
    return this._cells[i];
  }
}
const ROWS = 25;
const CELLS_PER_ROW = 40;
const DEFAULT_PRIMARY_G0_CHARACTER_SET = "g0_latin";
const DEFAULT_G2_CHARACTER_SET = "g2_latin";
const ENHANCEMENT_LEVELS = [Level[1.5], Level[2.5]];
const G3_CHARS_IN_LEVEL_1_5 = "Q[\\]";
class PageModel {
  constructor() {
    this._screen = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < CELLS_PER_ROW; c++) {
        row.push(new Cell());
      }
      this._screen.push(row);
    }
    this._primaryG0CharacterEncoding = DEFAULT_PRIMARY_G0_CHARACTER_SET;
    this._secondaryG0CharacterEncoding = null;
    this._g2CharacterEncoding = DEFAULT_G2_CHARACTER_SET;
    this._startBoxChar = Attributes.charFromAttribute(Attributes.START_BOX);
    this._endBoxChar = Attributes.charFromAttribute(Attributes.END_BOX);
    this._level = Level[1];
    this._enhancement = [];
    this.onSet_ = new Event(this);
    console.debug("PageModel constructed");
  }
  notify_() {
    this.onSet_.notify_();
  }
  setRowFromChars_(rowNum, text) {
    if (rowNum >= ROWS) {
      throw new Error("PageModel E29 bad row number");
    }
    this._setRowFromChars(rowNum, text);
    this.onSet_.notify_();
  }
  setRows_(rows) {
    rows = rows.slice(0, ROWS);
    rows.forEach((row, index) => {
      this._setRowFromChars(index, row);
    });
    this.onSet_.notify_();
  }
  writeBytes_(colNum, rowNum, byteRows, withUpdate) {
    for (let r = rowNum, i = 0; r < ROWS && i < byteRows.length; r++, i++) {
      const row = [...byteRows[i]].slice(0, CELLS_PER_ROW - colNum);
      for (let c = colNum, j = 0; c < CELLS_PER_ROW && j < row.length; c++, j++) {
        this._screen[r][c].byte_ = row[j];
      }
    }
    if (typeof withUpdate != "undefined" && withUpdate)
      this.onSet_.notify_();
  }
  writeByte_(colNum, rowNum, byte, withUpdate) {
    if (colNum >= 0 && colNum < CELLS_PER_ROW && rowNum >= 0 && rowNum < ROWS) {
      this._screen[rowNum][colNum].byte_ = byte;
    }
    if (typeof withUpdate != "undefined" && withUpdate)
      this.onSet_.notify_();
  }
  // Plots a pixel in a g1 mosaic at the co-ordinates
  // Control codes aren't overriden
  // Existing mosaics are modified
  // Non mosaics are replaced with a new mosaic
  plot_(graphicColNum, graphicRowNum, unplot) {
    const rowNum = Math.floor(graphicRowNum / 3);
    const colNum = Math.floor(graphicColNum / 2);
    const byte = this._screen[rowNum][colNum]._byte;
    const code = byte.charCodeAt(0);
    if (code < 32) return;
    if (unplot ? code == 32 : code == 255) return;
    const baseX = graphicColNum - colNum * 2;
    const baseY = graphicRowNum - rowNum * 3;
    const bitShift = baseX + baseY * 2;
    let sextant = 0;
    if (code < 64) sextant = code - 32;
    else if (code >= 96) sextant = code - 64;
    if (unplot) {
      sextant &= ~(1 << bitShift);
    } else {
      sextant |= 1 << bitShift;
    }
    const newCode = sextant >= 32 ? sextant + 64 : sextant + 32;
    this._screen[rowNum][colNum]._byte = String.fromCharCode(newCode);
  }
  plotPoints_(graphicColNum, graphicRowNum, numPointsPerRow, points) {
    let r = 0, c = 0;
    for (let i = 0; i < points.length; i++) {
      if (graphicRowNum + r < ROWS * 3) {
        if (graphicColNum + c < CELLS_PER_ROW * 2) {
          if (points[r * numPointsPerRow + c] == 255) {
            this.plot_(graphicColNum + c, graphicRowNum + r);
          } else {
            this.plot_(graphicColNum + c, graphicRowNum + r, true);
          }
        }
        c++;
        if (c == numPointsPerRow) {
          r++;
          c = 0;
        }
      } else {
        break;
      }
    }
  }
  _setRowFromChars(rowNum, text) {
    let textArray = [...text];
    textArray = textArray.slice(0, CELLS_PER_ROW);
    textArray.forEach((c, colNum) => {
      const code = c.charCodeAt(0);
      if (Number.isNaN(code) || code > 127) {
        throw new Error(`PageModel E51 failed to write row: bad character code (${code}) at row ${rowNum} col ${colNum}`);
      }
      this._screen[rowNum][colNum].byte_ = c;
    });
    if (textArray.length < CELLS_PER_ROW) {
      for (let colNum = textArray.length; colNum < CELLS_PER_ROW; colNum++) {
        this._screen[rowNum][colNum].byte_ = " ";
      }
    }
  }
  // dumpToConsole() {
  //     this._screen.forEach((row, index) => {
  //         let rowString = '';
  //         row.forEach(cell => {
  //             rowString += cell.byte.charCodeAt(0).toString(16).padStart(2, '0') + ' ';
  //         });
  //         console.log(index, '|', rowString, '|');
  //     });
  // }
  setLevel_(level) {
    this._level = level;
    console.debug("PageModel.setLevel: switching to Level", level);
    console.debug("new level: ", this._level);
    this.onSet_.notify_();
  }
  clearScreen_(withUpdate) {
    const updateAfterClear = typeof withUpdate != "undefined" ? withUpdate : true;
    if (updateAfterClear) {
      const rows = [];
      for (let rowNum = 0; rowNum < ROWS; rowNum++) {
        rows.push("");
      }
      this.setRows_(rows);
    } else {
      for (let rowNum = 0; rowNum < ROWS; rowNum++) {
        this._setRowFromChars(rowNum, "");
      }
    }
  }
  setPrimaryG0CharacterEncoding_(encoding, withUpdate) {
    this._primaryG0CharacterEncoding = encoding;
    const g0base = encoding.match(/^g0_([a-z]+)/);
    if (g0base != null) {
      const g2 = `g2_${g0base[1]}`;
      if (g2 in encodings) this._g2CharacterEncoding = g2;
      else if (g0base[1] == "hebrew") this._g2CharacterEncoding = "g2_arabic";
    }
    console.debug("PageModel.setPrimaryG0CharacterEncoding: set default g0 encoding to", encoding, "with g2 encoding to", this._g2CharacterEncoding);
    if (withUpdate) this.onSet_.notify_();
  }
  setSecondaryG0CharacterEncoding_(encoding, withUpdate) {
    this._secondaryG0CharacterEncoding = encoding;
    console.debug("PageModel.setSecondaryG0CharacterEncoding: set second g0 encoding to", encoding);
    if (withUpdate) this.onSet_.notify_();
  }
  setG2CharacterEncoding_(encoding, withUpdate) {
    this._g2CharacterEncoding = encoding;
    console.debug("PageModel.setG2CharacterEncoding: set g2 encoding to", encoding);
    if (withUpdate) this.onSet_.notify_();
  }
  getRow_(rowNum) {
    if (rowNum >= ROWS) {
      throw new Error("PageModel.getRow E42 bad rowNum");
    }
    const rowModel = new RowModel();
    let textColour, switchedG0CharacterEncoding;
    let nextCellType = CellType.ALPHA_;
    let nextTextColour = Colour.WHITE;
    let nextFlashing = false;
    let nextSize = CellSize.NORMAL_SIZE_;
    let nextSwitchedG0CharacterEncoding = false;
    let nextConcealed = false;
    let cancelNextHoldMosaics = false;
    let nextBoxed = false;
    let backgroundColour = Colour.BLACK;
    let graphicType = CellType.MOSAIC_CONTIGUOUS_;
    let heldMosaic = {
      active_: false,
      char_: " ",
      type_: CellType.MOSAIC_CONTIGUOUS_
    };
    let rowEnhancements = [];
    if (ENHANCEMENT_LEVELS.includes(this._level))
      rowEnhancements = this._enhancement.filter((e) => e.y_ == rowNum);
    this._screen[rowNum].forEach((cell, cellIndex) => {
      const char = cell.byte_;
      const attrib = attribFromChar(this._level, char);
      textColour = nextTextColour;
      cell.type_ = nextCellType;
      cell.boxed_ = nextBoxed;
      switchedG0CharacterEncoding = nextSwitchedG0CharacterEncoding;
      if (attrib.attribute_ != Attributes.STEADY) cell.flashing_ = nextFlashing;
      if (attrib.attribute_ != Attributes.NORMAL_SIZE) cell.size_ = nextSize;
      if (attrib.attribute_ != Attributes.CONCEAL) cell.concealed_ = nextConcealed;
      if (cancelNextHoldMosaics) {
        if (attrib.attribute_ != Attributes.HOLD_MOSAICS) {
          heldMosaic.active_ = false;
          heldMosaic.char_ = " ";
        }
        cancelNextHoldMosaics = false;
      }
      switch (attrib.attribute_) {
        case Attributes.TEXT_COLOUR:
          nextCellType = CellType.ALPHA_;
          nextTextColour = attrib.colour_;
          nextConcealed = false;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.MOSAIC_COLOUR:
          nextCellType = graphicType;
          nextTextColour = attrib.colour_;
          nextConcealed = false;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.NEW_BACKGROUND:
          backgroundColour = textColour;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.BLACK_BACKGROUND:
          backgroundColour = Colour.BLACK;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.CONTIGUOUS_GRAPHICS:
          graphicType = CellType.MOSAIC_CONTIGUOUS_;
          if (cell.type_ == CellType.MOSAIC_SEPARATED_) cell.type_ = CellType.MOSAIC_CONTIGUOUS_;
          if (nextCellType == CellType.MOSAIC_SEPARATED_) nextCellType = CellType.MOSAIC_CONTIGUOUS_;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.SEPARATED_GRAPHICS:
          graphicType = CellType.MOSAIC_SEPARATED_;
          if (cell.type_ == CellType.MOSAIC_CONTIGUOUS_) cell.type_ = CellType.MOSAIC_SEPARATED_;
          if (nextCellType == CellType.MOSAIC_CONTIGUOUS_) nextCellType = CellType.MOSAIC_SEPARATED_;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.ESC:
          if (this._secondaryG0CharacterEncoding) {
            nextSwitchedG0CharacterEncoding = !switchedG0CharacterEncoding;
          }
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.FLASH:
          nextFlashing = true;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.STEADY:
          cell.flashing_ = false;
          nextFlashing = false;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.NORMAL_SIZE:
          cell.size_ = CellSize.NORMAL_SIZE_;
          nextSize = CellSize.NORMAL_SIZE_;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.DOUBLE_HEIGHT:
          nextSize = CellSize.DOUBLE_HEIGHT_;
          rowModel.doubleHeight_ = true;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.DOUBLE_WIDTH:
          nextSize = CellSize.DOUBLE_WIDTH_;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.DOUBLE_SIZE:
          nextSize = CellSize.DOUBLE_SIZE_;
          rowModel.doubleHeight_ = true;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.CONCEAL:
          cell.concealed_ = true;
          nextConcealed = true;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.HOLD_MOSAICS:
          heldMosaic.active_ = true;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.RELEASE_MOSAICS:
          cancelNextHoldMosaics = true;
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.START_BOX:
          if (cellIndex >= 1) {
            if (this._screen[rowNum][cellIndex - 1].byte_ == this._startBoxChar) {
              cell.boxed_ = true;
              nextBoxed = true;
            }
          }
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.END_BOX:
          if (cellIndex + 1 < CELLS_PER_ROW) {
            if (this._screen[rowNum][cellIndex + 1].byte_ == this._endBoxChar) {
              nextBoxed = false;
            }
          }
          cell.setSpace_(heldMosaic);
          break;
        case Attributes.UNKNOWN_:
          cell.setSpace_(heldMosaic);
          break;
        default:
          if (switchedG0CharacterEncoding)
            cell.setMappedChar_(this._secondaryG0CharacterEncoding);
          else
            cell.setMappedChar_(this._primaryG0CharacterEncoding);
          if (cell.isMosaic_()) {
            heldMosaic.char_ = char;
            heldMosaic.type_ = cell.type_;
          }
      }
      cell.fgColour_ = textColour;
      cell.bgColour_ = backgroundColour;
      const cellEnhancements = rowEnhancements.filter((e) => e.x_ == cellIndex);
      cellEnhancements.forEach((e) => {
        const ecell = new EnhancedCell(cell);
        cell = ecell;
        if (e.type_ == "g0") {
          cell.byte_ = e.char_;
          cell.diacritic_ = e.diacritic_;
          cell.type_ = CellType.ALPHA_;
          if (this._primaryG0CharacterEncoding.includes("latin")) {
            cell.setMappedChar_("g0_latin");
          } else {
            cell.setMappedChar_(this._primaryG0CharacterEncoding);
          }
        } else if (e.type_ == "g1") {
          if (this._level == Level[2.5]) {
            cell.byte_ = e.char_;
            cell.type_ = graphicType;
            if (this._primaryG0CharacterEncoding.includes("latin")) {
              cell.setMappedChar_("g0_latin");
            } else {
              cell.setMappedChar_(this._primaryG0CharacterEncoding);
            }
          }
        } else if (e.type_ == "g2") {
          cell.byte_ = e.char_;
          cell.type_ = CellType.ALPHA_;
          cell.setMappedChar_(this._g2CharacterEncoding);
        } else if (e.type_ == "g3") {
          if (this._isAllowedG3Char(e.char_)) {
            cell.byte_ = e.char_;
            cell.type_ = CellType.G3_;
            cell.setMappedChar_();
          }
        } else if (e.type_ == "char") {
          cell.enhancedChar_ = e.char_;
          cell.type_ = CellType.ALPHA_;
        }
      });
      rowModel.addCell_(cell);
    });
    return rowModel;
  }
  enhance_(data) {
    this._enhancement = data;
  }
  clearEnhancements_() {
    this._enhancement = [];
  }
  getBytes_() {
    const bytes = new Uint8Array(ROWS * CELLS_PER_ROW);
    this._screen.forEach((row, rowNum) => {
      row.forEach((cell, colNum) => {
        bytes[rowNum * CELLS_PER_ROW + colNum] = cell.byte_.charCodeAt(0);
      });
    });
    return bytes;
  }
  _isAllowedG3Char(char) {
    return this._level == Level[1.5] && G3_CHARS_IN_LEVEL_1_5.indexOf(char) == -1 ? false : true;
  }
}
function Teletext(options) {
  const model = new PageModel();
  return new TeletextController(model, options);
}
export {
  Attributes,
  Colour,
  Level,
  Teletext
};
//# sourceMappingURL=teletext.js.map
