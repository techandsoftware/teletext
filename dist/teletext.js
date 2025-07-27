/*! SPDX-FileCopyrightText: (c) 2025 Rob Hardy
    SPDX-License-Identifier: AGPL-3.0-only */
const Ct = "ﻰﺋﺊﭼﭽﭘﭙﮔﻎﻼﻬﻪﻊﺔﺒﺘﺎﺑﺗﺛﺟﺣﺧﺳﺷﺻﺿﻃﻇﻋﻏﺜﺠﺤﺨـﻓﻗﻛﻟﻣﻧﻫﻰﻳﻴﻌﻐﻔﻘﻠﻤﻨ";
class H {
  // "base64url" encoding defined here https://tools.ietf.org/html/rfc4648
  // the packed data format is from https://github.com/rawles/edit.tf
  static decodeBase64URLEncoded_(t, e) {
    t = t.replace(/-/g, "+").replace(/_/g, "/");
    const _ = t.length % 4;
    if (_) {
      if (_ === 1) throw new Error("Utils.decodeBase64URLEncoded E16: Input base64url string is the wrong length to determine padding");
      t += new Array(5 - _).join("=");
    }
    const s = e(t), i = [];
    let a = [];
    for (const A of Et(s))
      a.push(String.fromCharCode(A)), a.length == 40 && (i.push(a.join("")), a = []);
    return a.length < 40 && i.push(a.join("")), i;
  }
  // Output Line format from .tti file format https://zxnet.co.uk/teletext/documents/ttiformat.pdf
  static decodeOutputLine_(t) {
    const e = [];
    let _ = !1;
    for (const s of [...t]) {
      const i = s.charCodeAt(0);
      if (i == 27)
        _ = !0;
      else if (i >= 128 && i <= 159) {
        const a = String.fromCharCode(i - 128);
        e.push(a), _ = !1;
      } else if (i >= 160)
        console.warn("W47 decodeOutputLine: bad character:", s), e.push(""), _ = !1;
      else if (_) {
        const a = String.fromCharCode(i - 64);
        e.push(a), _ = !1;
      } else
        e.push(s);
    }
    return e;
  }
  static getRowsFromOutputLines_(t) {
    const e = [], _ = /^OL,(\d{1,2}),(.*)/;
    for (const s of [...t]) {
      const i = s.match(_);
      i != null ? e[i[1]] = H.decodeOutputLine_(i[2]) : console.warn("E66 getRowsFromOutputLines_: bad line", s);
    }
    return e;
  }
  static isCursive_(t) {
    return Ct.indexOf(t) != -1;
  }
}
function dt(r) {
  let t = [];
  for (let e = 7; e >= 0; e--)
    t.push(r & 1 << e ? 1 : 0);
  return t;
}
function* Et(r) {
  let t = 6, e = 0;
  for (const _ of r) {
    const s = dt(_.charCodeAt(0));
    for (const i of s)
      e |= i << t, t--, t < 0 && (yield e, t = 6, e = 0);
  }
  t < 6 && (yield e);
}
const ut = "QIECBAgQIIcWLGg2EDdy3QIKnXKgYtUE7f2QA2TB0wYr2DECAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYMS54fzJmix4-YCDToOLOjyZ0WLSkzo6AkcGHuZUcRHlB4dgyAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAWDP9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YNCho9zImSoAqBGoAp0FUy8-iChhz5UCA4MPEuZYgTAFyAFg1_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2DYCAAoACACeQHkBdYTJlixIkSKlSJEoUKIEBQABAAQAEABYN_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39g4AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGDn9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YsAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIBix_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2LICAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYs_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39i0AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGLX9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_Ytq-jT0yg7OXZs39w0Pzh3Ao_LLl3BZuHPl3dMIGllyBIWzrlLmkKJGTSJUycsoUqlZJYtXLzLBiyZlWjVs3IuHLp2UePXz9AgQokaBIlTJ0ChSqVoFi1cvQMGLJmgaNWzdA4cunaB49fP0ECDChoIkWNHQSJMqWgmTZ09BQo0qaCpVrV0FizatoLl29fQYMOLGgyZc2dBo06taDZt3b0HDjy5oOnXt3QePPr2g-ff38pgw4sZHJlzZyujTq1ktm3dvNcOPLmW6de3cn48-vZf59_fwZiHv3Y8uHYIjbMPPQDVCxcLf4E0-mXDk8mI-_dlFCn5a9_DKr6q-qvqr6q-qvqr6AFS390DJoGQKr6q-qvqr6q-qvqr6o", ft = "QIECBAgQIJ9KDDmRUDZi3QU8PRk1QQeHIHDaIEDJiwYumDACdDwcnbLy6aeeXbl3dECBAgQIECBAgQIECBAgQIHwZkvcoCx0og8LNGjYwQPEjzpoWaNjBA82YHnTQwabEjTpowPEiBAgLHSiBbs1atjFA9SPe2pZqQNUHX1qQatSlrqQNW-5UsaIECAsdKIFidUqQJUCVAlVKlipchQJUCJanVIEqpAlSqlC5CgQIEB0ogQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQHSKBAgQYEH7ogQaGCApw_fEm54R3PCm5JuSKHoFUEVIECAudIoECBB6-___TB-_v0JTU_WqkZHFyQKHmjYgYBECpAqQIC50igQIEH___3_-iD__6FFSAig-IP6JCg26lzRr3avEgFUgLnSKBAg1f1X9lv_9NSBAgI6G-HX1V_EqBUqQJUqXBzagVSAudIoECD9_Qa2qL__6IMDzoq682qdAgQIEARAgQIECBAgVIC50igQIP_9AiaoFX__0VfV_1kjQIECBAgQBECBAgAoECpAgLnSKBBq__0CBCgQa___oreokCBAgQIECBAgQBECBAgVIECAudIoEHr__QIECBAg3_36FAgQIECBAgQIECAIgQIFSBAgQIAZ0igQf_7dAgKIECAinKf9bTR9QIv-N6i_ofzNagQIECBAgJnSKDR__tUBRAoe6NiBB_XYf_rqg_q2iD-gRb-iBAgQIECAmdIoNX_-1QFECDrq9IMH9h664P_D-w34P7DZ4ToECBAgQICZ0ig___5TQ8SfEHzQ82MPCzpoedEHzA82MPjDQ0-LNDSk0JnSOD___lNXVh_Qf9T3cx_oP-prqa_1S3Y0_q_zX-s1NdTUmdI6v_9-U1NUH9B_1NdTX-g_6mvpL_wMNTX-g1Nf6DAz1tSZ0j-_v0JREjQokaFEhRIUSNCiRoUCNAjRoEaBEhRo0CNGgBnSP9OgQFECCNPpIIVKfDkVaUWmggzoiCFPny5M6PTQIECAGdIjUAGlJnR0DBu5coGrFm0YMEE-kgpxYqChBjxUDNuwQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAy92np007s6AFSy9tOXvzQA7O_ryQTd-7L5DQVtpBJ3ZMvg", It = "QIECBAgQIIcWLGg2EDFy2QIJu_cgZNUETLjQA2TN0xYr2DAodJIECBAgQIEGDB4_PUCBAgQIECBAgQIECBAgQIEANkvaMih0kgQIECDA1Qfv__OgQYGCBAgQIECBAgQIECBAgQIECBAgKHSSBAgQIH6FR-__-v7___oECBAgQIEAORPmxUE6LXpoECAodJIECBAoQKum7______9-gQIECBAgQA82_Zs39-aB8-QIAh0kgQIECBAgSev_____v06BAgQIECBAgQIECBAgQIECBAgKHSSBAgQIECBR00____-_w9GCBAgQIECBAgQIECBAgQIECAodJIECBAgQIECD8rx________ECBAgQIECBAgQIECBAgQICh0kgQIECBAgQLETRlv_______6oECBAgQIECBAgQIECBAgKHSyBAgQIHGQlwYIEH_-_x_____9-dECBAgQIECBAgQIECAIdLIECDAmJbfz_-0RJ0qBV________7sECBAgQIECBAgQIAh0sgQIMzAl-__fX5Sg0JECvX______586IECBAgQIECBAgCHSyBAgwJiW9OjX_0qBAgQIEX________-l8fPjBAgQIECAIdLIEHBYhQIECBQxQICWDhg5fv____________tUCBAgQIAh0sgzIECBAgQIEGlAgQEtP_______________-lQIECBAgCHSyBUwQIECBAgQakCBASQqv_____________-6FAgQIECAIdLIECJygQIECBAgaoEBJBg______________5-OiBAgQIAh0sgQKGKBAgQIEHBKgJIMH7____8v__________QoECBAgCHSyBRmQIECBA4RoECAkgVoVaNel________r16FAgQIECAIdLINCFAgwOEyBAgQICSBAgQePn7___r06RAgQIECBAgQIAh0sgQLeKxCgQIECBAgJIECDR__v0aNGhQIECBAgQIECBAgCHSSBAgQIECBAgQIECBAgQYP3_-1QIECBAgQIECBAgQIECAIdJIECBAgQIECBAgQIECBB6boUSBAgQIECBAgQIECBAgQIAh0kgQIECBAgQIECBAgQIFStAgQIECBAgQIECBAgQIECBAgAzsvjognZe_MFIy4cmzTuy8wdTfwQU-G_l0DVKy-lhyad6A", Bt = "QIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECAsaMIEGDx8YIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQICxowg0N2bdmgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgLGjCBFvz9_6BAZQIECBAgQIECAig0NECBAgQIECBAgQIECAsaMcOD5tjyoGCBAgQIECBAgQICLhCgQIECBAgQIECBAgQICxowoTod79ArSEcHBAgQIECBAg0ITKBAgQcGCBAgQIECBAgLGjCBBgXIUCAyRXmlLBAgQIECBuZ4fPn___aoECBAgQIECBAaQIECBAgQIEBFAgQaTPDh8-f___-vXo9f9qgQIECBAgQIECBAgQIEBFAgQcOHz5____69ejRoECBAg__0CBAgQIECBAgQIECBAgQEUCL___r16NGXQIOHDh8-NCOD-3QIECBAgQIECBAgQIECBARQINf0ug-fPi9evRo0aBAgI6v6VAgQIECBAgQIECBAgQIEBFAgRf2hfBw4cOHD58-fPiAj-_oECBAgQIECBAgQIECBAgQEUCBBr-l0SNGjRo0CBAgQEcH9qgQIECBAgQIECBAgQIECBARQIECL-0Lr169ev-fPnxAR1f0KBAgQIECBAgQIAiBAgQIEBFAgQINf3hw4cOCBAgQIEBH-_QIECBAgQIECBAgCIECBAgQIEB1ARRL1-_____________7VAgOIECBAgQIECAIgQIECBAgQHUBNAgQf26BAgQIN_8ijRoECA4gQIECBAgQIAiBAgQIECA6gQE0CDV_QoECBAgRf2iBAgQIEBxAgQIECBAgCIECBAgQIDqBAgQE0aFAgQIECBAgQIECBAgQHECBAgQIECAIgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIBp0Kg3cNqDSggdMuPRh3ZOe_N074eWVf0y7MvTL46IECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQKMalAyYMmqClvxIJGHlk8oECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECA-f___-vXo9f9qgQIECBAgQIECBAgQIEBFAgQcOHz5____69ejRoECBAg__0CBAgQIECBAgQIECBAgQEUCL___r16NGXQIOHDh8-NCOD-3QIECBAgQIECBAgQIECBARQINf0ug-fPi9evRo0aBAgI6v6VAgQIECBAgQIECBAgQIEBFAgRf2hfBw4cOHD58-fPiAj-_oECBAgQIECBAgQIECBAgQEUCBBr-l0SNGjRo0CBAgQEcH9qgQIECBAgQIECBAgQIECBARQIECL-0Lr169ev-fPnxAR1f0KBAgQIECBAgQIAiBAgQIEBFAgQINf3hw4cOCBAgQIEBH-_QIECBAgQIECBAgCIECBAgQIEB1ARRL1-_____________7VAgOIECBAgQIECAIgQIECBAgQHUBNAgQf26BAgQIN_8ijRoECA4gQIECBAgQIAiBAgQIECA6gQE0CDV_QoECBAgRf2iBAgQIEBxAgQIECBAgCIECBAgQIDqBAgQE0aFAgQIECBAgQIECBAgQHECBAgQIECAIgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIBp0Kg3cNqDSggdMuPRh3ZOe_N074eWVf0y7MvTL46IECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQKMalAyYMmaCplx6ECZBT35unfDyyoJnTIuQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECA", pt = {
  ENGINEERING: ut,
  ADVERT: ft,
  UK: It,
  SPLASH: Bt
}, S = "http://www.w3.org/2000/svg";
let et = 0, q, p;
class x {
  constructor() {
  }
  _node() {
    return this._e;
  }
  _removeNode() {
    this._e = null;
  }
  attr_(t, e) {
    if (typeof t == "object")
      for (const _ in t)
        t[_] == null ? this._e.removeAttribute(_) : this._e.setAttribute(_, t[_]);
    else {
      if (typeof e > "u")
        return this._e.getAttribute(t);
      e == null ? this._e.removeAttribute(t) : this._e.setAttribute(t, e);
    }
    return this;
  }
  addClass_(t) {
    if (!this.hasClass_(t)) {
      const e = this.classes_();
      e.push(t), this._e.setAttribute("class", e.join(" "));
    }
    return this;
  }
  hasClass_(t) {
    return this.classes_().indexOf(t) !== -1;
  }
  classes_() {
    const t = this._e.getAttribute("class");
    return t == null ? [] : t.split(" ");
  }
  removeClass_(t) {
    return this.hasClass_(t) && this._e.setAttribute("class", this.classes_().filter((e) => e !== t).join(" ")), this;
  }
  toggleClass_(t) {
    return this.hasClass_(t) ? this.removeClass_(t) : this.addClass_(t), this;
  }
  data_(t, e) {
    if (typeof t == "object")
      for (const _ in t)
        t[_] == null ? delete this._e.dataset[_] : this._e.dataset[_] = t[_];
    else {
      if (typeof e > "u")
        return this._e.dataset[t];
      e == null ? delete this._e.dataset[t] : this._e.dataset[t] = e;
    }
    return this;
  }
}
class St extends x {
  constructor(t) {
    return super(), q = t, p = q.document, this._e = p.createElementNS(S, "svg"), this._e.setAttribute("xmlns", S), this;
  }
  addTo_(t) {
    const e = p.querySelector(t);
    if (e)
      e.appendChild(this._e);
    else
      throw new Error("@techandsoftware/teletext: E117: addTo failed to match provided selector");
    return this;
  }
  viewbox_(t) {
    return this._e.setAttribute("viewBox", t), this;
  }
  size_(t, e) {
    return this._e.setAttribute("width", t), this._e.setAttribute("height", e), this;
  }
  style_(t) {
    const e = p.createElementNS(S, "style");
    return e.append(t), this._e.append(e), this;
  }
  group_() {
    const t = new V();
    return this._e.append(t._node()), t;
  }
  width_() {
    return this._e.clientWidth;
  }
  height_() {
    return this._e.clientHeight;
  }
  symbol_(t) {
    const e = new xt(t);
    return this._e.append(e._node()), e;
  }
}
class V extends x {
  constructor() {
    return super(), this._e = p.createElementNS(S, "g"), this._c = [], this;
  }
  group_() {
    const t = new V();
    return this._e.append(t._node()), this._c.push(t), t;
  }
  plain_(t) {
    const e = new mt(t);
    return this._e.append(e._node()), this._c.push(e), e;
  }
  defs_() {
    const t = new wt();
    return this._e.append(t._node()), t;
  }
  rect_(t, e) {
    const _ = new W(t, e);
    return this._e.append(_._node()), this._c.push(_), _;
  }
  last_() {
    return this._c[this._c.length - 1];
  }
  children_() {
    return this._c;
  }
  clipWith_(t) {
    return this._e.setAttribute("clip-path", `url("#${t._node().id}")`), this;
  }
  unclip_() {
    return this._e.removeAttribute("clip-path"), this;
  }
  remove_() {
    this._e.parentNode && this._e.parentNode.removeChild(this._e), this._e = null, this._c.forEach((t) => t._removeNode()), this._c = [];
  }
  line_(t, e, _, s) {
    const i = new Ot(t, e, _, s);
    return this._e.append(i._node()), this._c.push(i), i;
  }
  use_(t) {
    const e = new yt(t);
    return this._e.append(e._node()), this._c.push(e), e;
  }
  image_(t, e) {
    const _ = new bt(t, e);
    return this._e.append(_._node()), this._c.push(_), _;
  }
  svg_(t, e) {
    const _ = new Qt(t, e);
    return this._e.append(_._node()), this._c.push(_), _;
  }
}
class Qt extends x {
  constructor() {
    return super(), this._e = p.createElementNS(S, "svg"), this;
  }
  attr(...t) {
    return this.attr_(...t);
  }
  get node() {
    return this._node();
  }
}
class bt extends x {
  constructor(t, e) {
    return super(), this._e = p.createElementNS(S, "image"), this._e.setAttribute("width", parseInt(t)), this._e.setAttribute("height", parseInt(e)), this;
  }
  attr(...t) {
    return this.attr_(...t);
  }
}
class yt extends x {
  constructor(t) {
    return super(), this._e = p.createElementNS(S, "use"), this._e.setAttribute("href", `#${t}`), this;
  }
  fill_(t) {
    return this._e.setAttribute("fill", t), this;
  }
  move_(t, e) {
    return this._e.setAttribute("x", t), this._e.setAttribute("y", e), this;
  }
}
class xt extends x {
  constructor(t) {
    return super(), this._e = p.createElementNS(S, "symbol"), this._e.setAttribute("id", t), this;
  }
  rect_(t, e) {
    const _ = new W(t, e);
    return this._e.append(_._node()), _;
  }
}
class mt extends x {
  constructor(t) {
    return super(), this._e = p.createElementNS(S, "text"), this._e.append(t), this;
  }
  plain_(t) {
    return this._e.textContent = t, this;
  }
  fill_(t) {
    return this._e.setAttribute("fill", t), this;
  }
}
class wt extends x {
  constructor() {
    return super(), this._e = p.createElementNS(S, "defs"), this;
  }
  clip_() {
    const t = new Lt();
    return this._e.append(t._node()), t;
  }
  find_(t) {
    return [...this._e.querySelectorAll(t)].map(At);
  }
  rect_(t, e) {
    const _ = new W(t, e);
    return this._e.append(_._node()), _;
  }
}
class Lt extends x {
  constructor() {
    return super(), this._e = p.createElementNS(S, "clipPath"), this._e.setAttribute("id", `clipPath-${et}`), et++, this;
  }
  children_() {
    return [...this._e.children].map(At);
  }
  add_(t) {
    this._e.appendChild(t._node());
  }
}
class W extends x {
  constructor(t, e) {
    if (super(), t instanceof q.SVGElement)
      return this._e = t, this;
    const _ = t;
    return this._e = p.createElementNS(S, "rect"), this._e.setAttribute("width", parseInt(_)), this._e.setAttribute("height", parseInt(e)), this;
  }
  fill_(t) {
    return this._e.setAttribute("fill", t), this;
  }
  move_(t, e) {
    return this._e.setAttribute("x", t), this._e.setAttribute("y", e), this;
  }
  width_(t) {
    return t === void 0 ? parseInt(this._e.getAttribute("width")) : (this._e.setAttribute("width", parseInt(t)), this);
  }
  height_(t) {
    return t === void 0 ? parseInt(this._e.getAttribute("height")) : (this._e.setAttribute("height", parseInt(t)), this);
  }
  remove_() {
    this._e.parentNode && this._e.parentNode.removeChild(this._e), this._e = null;
  }
}
class Ot extends x {
  constructor(t, e, _, s) {
    return super(), this._e = p.createElementNS(S, "line"), this._e.setAttribute("x1", t), this._e.setAttribute("y1", e), this._e.setAttribute("x2", _), this._e.setAttribute("y2", s), this;
  }
}
function At(r) {
  let t;
  switch (r.tagName) {
    case "rect":
      t = new W(r);
      break;
    default:
      throw new Error("SVG:wrapSVGElement Unable to wrap SVG element " + r.tagName);
  }
  return t;
}
const g = {
  BLACK: Symbol("BLACK"),
  RED: Symbol("RED"),
  GREEN: Symbol("GREEN"),
  YELLOW: Symbol("YELLOW"),
  BLUE: Symbol("BLUE"),
  MAGENTA: Symbol("MAGENTA"),
  CYAN: Symbol("CYAN"),
  WHITE: Symbol("WHITE")
};
Object.freeze(g);
const n = {
  ALPHA_: Symbol("ALPHA"),
  MOSAIC_CONTIGUOUS_: Symbol("MOSAIC_CONTIGUOUS"),
  MOSAIC_SEPARATED_: Symbol("MOSAIC_SEPARATED"),
  G3_: Symbol("G3")
};
Object.freeze(n);
const d = {
  NORMAL_SIZE_: Symbol("NORMAL_SIZE"),
  DOUBLE_HEIGHT_: Symbol("DOUBLE_HEIGHT"),
  DOUBLE_WIDTH_: Symbol("DOUBLE_WIDTH"),
  DOUBLE_SIZE_: Symbol("DOUBLE_SIZE")
};
Object.freeze(d);
const Q = {
  0: Symbol("0"),
  // 7 colour text and contiguous graphics, flashing
  1: Symbol("1"),
  // + background colours, separated graphics, conceal, box, double height
  1.5: Symbol("1.5"),
  // + black text/graphics
  2.5: Symbol("2.5")
  // + double width, double size
};
Object.freeze(Q);
class h {
  static charFromTextColour(t) {
    if (t in _t) return _t[t];
    throw new Error("Attributes.charFromTextColour: bad colour: " + t);
  }
  static charFromGraphicColour(t) {
    if (t in st) return st[t];
    throw new Error("Attributes.charFromGraphicColour: bad colour");
  }
  static charFromAttribute(t) {
    if (t in it) return it[t];
    throw new Error("Attributes.charFromAttribute: bad attribute");
  }
}
Object.assign(h, {
  TEXT_COLOUR: n.ALPHA,
  MOSAIC_COLOUR: Symbol("MOSAIC_COLOUR"),
  NEW_BACKGROUND: Symbol("NEW_BACKGROUND"),
  BLACK_BACKGROUND: Symbol("BLACK_BACKGROUND"),
  CONTIGUOUS_GRAPHICS: n.MOSAIC_CONTIGUOUS_,
  SEPARATED_GRAPHICS: n.MOSAIC_SEPARATED_,
  ESC: Symbol("ESC"),
  FLASH: Symbol("FLASH"),
  STEADY: Symbol("STEADY"),
  NORMAL_SIZE: d.NORMAL_SIZE_,
  DOUBLE_HEIGHT: d.DOUBLE_HEIGHT_,
  DOUBLE_WIDTH: d.DOUBLE_WIDTH_,
  DOUBLE_SIZE: d.DOUBLE_SIZE_,
  CONCEAL: Symbol("CONCEAL"),
  HOLD_MOSAICS: Symbol("HOLD_MOSAICS"),
  RELEASE_MOSAICS: Symbol("RELEASE_MOSAICS"),
  START_BOX: Symbol("START_BOX"),
  END_BOX: Symbol("END_BOX"),
  UNKNOWN_: Symbol("UNKNOWN")
  // pseudo-attribute
});
function Rt(r, t) {
  let e = null, _ = null;
  return t in T && D[r].includes(t.charCodeAt(0)) ? t in z ? (e = h.TEXT_COLOUR, _ = T[t]) : t in j ? (e = h.MOSAIC_COLOUR, _ = T[t]) : e = T[t] : t.charCodeAt(0) <= 31 && (e = h.UNKNOWN_), {
    attribute_: e,
    colour_: _
  };
}
function X(r) {
  return gt[r];
}
const gt = {
  [g.BLACK]: "#000",
  [g.RED]: "#f00",
  [g.GREEN]: "#0f0",
  [g.YELLOW]: "#ff0",
  [g.BLUE]: "#00f",
  [g.MAGENTA]: "#f0f",
  [g.CYAN]: "#0ff",
  [g.WHITE]: "#fff"
};
Object.freeze(gt);
const z = {
  "\0": g.BLACK,
  "": g.RED,
  "": g.GREEN,
  "": g.YELLOW,
  "": g.BLUE,
  "": g.MAGENTA,
  "": g.CYAN,
  "\x07": g.WHITE
};
Object.freeze(z);
const _t = J(z), j = {
  "": g.BLACK,
  "": g.RED,
  "": g.GREEN,
  "": g.YELLOW,
  "": g.BLUE,
  "": g.MAGENTA,
  "": g.CYAN,
  "": g.WHITE
};
Object.freeze(j);
const st = J(j), T = {
  "\b": h.FLASH,
  "	": h.STEADY,
  "\n": h.END_BOX,
  "\v": h.START_BOX,
  "\f": h.NORMAL_SIZE,
  "\r": h.DOUBLE_HEIGHT,
  "": h.DOUBLE_WIDTH,
  "": h.DOUBLE_SIZE,
  "": h.CONCEAL,
  "": h.CONTIGUOUS_GRAPHICS,
  "": h.SEPARATED_GRAPHICS,
  "\x1B": h.ESC,
  "": h.BLACK_BACKGROUND,
  "": h.NEW_BACKGROUND,
  "": h.HOLD_MOSAICS,
  "": h.RELEASE_MOSAICS
};
Object.assign(T, z);
Object.assign(T, j);
Object.freeze(T);
const it = J(T), D = {
  [Q[0]]: [
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
D[Q[1]] = [
  ...D[Q[0]],
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
D[Q[1.5]] = [...D[Q[1]], 0, 16];
D[Q[2.5]] = [...D[Q[1.5]], 14, 15];
Object.freeze(D);
function J(r) {
  const t = {};
  for (const e in r)
    t[r[e]] = e;
  return Object.freeze(t);
}
const w = 400, L = 250, P = 40, k = 25, rt = 1.5, Tt = {
  1.33: w / (1.33 * L),
  1.2: w / (1.2 * L),
  1.22: w / (1.22 * L)
}, ot = 1.2, y = L / k, f = w / P, Y = y * 2, Dt = f * 2, Z = f / 2, Ut = y * (4 / 5), M = {
  _contiguous: {
    _textLength: f + 0.4,
    _DX: 0 - Z - 0.2
  },
  _separated: {
    _textLength: f,
    _DX: 0 - Z + 0.5
  }
};
Object.freeze(M);
class C {
  constructor(t, e) {
    this._svg = new St(e).viewbox_(`0 0 ${w} ${L}`).size_(w * rt, L * rt * Tt[ot]).attr_({
      preserveAspectRatio: "none",
      style: "font-family: sans-serif"
    }).style_(Pt()), this.d = this._svg.group_().attr_("class", "conceal_concealed flash_flashing"), this._aspectRatio = ot, this._createDisplay(), this._createBoxModeClip(), this._gridLayer = null, this._model = t, this._listenerId = this._model.onSet_.attach_(
      () => this._update()
    ), this._boxMode = !1, this._mixMode = !1, this._pageContainsBox = !1, this._plugins = {}, console.debug("VectorViewBase constructed");
  }
  addTo_(t) {
    this._svg.addTo_(t);
  }
  detach_() {
    this._model.onSet_.detach_(this._listenerId), this._listenerId = null;
  }
  _update() {
    console.debug("## View._update");
    let t = !1, e = !1;
    this._pageContainsBox = !1, this.d.removeClass_("flash_flashing"), this._gridrows.forEach((_, s) => {
      let i = !1;
      if (this._resetRow(s), t) {
        t = !1, this._clearRowCells(_, s);
        return;
      }
      const a = this._model.getRow_(s);
      let A, E;
      _.forEach((I, u) => {
        if (i) {
          i = !1, this._clearCell(I), this._extendBackgroundForRow(s), E && this._extendBox();
          return;
        }
        const c = a.getCell_(u), O = X(c.bgColour_), G = c.isMosaicByte_(), v = X(c.fgColour_), l = this._getCellAttr(c.type_, G, c.isCursive_);
        this._renderCell(I, c, l, v, u, s, G), c.boxed_ && (E ? this._extendBox() : this._setBoxForRow(s, u), this._pageContainsBox = !0), A == O ? this._extendBackgroundForRow(s) : this._setBackgroundForRow(s, u, O), (c.size_ == d.DOUBLE_WIDTH_ || c.size_ == d.DOUBLE_SIZE_) && (i = !0), A = O, E = c.boxed_, c.flashing_ && (e = !0);
      }), a.doubleHeight_ ? (this._setRowDoubleHeight(s), this._setBoxDoubleHeight(), t = !0) : t = !1, this._makeClipFromBoxesForRow(s);
    }), "_endOfUpdate" in this._plugins && this._plugins._endOfUpdate(this._svg.width_(), this._svg.height_()), this.d.addClass_("conceal_concealed"), e && setTimeout(() => this.d.addClass_("flash_flashing"), 100), this._refreshMixMode();
  }
  _resetRow(t) {
    this._resetBackgroundForRow(t), this._resetBoxClipForRow(t);
  }
  _clearRowCells(t, e) {
    "_clearCellsForRow" in this._plugins && this._plugins._clearCellsForRow(t.length, e), t.forEach((_) => this._clearCell(_));
  }
  _clearCell(t) {
    t.plain_(" ").attr_({
      dx: null,
      dy: null,
      textLength: null,
      lengthAdjust: null,
      "text-anchor": null,
      transform: null,
      class: null
    });
  }
  _renderCell(t, e, _, s, i, a, A) {
    this._renderText(t, e, _, s, i, a), e.type_ == n.MOSAIC_CONTIGUOUS_ && A || e.type_ == n.G3_ ? t.addClass_("mosaic") : e.type_ == n.MOSAIC_SEPARATED_ && A && t.addClass_("mosaic_separated");
  }
  _renderText(t, e, _, s, i, a) {
    t.plain_(e.char_).attr_(_).fill_(s), e.size_ == d.DOUBLE_HEIGHT_ ? t.attr_("transform", `translate(0 ${nt(a)}) scale(1 2)`) : e.size_ == d.DOUBLE_WIDTH_ ? t.attr_("transform", `translate(${at(i)} 0) scale(2 1)`) : e.size_ == d.DOUBLE_SIZE_ && t.attr_("transform", `translate(${at(i)} ${nt(a)}) scale(2 2)`), e.flashing_ && t.addClass_("flash"), e.concealed_ && t.addClass_("conceal");
  }
  reveal_() {
    this.d.toggleClass_("conceal_concealed");
  }
  setFont_(t) {
    let e = t;
    t == "native" ? e = '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif' : t == "default" && (e = "sans-serif"), this._svg.attr_("style", `font-family: ${e}`);
  }
  grid_() {
    this._gridLayer ? (this._gridLayer.remove_(), this._gridLayer = null) : this._drawGrid();
  }
  mixMode_() {
    this._mixMode ? (this._mixMode = !1, this._bgLayer.attr_("opacity", null).unclip_()) : (this._mixMode = !0, this._setMixMode());
  }
  setAspectRatio_(t) {
    this._aspectRatio = t, this.setHeight_(this._svg.height_());
  }
  setHeight_(t) {
    const e = this._aspectRatio == "natural" ? t * (w / L) : t * this._aspectRatio;
    this._svg.size_(e, t);
  }
  _setMixMode() {
    this._boxMode && this._pageContainsBox ? this._bgLayer.attr_("opacity", 0.3) : this._pageContainsBox ? this._bgLayer.clipWith_(this._boxLayer).attr_("opacity", 0.3) : this._bgLayer.attr_("opacity", 0);
  }
  _refreshMixMode() {
    this._mixMode && this._setMixMode();
  }
  boxMode_() {
    this._boxMode ? (this.d.unclip_(), this._boxMode = !1, console.log("box deactivated")) : (this.d.clipWith_(this._boxLayer), this._boxMode = !0, console.log("box activated")), this._refreshMixMode();
  }
  getStaticScreen_() {
    return this._svg._node().outerHTML;
  }
  _drawGrid() {
    this._gridLayer = this.d.group_();
    for (let t = 0; t < k; t++)
      this._gridLayer.line_(0, t * y, w - 1, t * y).attr_({
        stroke: "#555",
        "stroke-width": 0.5
      });
    for (let t = 0; t < P; t++)
      this._gridLayer.line_(t * f, 0, t * f, L - 1).attr_({
        stroke: "#555",
        "stroke-width": 0.5
      });
  }
  _createBoxModeClip() {
    this._defs = this.d.defs_(), this._lastBoxBuffer = null, this._boxLayer = this._defs.clip_();
  }
  _createDisplay() {
    this._createRowBackgrounds(), this._createCells();
  }
  _createRowBackgrounds() {
    const t = [], e = this.d.group_();
    e.attr_({
      "shape-rendering": "crispEdges",
      id: "background"
    }), this._bgrows = t, this._bgLayer = e;
  }
  _createCells() {
    const t = [], e = this.d.group_().attr_({
      "text-anchor": "middle",
      fill: "#fff"
    }).attr_("id", "textlayer");
    for (let _ = 0; _ < k; _++) {
      const s = [];
      for (let i = 0; i < P; i++)
        s.push(e.plain_(Ft()).attr_({
          x: i * f + Z,
          y: _ * y + Ut
        }));
      t.push(s);
    }
    this._gridrows = t, this._textLayer = e;
  }
  _resetBoxClipForRow(t) {
    this._boxLayer.children_().filter((e) => e.data_("r") == t).forEach((e) => e.remove_());
  }
  _resetBackgroundForRow(t) {
    this._bgrows[t] && this._bgrows[t].remove_(), this._bgrows[t] = this._bgLayer.group_();
  }
  _extendBackgroundForRow(t) {
    const e = this._bgrows[t].last_(), _ = e.width_();
    e.width_(_ + f);
  }
  _setBackgroundForRow(t, e, _) {
    const s = e * f, i = t * y;
    this._bgrows[t].rect_(f, y).fill_(_).move_(s, i);
  }
  _extendBox() {
    const t = this._lastBoxBuffer.width_();
    this._lastBoxBuffer.width_(t + f);
  }
  _setRowDoubleHeight(t) {
    this._bgrows[t].children_().forEach((e) => e.attr_("height", Y));
  }
  _setBoxDoubleHeight() {
    this._defs.find_("[data-boxbuffer]").forEach((t) => t.height_(Y));
  }
  _setBoxForRow(t, e) {
    const _ = e * f, s = t * y;
    this._lastBoxBuffer = this._defs.rect_(f, y).data_("boxbuffer", !0).move_(_, s);
  }
  // FUDGE move boxes tagged with data-boxbuffer into the clip layer.
  _makeClipFromBoxesForRow(t) {
    this._defs.find_("[data-boxbuffer]").forEach((e) => {
      e.data_({
        r: t,
        boxbuffer: null
      }), this._boxLayer.add_(e);
    });
  }
  _getCellAttr(t, e, _) {
    return t == n.MOSAIC_CONTIGUOUS_ && e || t == n.G3_ ? {
      dx: M._contiguous._DX,
      dy: -0.15,
      textLength: M._contiguous._textLength,
      lengthAdjust: "spacingAndGlyphs",
      "text-anchor": "start",
      transform: null,
      class: null
    } : t == n.MOSAIC_SEPARATED_ && e ? {
      dx: M._separated._DX,
      dy: null,
      textLength: M._separated._textLength,
      lengthAdjust: "spacingAndGlyphs",
      "text-anchor": "start",
      transform: null,
      class: null
    } : {
      dx: null,
      dy: null,
      textLength: _ ? f : null,
      lengthAdjust: _ ? "spacingAndGlyphs" : null,
      "text-anchor": null,
      transform: null,
      class: null
    };
  }
  registerPlugin(t, e) {
    return "renderBackground" in e && (this._plugins._background = e.renderBackground), "renderMosaic" in e && (this._plugins._mosaic = e.renderMosaic), "endOfPageUpdate" in e && (this._plugins._endOfUpdate = e.endOfPageUpdate), "clearCellsForRow" in e && (this._plugins._clearCellsForRow = e.clearCellsForRow), {
      lookupColour: Ht,
      isDoubleHeight: Gt,
      isDoubleWidth: vt,
      isDoubleSize: Mt,
      isSeparatedMosaic: Nt,
      createImageOverlay: this._createImageOverlay.bind(this),
      createSVGOverlay: this._createSVGOverlay.bind(this)
    };
  }
  _createImageOverlay() {
    const t = this.d.image_(w, L);
    return t.attr_("preserveAspectRatio", "none"), t;
  }
  _createSVGOverlay() {
    const t = this.d.svg_();
    return t.attr_("preserveAspectRatio", "none"), t;
  }
}
C._CELL_WIDTH = f;
C._CELL_HEIGHT = y;
C._CELL_DOUBLE_WIDTH = Dt;
C._CELL_DOUBLE_HEIGHT = Y;
C._WIDTH_PX = w;
C._HEIGHT_PX = L;
C._MOSAIC_METRIC = M;
C.ROWS = k;
C.COLS = P;
const Ht = (r) => X(r), Gt = (r) => r == d.DOUBLE_HEIGHT_, vt = (r) => r == d.DOUBLE_WIDTH_, Mt = (r) => r == d.DOUBLE_SIZE_, Nt = (r) => r == n.MOSAIC_SEPARATED_, nt = (r) => 0 - r * y, at = (r) => 0 - r * f;
function Ft() {
  return String.fromCharCode(32 + Math.random() * 95);
}
function Pt() {
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
const kt = { $: "¤", "": "■" }, Wt = { "#": "#", $: "ů", "@": "č", "[": "ť", "\\": "ž", "]": "ý", "^": "í", _: "ř", "`": "é", "{": "á", "|": "|", "}": "ú", "~": "š" }, zt = { "#": "£", $: "$", "@": "@", "[": "←", "\\": "½", "]": "→", "^": "↑", _: "#", "`": "—", "{": "¼", "|": "‖", "}": "¾", "~": "÷" }, jt = { "#": "#", $: "õ", "@": "Š", "[": "Ä", "\\": "Ö", "]": "Ž", "^": "Ü", _: "Õ", "`": "š", "{": "ä", "|": "ö", "}": "ž", "~": "ü" }, Kt = { "#": "é", $: "ï", "@": "à", "[": "ë", "\\": "ê", "]": "ù", "^": "î", _: "#", "`": "è", "{": "â", "|": "ô", "}": "û", "~": "ç" }, qt = { "#": "#", $: "$", "@": "§", "[": "Ä", "\\": "Ö", "]": "Ü", "^": "^", _: "_", "`": "°", "{": "ä", "|": "ö", "}": "ü", "~": "ß" }, Xt = { "#": "£", $: "$", "@": "é", "[": "°", "\\": "ç", "]": "→", "^": "↑", _: "#", "`": "ù", "{": "à", "|": "ò", "}": "è", "~": "ì" }, Yt = { "#": "#", $: "$", "@": "Š", "[": "ė", "\\": "ę", "]": "Ž", "^": "č", _: "ū", "`": "š", "{": "ą", "|": "ų", "}": "ž", "~": "į" }, Zt = { "#": "#", $: "ń", "@": "ą", "[": "Ƶ", "\\": "Ś", "]": "Ł", "^": "ć", _: "ó", "`": "ę", "{": "ż", "|": "ś", "}": "ł", "~": "ź" }, Vt = { "#": "ç", $: "$", "@": "¡", "[": "á", "\\": "é", "]": "í", "^": "ó", _: "ú", "`": "¿", "{": "ü", "|": "ñ", "}": "è", "~": "à" }, Jt = { "#": "#", $: "¤", "@": "Ț", "[": "Â", "\\": "Ș", "]": "Ă", "^": "Î", _: "ı", "`": "ț", "{": "â", "|": "ș", "}": "ă", "~": "î" }, $t = { "#": "#", $: "Ë", "@": "Č", "[": "Ć", "\\": "Ž", "]": "Đ", "^": "Š", _: "ë", "`": "č", "{": "ć", "|": "ž", "}": "đ", "~": "š" }, te = { "#": "#", $: "¤", "@": "É", "[": "Ä", "\\": "Ö", "]": "Å", "^": "Ü", _: "_", "`": "é", "{": "ä", "|": "ö", "}": "å", "~": "ü" }, ee = { "#": "₺", $: "ğ", "@": "İ", "[": "Ş", "\\": "Ö", "]": "Ç", "^": "Ü", _: "Ğ", "`": "ı", "{": "ş", "|": "ö", "}": "ç", "~": "ü" }, _e = { 0: "°", 1: "±", 2: "²", 3: "³", 4: "×", 5: "µ", 6: "¶", 7: "·", 8: "÷", 9: "’", "!": "¡", '"': "¢", "#": "£", "%": "¥", "&": "#", "'": "§", "(": "¤", ")": "‘", "*": "“", "+": "«", ",": "←", "-": "↑", ".": "→", "/": "↓", ":": "”", ";": "»", "<": "¼", "=": "½", ">": "¾", "?": "¿", "@": " ", A: "̀", B: "́", C: "̂", D: "̃", E: "̄", F: "̆", G: "̇", H: "̈", I: "̣", J: "̊", K: "̧", L: "̲", M: "̋", N: "̨", O: "̌", P: "—", Q: "¹", R: "®", S: "©", T: "™", U: "♪", V: "₠", W: "‰", X: "α", Y: null, Z: null, "[": null, "\\": "⅛", "]": "⅜", "^": "⅝", _: "⅞", "`": "Ω", a: "Æ", b: "Ð", c: "ª", d: "Ħ", e: null, f: "Ĳ", g: "Ŀ", h: "Ł", i: "Ø", j: "Œ", k: "º", l: "Þ", m: "Ŧ", n: "Ŋ", o: "ŉ", p: "ĸ", q: "æ", r: "đ", s: "ð", t: "ħ", u: "ı", v: "ĳ", w: "ŀ", x: "ł", y: "ø", z: "œ", "{": "ß", "|": "þ", "}": "ŧ", "~": "ŋ", "": "■" }, se = { "<": "«", ">": "»", "@": "ΐ", A: "Α", B: "Β", C: "Γ", D: "Δ", E: "Ε", F: "Ζ", G: "Η", H: "Θ", I: "Ι", J: "Κ", K: "Λ", L: "Μ", M: "Ν", N: "Ξ", O: "Ο", P: "Π", Q: "Ρ", R: "ʹ", S: "Σ", T: "Τ", U: "Υ", V: "Φ", W: "Χ", X: "Ψ", Y: "Ω", Z: "Ϊ", "[": "Ϋ", "\\": "ά", "]": "έ", "^": "ή", _: "ί", "`": "ΰ", a: "α", b: "β", c: "γ", d: "δ", e: "ε", f: "ζ", g: "η", h: "θ", i: "ι", j: "κ", k: "λ", l: "μ", m: "ν", n: "ξ", o: "ο", p: "π", q: "ρ", r: "ς", s: "σ", t: "τ", u: "υ", v: "φ", w: "χ", x: "ψ", y: "ω", z: "ϊ", "{": "ϋ", "|": "ό", "}": "ύ", "~": "ώ", "": "■" }, ie = { 0: "°", 1: "±", 2: "²", 3: "³", 4: "×", 5: "m", 6: "n", 7: "p", 8: "÷", 9: "’", "!": "a", '"': "b", "#": "£", $: "e", "%": "h", "&": "i", "'": "§", "(": ":", ")": "‘", "*": "“", "+": "k", ",": "←", "-": "↑", ".": "→", "/": "↓", ":": "”", ";": "t", "<": "¼", "=": "½", ">": "¾", "?": "x", "@": " ", A: "̀", B: "́", C: "̂", D: "̃", E: "̄", F: "̆", G: "̇", H: "̈", I: "̣", J: "̊", K: "̧", L: "̲", M: "̋", N: "̨", O: "̌", P: "?", Q: "¹", R: "®", S: "©", T: "™", U: "♪", V: "₠", W: "‰", X: "ɑ", Y: "Ί", Z: "Ύ", "[": "Ώ", "\\": "⅛", "]": "⅜", "^": "⅝", _: "⅞", "`": "C", a: "D", b: "F", c: "G", d: "J", e: "L", f: "Q", g: "R", h: "S", i: "U", j: "V", k: "W", l: "Y", m: "Z", n: "Ά", o: "Ή", p: "c", q: "d", r: "f", s: "g", t: "j", u: "l", v: "q", w: "r", x: "s", y: "u", z: "v", "{": "w", "|": "y", "}": "z", "~": "Έ", "": "■" }, re = { "@": "Ю", A: "А", B: "Б", C: "Ц", D: "Д", E: "Е", F: "Ф", G: "Г", H: "Х", I: "И", J: "Ѝ", K: "К", L: "Л", M: "М", N: "Н", O: "О", P: "П", Q: "Я", R: "Р", S: "С", T: "Т", U: "У", V: "Ж", W: "В", X: "Ь", Z: "З", "[": "Ш", "]": "Щ", "^": "Ч", "`": "ю", a: "а", b: "б", c: "ц", d: "д", e: "е", f: "ф", g: "г", h: "х", i: "и", j: "ѝ", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "я", r: "р", s: "с", t: "т", u: "у", v: "ж", w: "в", x: "ь", z: "з", "{": "ш", "}": "щ", "~": "ч", "": "■" }, oe = { "&": "ы", Y: "Ъ", "\\": "Э", _: "Ы", y: "ъ", "|": "э" }, ne = { "@": "Ч", J: "Ј", Q: "Ќ", V: "В", W: "Ѓ", X: "Љ", Y: "Њ", "[": "Ћ", "\\": "Ж", "]": "Ђ", "^": "Ш", _: "Џ", "`": "ч", j: "ј", q: "ќ", v: "в", w: "ѓ", x: "љ", y: "њ", "{": "ћ", "|": "ж", "}": "ђ", "~": "ш" }, ae = { "&": "ї", Y: "І", "\\": "Є", _: "Ї", y: "і", "|": "є" }, he = { 0: "m", 1: "n", 2: "p", 3: "t", 4: "x", 5: "x", 6: "°", 7: "±", 8: "²", 9: "³", "!": "a", '"': "b", "#": "£", $: "e", "%": "h", "&": "i", "'": "§", "(": ":", ")": "‘", "*": "“", "+": "k", ",": "←", "-": "↑", ".": "→", "/": "↓", ":": "¼", ";": "½", "<": "¾", "=": "÷", ">": "’", "?": "”", "@": " ", A: "̀", B: "́", C: "̂", D: "̃", E: "̄", F: "̆", G: "̇", H: "̈", I: "̣", J: "̊", K: "̧", L: "̲", M: "̋", N: "̨", O: "̌", P: "?", Q: "©", R: "®", S: "¹", T: "ɑ", U: "Ί", V: "Ύ", W: "Ώ", X: "‰", Y: "₠", Z: "™", "[": "⅛", "\\": "⅜", "]": "⅝", "^": "⅞", _: "♪", "`": "C", a: "D", b: "F", c: "G", d: "J", e: "L", f: "Q", g: "R", h: "S", i: "U", j: "V", k: "W", l: "Y", m: "Z", n: "Ά", o: "Ή", p: "c", q: "d", r: "f", s: "g", t: "j", u: "l", v: "q", w: "r", x: "s", y: "u", z: "v", "{": "w", "|": "y", "}": "z", "~": "Έ", "": "■" }, ce = { "#": "£", "&": "ﻰ", "'": "ﻱ", "(": ")", ")": "(", ";": "؛", "<": ">", ">": "<", "?": "؟", "@": "ﺔ", A: "ﺀ", B: "ﺒ", C: "ﺏ", D: "ﺘ", E: "ﺕ", F: "ﺎ", G: "ﺍ", H: "ﺑ", I: "ﺓ", J: "ﺗ", K: "ﺛ", L: "ﺟ", M: "ﺣ", N: "ﺧ", O: "ﺩ", P: "ﺫ", Q: "ﺭ", R: "ﺯ", S: "ﺳ", T: "ﺷ", U: "ﺻ", V: "ﺿ", W: "ﻃ", X: "ﻇ", Y: "ﻋ", Z: "ﻏ", "[": "ﺜ", "\\": "ﺠ", "]": "ﺤ", "^": "ﺨ", _: "#", "`": "ـ", a: "ﻓ", b: "ﻗ", c: "ﻛ", d: "ﻟ", e: "ﻣ", f: "ﻧ", g: "ﻫ", h: "ﻭ", i: "ﻰ", j: "ﻳ", k: "ﺙ", l: "ﺝ", m: "ﺡ", n: "ﺥ", o: "ﻴ", p: "ﻯ", q: "ﻌ", r: "ﻐ", s: "ﻔ", t: "ﻑ", u: "ﻘ", v: "ﻕ", w: "ﻙ", x: "ﻠ", y: "ﻝ", z: "ﻤ", "{": "ﻡ", "|": "ﻨ", "}": "ﻥ", "~": "ﻻ", "": "■" }, Ae = { 0: "٠", 1: "١", 2: "٢", 3: "٣", 4: "٤", 5: "٥", 6: "٦", 7: "٧", 8: "٨", 9: "٩", "!": "ﻉ", '"': "ﺁ", "#": "ﺃ", $: "ﺅ", "%": "ﺇ", "&": "ﺋ", "'": "ﺊ", "(": "ﭼ", ")": "ﭽ", "*": "ﭺ", "+": "ﭘ", ",": "ﭙ", "-": "ﭖ", ".": "ﮊ", "/": "ﮔ", ":": "ﻎ", ";": "ﻍ", "<": "ﻼ", "=": "ﻬ", ">": "ﻪ", "?": "ﻩ", "@": "à", "[": "ë", "\\": "ê", "]": "ù", "^": "î", _: "ﻊ", "`": "é", "{": "â", "|": "ô", "}": "û", "~": "ç", "": "■" }, ge = { "#": "£", "[": "←", "\\": "½", "]": "→", "^": "↑", _: "#", "`": "א", a: "ב", b: "ג", c: "ד", d: "ה", e: "ו", f: "ז", g: "ח", h: "ט", i: "י", j: "ך", k: "כ", l: "ל", m: "ם", n: "מ", o: "ן", p: "נ", q: "ס", r: "ע", s: "ף", t: "פ", u: "ץ", v: "צ", w: "ק", x: "ר", y: "ש", z: "ת", "{": "₪", "|": "‖", "}": "¾", "~": "÷", "": "■" }, le = { 0: "🬏", 1: "🬐", 2: "🬑", 3: "🬒", 4: "🬓", 5: "▌", 6: "🬔", 7: "🬕", 8: "🬖", 9: "🬗", " ": " ", "!": "🬀", '"': "🬁", "#": "🬂", $: "🬃", "%": "🬄", "&": "🬅", "'": "🬆", "(": "🬇", ")": "🬈", "*": "🬉", "+": "🬊", ",": "🬋", "-": "🬌", ".": "🬍", "/": "🬎", ":": "🬘", ";": "🬙", "<": "🬚", "=": "🬛", ">": "🬜", "?": "🬝", "`": "🬞", a: "🬟", b: "🬠", c: "🬡", d: "🬢", e: "🬣", f: "🬤", g: "🬥", h: "🬦", i: "🬧", j: "▐", k: "🬨", l: "🬩", m: "🬪", n: "🬫", o: "🬬", p: "🬭", q: "🬮", r: "🬯", s: "🬰", t: "🬱", u: "🬲", v: "🬳", w: "🬴", x: "🬵", y: "🬶", z: "🬷", "{": "🬸", "|": "🬹", "}": "🬺", "~": "🬻", "": "█" }, Ce = { 0: "", 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", " ": " ", "!": "", '"': "", "#": "", $: "", "%": "", "&": "", "'": "", "(": "", ")": "", "*": "", "+": "", ",": "", "-": "", ".": "", "/": "", ":": "", ";": "", "<": "", "=": "", ">": "", "?": "", "`": "", a: "", b: "", c: "", d: "", e: "", f: "", g: "", h: "", i: "", j: "", k: "", l: "", m: "", n: "", o: "", p: "", q: "", r: "", s: "", t: "", u: "", v: "", w: "", x: "", y: "", z: "", "{": "", "|": "", "}": "", "~": "", "": "" }, de = { 0: "🭇", 1: "🭈", 2: "🭉", 3: "🭊", 4: "🭋", 5: "◢", 6: "🭌", 7: "🭍", 8: "🭎", 9: "🭏", " ": "🬼", "!": "🬽", '"': "🬾", "#": "🬿", $: "🭀", "%": "◣", "&": "🭁", "'": "🭂", "(": "🭃", ")": "🭄", "*": "🭅", "+": "🭆", ",": "🭨", "-": "🭩", ".": "🭰", "/": "▒", ":": "🭐", ";": "🭑", "<": "🭪", "=": "🭫", ">": "🭵", "?": "█", "@": "┷", A: "┯", B: "┝", C: "┥", D: "🮤", E: "🮥", F: "🮦", G: "🮧", H: "🮠", I: "🮡", J: "🮢", K: "🮣", L: "┿", M: "•", N: "●", O: "○", P: "│", Q: "─", R: "┌", S: "┐", T: "└", U: "┘", V: "├", W: "┤", X: "┬", Y: "┴", Z: "┼", "[": "→", "\\": "←", "]": "↑", "^": "↓", _: " ", "`": "🭒", a: "🭓", b: "🭔", c: "🭕", d: "🭖", e: "◥", f: "🭗", g: "🭘", h: "🭙", i: "🭚", j: "🭛", k: "🭜", l: "🭬", m: "🭭", n: null, o: null, p: "🭝", q: "🭞", r: "🭟", s: "🭠", t: "🭡", u: "◤", v: "🭢", w: "🭣", x: "🭤", y: "🭥", z: "🭦", "{": "🭧", "|": "🭮", "}": "🭯", "~": null, "": null }, R = {
  g0_latin: kt,
  g0_latin__czech_slovak: Wt,
  g0_latin__english: zt,
  g0_latin__estonian: jt,
  g0_latin__french: Kt,
  g0_latin__german: qt,
  g0_latin__italian: Xt,
  g0_latin__latvian_lithuanian: Yt,
  g0_latin__polish: Zt,
  g0_latin__portuguese_spanish: Vt,
  g0_latin__romanian: Jt,
  g0_latin__serbian_croatian_slovenian: $t,
  g0_latin__swedish_finnish_hungarian: te,
  g0_latin__turkish: ee,
  g2_latin: _e,
  g0_greek: se,
  g2_greek: ie,
  g0_cyrillic: re,
  g0_cyrillic__russian_bulgarian: oe,
  g0_cyrillic__serbian_croatian: ne,
  g0_cyrillic__ukranian: ae,
  g2_cyrillic: he,
  g0_arabic: ce,
  g2_arabic: Ae,
  g0_hebrew: ge,
  g1_block_mosaic_to_unicode__legacy_computing: le,
  g1_block_mosaic_to_unicode__unscii_separated: Ce,
  g3: de
}, K = {};
class Ee {
  constructor(t) {
    this.type = t.type_, this.flashing = t.flashing_, this.concealed = t.concealed_, this.size = t.size_, this.sextants = t.getSextants_();
  }
}
class lt {
  constructor() {
    this._byte = " ", this._char = " ", this._fgColour = g.WHITE, this._bgColour = g.BLACK, this._type = n.ALPHA_, this._flashing = !1, this._size = d.NORMAL_SIZE_, this._concealed = !1, this._boxed = !1, this._byteHeld = null, this._isCursive = !1, this._diacriticCode = null, this._enhancedChar = null;
  }
  set byte_(t) {
    this._byte = t;
  }
  get byte_() {
    return this._byte;
  }
  set fgColour_(t) {
    this._fgColour = t;
  }
  get fgColour_() {
    return this._fgColour;
  }
  set bgColour_(t) {
    this._bgColour = t;
  }
  get bgColour_() {
    return this._bgColour;
  }
  get isCursive_() {
    return this._isCursive;
  }
  setMappedChar_(t) {
    const e = this._type, _ = this._byte;
    if (fe(e, _)) {
      if (this._char = F(_, t), this._diacriticCode > 0) {
        const s = String.fromCharCode(this._diacriticCode + 64);
        this._char += R.g2_latin[s];
      }
      t.includes("arabic") && (this._isCursive = H.isCursive_(this._char));
    } else
      this._char = Ie(e, _);
    this._byteHeld = null;
  }
  setSpace_(t) {
    if ((this._type == n.MOSAIC_CONTIGUOUS_ || this._type == n.MOSAIC_SEPARATED_) && t.active_) {
      this._byteHeld = t.char_, this._type = t.type_;
      let e = "g1_block_mosaic_to_unicode__legacy_computing";
      this._type == n.MOSAIC_SEPARATED_ && (e = "g1_block_mosaic_to_unicode__unscii_separated"), this._char = F(t.char_, e);
    } else
      this._byteHeld = null, this._char = " ";
  }
  get char_() {
    return this._char;
  }
  get type_() {
    return this._type;
  }
  set type_(t) {
    this._type = t;
  }
  set flashing_(t) {
    this._flashing = t;
  }
  get flashing_() {
    return this._flashing;
  }
  get size_() {
    return this._size;
  }
  set size_(t) {
    this._size = t;
  }
  set concealed_(t) {
    this._concealed = t;
  }
  get concealed_() {
    return this._concealed;
  }
  set boxed_(t) {
    this._boxed = t;
  }
  get boxed_() {
    return this._boxed;
  }
  // used in rendering to distinguish burn-through characters in G1 set
  // (should get type_ handle this instead?)
  isMosaicByte_() {
    const t = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
    return t <= 127 && (t & 32) == 32;
  }
  // used in page model to keep track of mosaic to hold 
  isMosaic_() {
    const t = this._byte.charCodeAt(0);
    return (this._type == n.MOSAIC_CONTIGUOUS_ || this._type == n.MOSAIC_SEPARATED_) && t <= 127 && (t & 32) == 32;
  }
  getSextants_() {
    const t = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
    if (t > 127) return null;
    if (t in K) return K[t];
    const e = t >= 96 ? t - 64 : t - 32, _ = [];
    for (let s = 0; s < 6; s++)
      _.push(e & 1 << s ? "1" : "0");
    return K[t] = _, _;
  }
}
class ue extends lt {
  constructor(t) {
    super(), Object.assign(this, t);
  }
  set diacritic_(t) {
    this._diacriticCode = t;
  }
  get diacritic_() {
    return this._diacriticCode;
  }
  set enhancedChar_(t) {
    this._enhancedChar = t;
  }
  get char_() {
    return this._enhancedChar == null ? this._char : this._enhancedChar;
  }
}
function F(r, t) {
  if (!(t in R)) throw new Error(`Cell getCharWithEncoding: bad encoding: ${t}`);
  if (r in R[t]) return R[t][r];
  const e = t.match(/^(.+)__/);
  if (e != null) {
    const _ = e[1];
    if (r in R[_])
      return R[t][r] = R[_][r], R[_][r];
  }
  return r;
}
function fe(r, t) {
  const e = r === n.ALPHA_, _ = r === n.MOSAIC_CONTIGUOUS_ || r === n.MOSAIC_SEPARATED_, s = (t.charCodeAt(0) & 32) == 0;
  return e || _ && s;
}
function Ie(r, t) {
  switch (r) {
    case n.MOSAIC_CONTIGUOUS_:
      return F(t, "g1_block_mosaic_to_unicode__legacy_computing");
    case n.MOSAIC_SEPARATED_:
      return F(t, "g1_block_mosaic_to_unicode__unscii_separated");
    case n.G3_:
      return F(t, "g3");
    default:
      return null;
  }
}
class ht extends C {
  constructor(t, e, _) {
    super(t, _), this._webkitCompat = e, this._mosaicSymbols = /* @__PURE__ */ new Set(), console.debug("VectorViewGraphicMosaic constructed");
  }
  _createDisplay() {
    super._createDisplay(), this._graphicrows = [], this._graphicLayer = this.d.group_();
  }
  _resetRow(t) {
    super._resetRow(t), this._resetGraphicRow(t);
  }
  _renderCell(t, e, _, s, i, a, A) {
    "_background" in this._plugins && this._plugins._background(a, i, e.size_, e.bgColour_), e.type_ == n.ALPHA_ || e.type_ == n.G3_ || !A ? (this._renderText(t, e, _, s, i, a), e.type_ == n.G3_ && t.addClass_("mosaic")) : A && (t.plain_(" ").attr_(_), this._renderMosaic(a, i, e, s));
  }
  _renderMosaic(t, e, _, s) {
    if ("_mosaic" in this._plugins) {
      const u = new Ee(_);
      if (this._plugins._mosaic(t, e, u, s)) return;
    }
    const i = _.getSextants_();
    if (!i.includes("1")) return;
    const a = (_.type_ == n.MOSAIC_CONTIGUOUS_ ? "c" : "s") + i.join("");
    let A = C._CELL_WIDTH, E = C._CELL_HEIGHT;
    if (_.type_ == n.MOSAIC_CONTIGUOUS_ && (A = C._CELL_WIDTH + 0.3, E = C._CELL_HEIGHT + 0.2), !this._mosaicSymbols.has(a)) {
      this._mosaicSymbols.add(a);
      const u = this._svg.symbol_(a);
      if (_.type_ == n.MOSAIC_CONTIGUOUS_) {
        u.attr_({
          preserveAspectRatio: "none",
          width: A,
          // FUDGE cell is bigger than it should be
          height: E,
          // to close tiny gaps on Chromecast
          viewBox: "0 0 12 18"
        });
        for (let c = 0; c < 6; c++)
          i[c] == "1" && u.rect_(6, 6).move_(c % 2 * 6, Math.floor(c / 2) * 6);
      } else {
        u.attr_({
          preserveAspectRatio: "none",
          width: A,
          height: E,
          viewBox: "0 0 12 18"
        });
        for (let c = 0; c < 6; c++)
          i[c] == "1" && u.rect_(4, 4).move_(c % 2 * 6 + 1, Math.floor(c / 2) * 6 + 2);
      }
    }
    let I;
    _.type_ == n.MOSAIC_CONTIGUOUS_ ? I = this._graphicrows[t].use_(a).move_(e * C._CELL_WIDTH - 0.15, t * C._CELL_HEIGHT - 0.1).fill_(s) : I = this._graphicrows[t].use_(a).move_(e * C._CELL_WIDTH, t * C._CELL_HEIGHT).fill_(s), this._webkitCompat && I.attr_({ width: A, height: E }), (_.size_ == d.DOUBLE_HEIGHT_ || _.size_ == d.DOUBLE_SIZE_) && I.attr_("height", C._CELL_DOUBLE_HEIGHT), (_.size_ == d.DOUBLE_WIDTH_ || _.size_ == d.DOUBLE_SIZE_) && I.attr_("width", C._CELL_DOUBLE_WIDTH), _.flashing_ && I.addClass_("flash"), _.concealed_ && I.addClass_("conceal");
  }
  _resetGraphicRow(t) {
    this._graphicrows[t] && this._graphicrows[t].remove_(), this._graphicrows[t] = this._graphicLayer.group_();
  }
  _getCellAttr(t, e, _) {
    return t == n.G3_ ? {
      dx: C._MOSAIC_METRIC._contiguous._DX,
      dy: -0.15,
      textLength: C._MOSAIC_METRIC._contiguous._textLength,
      lengthAdjust: "spacingAndGlyphs",
      "text-anchor": "start",
      transform: null,
      class: null
    } : {
      dx: null,
      dy: null,
      textLength: _ ? C._CELL_WIDTH : null,
      lengthAdjust: _ ? "spacingAndGlyphs" : null,
      "text-anchor": null,
      transform: null,
      class: null
    };
  }
}
class Be {
  constructor(t) {
    this._model = t, this._x = 0, this._y = 0, this._data = [];
  }
  // printPos() {
  //     console.log(this._x, this._y);
  //     return this;
  // }
  pos(t, e) {
    return t = parseInt(t), e = parseInt(e), t < 0 || t > 39 ? this : e < 0 || e > 24 ? this : (this._x = t, this._y = e, this);
  }
  putG0(t, e) {
    let _ = null;
    if (typeof e < "u") {
      const i = parseInt(e);
      i >= 0 && i <= 15 && (_ = i);
    }
    const s = t.charCodeAt(0);
    return s < 32 || s > 127 ? this : (this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g0",
      char_: t,
      diacritic_: _
    }), this);
  }
  putG1(t) {
    const e = t.charCodeAt(0);
    return e < 32 || e > 127 ? this : (this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g1",
      char_: t
    }), this);
  }
  putG2(t) {
    const e = t.charCodeAt(0);
    return e < 32 || e > 127 ? this : (this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g2",
      char_: t
    }), this);
  }
  putG3(t) {
    const e = t.charCodeAt(0);
    return e < 32 || e > 127 ? this : (this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "g3",
      char_: t
    }), this);
  }
  putAt() {
    return this._data.push({
      x_: this._x,
      y_: this._y,
      type_: "char",
      char_: "@"
    }), this;
  }
  end() {
    return this._model.enhance_(this._data), this._model.notify_(), this;
  }
}
class pe extends C {
}
const ct = ["SPLASH", "ENGINEERING", "ADVERT", "UK"];
class Se {
  constructor(t, e) {
    if (this._windowDom = null, typeof window == "object" && (this._windowDom = window), this._opt = {
      webkitCompat_: !0
      // generate SVG that's compatible with webkit by default. The resulting SVG is larger
    }, typeof e == "object" && ("webkitCompat" in e && !e.webkitCompat && (this._opt.webkitCompat_ = !1), "dom" in e && (this._windowDom = e.dom)), this._windowDom == null)
      throw new Error("TeletextController E24: No window dom object available");
    this._view = new ht(t, this._opt.webkitCompat_, this._windowDom), this._model = t, this._levelIndex = 1, this._testPageIndex = 0, this._initEventHandlers(), this._viewSelector = null, this._height = null, this._posX = 0, this._posY = 0, this._font = null, console.debug("TeletextController constructed");
  }
  setRowFromOutputLine(t, e) {
    const _ = H.decodeOutputLine_(e);
    this._model.setRowFromChars_(t, _);
  }
  setRow(t, e) {
    this._model.setRowFromChars_(t, e);
  }
  setPageFromOutputLines(t, e) {
    const _ = H.getRowsFromOutputLines_(t);
    typeof e < "u" && (_[0] = this._processHeader(e)), this.setPageRows(_);
  }
  setPageRows(t) {
    this._model.clearEnhancements_(), this._model.setRows_(t);
  }
  _processHeader(t) {
    return t = H.decodeOutputLine_(t), t.join("").substring(0, 32).padStart(40, " ");
  }
  showTestPage() {
    this.loadPageFromEncodedString(pt[ct[this._testPageIndex]]), this._testPageIndex++, this._testPageIndex == ct.length && (this._testPageIndex = 0);
  }
  showRandomisedPage() {
    const t = [];
    for (let e = 0; e < 25; e++) {
      const _ = [];
      for (let s = 0; s < 40; s++)
        _.push(String.fromCharCode(Math.random() * 127));
      t.push(_.join(""));
    }
    this.setPageRows(t);
  }
  loadPageFromEncodedString(t, e) {
    const _ = H.decodeBase64URLEncoded_(t, this._windowDom.atob);
    typeof e < "u" && (_[0] = this._processHeader(e)), this.setPageRows(_);
  }
  _initEventHandlers() {
    this._windowDom.addEventListener("ttx.reveal", () => this._view.reveal_()), this._windowDom.addEventListener("ttx.mix", () => this._view.mixMode_()), this._windowDom.addEventListener("ttx.subtitlemode", () => this._view.boxMode_());
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
  setLevel(t) {
    this._model.setLevel_(t);
  }
  addTo(t) {
    this._selector = t, this._view.addTo_(t);
  }
  setFont(t) {
    this._font = t, this._view.setFont_(t);
  }
  clearScreen(t) {
    this._model.clearEnhancements_(), this._model.clearScreen_(t);
  }
  setAspectRatio(t) {
    if (t == "natural") {
      this._view.setAspectRatio_(t);
      return;
    }
    const e = parseFloat(t);
    if (Number.isNaN(e)) throw new Error("E80 setAspectRatio: bad number");
    this._view.setAspectRatio_(e);
  }
  setHeight(t) {
    const e = parseFloat(t);
    if (Number.isNaN(e)) throw new Error("E98 setHeight: bad number");
    this._view.setHeight_(e), this._height = e;
  }
  setDefaultG0Charset(t, e) {
    if (t.match(/g0_/) == null) throw new Error("E130 setDefaultG0Charset: Bad g0 set");
    this._model.setPrimaryG0CharacterEncoding_(t, e);
  }
  setSecondG0Charset(t, e) {
    if (t.match(/g0_/) == null) throw new Error("E136 setSecondG0Charset: Bad g0 set");
    this._model.setSecondaryG0CharacterEncoding_(t, e);
  }
  setG2Charset(t, e) {
    if (t.match(/g2_/) == null) throw new Error("E142 setG2Charset: Bad g2 set");
    this._model.setG2CharacterEncoding_(t, e);
  }
  remove() {
    if (this._view.detach_(), this._selector) {
      const t = this._windowDom.document.querySelector(this._selector);
      t && t.removeChild(t.firstChild);
    }
    this._view = null;
  }
  setView(t) {
    switch (this.remove(), t) {
      case "classic__font-for-mosaic":
        this._view = new pe(this._model, this._windowDom);
        break;
      case "classic__graphic-for-mosaic":
        this._view = new ht(this._model, this._opt.webkitCompat_, this._windowDom);
        break;
      default:
        throw new Error("setView E126: bad view name:" + t);
    }
    this._height && this._view.setHeight_(this._height), this._font && this._view.setFont_(this._font), this._selector && this._view.addTo_(this._selector), this._model.notify_();
  }
  registerViewPlugin(t) {
    t.registerWithView(this._view), this._model.notify_();
  }
  enhance() {
    return new Be(this._model);
  }
  writeBytes(t, e, _) {
    this._model.writeBytes_(t, e, _);
  }
  writeByte(t, e, _, s) {
    this._model.writeByte_(t, e, _, s);
  }
  plot(t, e) {
    this._model.plot_(t, e);
  }
  plotPoints(t, e, _, s) {
    this._model.plotPoints_(t, e, _, s);
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
class Qe {
  constructor(t) {
    this._sender = t, this._listeners = [];
  }
  attach_(t) {
    return this._listeners.push(t), this._listeners.length - 1;
  }
  notify_(t) {
    this._listeners.forEach((e) => e != null && e(this._sender, t));
  }
  detach_(t) {
    this._listeners[t] = null;
  }
}
class be {
  constructor() {
    this._doubleHeight = !1, this._cells = [];
  }
  get doubleHeight_() {
    return this._doubleHeight;
  }
  set doubleHeight_(t) {
    this._doubleHeight = t;
  }
  addCell_(t) {
    this._cells.push(t);
  }
  getCell_(t) {
    if (t >= this._cells.length) throw new Error("RowModel.getCell E20 bad cell index");
    return this._cells[t];
  }
}
const m = 25, b = 40, ye = "g0_latin", xe = "g2_latin", me = [Q[1.5], Q[2.5]], we = "Q[\\]";
class Le {
  constructor() {
    this._screen = [];
    for (let t = 0; t < m; t++) {
      const e = [];
      for (let _ = 0; _ < b; _++)
        e.push(new lt());
      this._screen.push(e);
    }
    this._primaryG0CharacterEncoding = ye, this._secondaryG0CharacterEncoding = null, this._g2CharacterEncoding = xe, this._startBoxChar = h.charFromAttribute(h.START_BOX), this._endBoxChar = h.charFromAttribute(h.END_BOX), this._level = Q[1], this._enhancement = [], this.onSet_ = new Qe(this), console.debug("PageModel constructed");
  }
  notify_() {
    this.onSet_.notify_();
  }
  setRowFromChars_(t, e) {
    if (t >= m)
      throw new Error("PageModel E29 bad row number");
    this._setRowFromChars(t, e), this.onSet_.notify_();
  }
  setRows_(t) {
    t = t.slice(0, m), t.forEach((e, _) => {
      this._setRowFromChars(_, e);
    }), this.onSet_.notify_();
  }
  writeBytes_(t, e, _) {
    for (let s = e, i = 0; s < m && i < _.length; s++, i++) {
      const a = [..._[i]].slice(0, b - t);
      for (let A = t, E = 0; A < b && E < a.length; A++, E++)
        this._screen[s][A].byte_ = a[E];
    }
    this.onSet_.notify_();
  }
  writeByte_(t, e, _, s) {
    t >= 0 && t < b && e >= 0 && e < m && (this._screen[e][t].byte_ = _), typeof s < "u" && s && this.onSet_.notify_();
  }
  // Plots a pixel in a g1 mosaic at the co-ordinates
  // Control codes aren't overriden
  // Existing mosaics are modified
  // Non mosaics are replaced with a new mosaic
  plot_(t, e, _) {
    const s = Math.floor(e / 3), i = Math.floor(t / 2), A = this._screen[s][i]._byte.charCodeAt(0);
    if (A < 32 || (_ ? A == 32 : A == 255)) return;
    const E = t - i * 2, I = e - s * 3, u = E + I * 2;
    let c = 0;
    A < 64 ? c = A - 32 : A >= 96 && (c = A - 64), _ ? c &= ~(1 << u) : c |= 1 << u;
    const O = c >= 32 ? c + 64 : c + 32;
    this._screen[s][i]._byte = String.fromCharCode(O);
  }
  plotPoints_(t, e, _, s) {
    let i = 0, a = 0;
    for (let A = 0; A < s.length && e + i < m * 3; A++)
      t + a < b * 2 && (s[i * _ + a] == 255 ? this.plot_(t + a, e + i) : this.plot_(t + a, e + i, !0)), a++, a == _ && (i++, a = 0);
  }
  _setRowFromChars(t, e) {
    let _ = [...e];
    if (_ = _.slice(0, b), _.forEach((s, i) => {
      const a = s.charCodeAt(0);
      if (Number.isNaN(a) || a > 127)
        throw new Error(`PageModel E51 failed to write row: bad character code (${a}) at row ${t} col ${i}`);
      this._screen[t][i].byte_ = s;
    }), _.length < b)
      for (let s = _.length; s < b; s++)
        this._screen[t][s].byte_ = " ";
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
  setLevel_(t) {
    this._level = t, console.debug("PageModel.setLevel: switching to Level", t), console.debug("new level: ", this._level), this.onSet_.notify_();
  }
  clearScreen_(t) {
    if (typeof t < "u" ? t : !0) {
      const _ = [];
      for (let s = 0; s < m; s++)
        _.push("");
      this.setRows_(_);
    } else
      for (let _ = 0; _ < m; _++)
        this._setRowFromChars(_, "");
  }
  setPrimaryG0CharacterEncoding_(t, e) {
    this._primaryG0CharacterEncoding = t;
    const _ = t.match(/^g0_([a-z]+)/);
    if (_ != null) {
      const s = `g2_${_[1]}`;
      s in R ? this._g2CharacterEncoding = s : _[1] == "hebrew" && (this._g2CharacterEncoding = "g2_arabic");
    }
    console.debug("PageModel.setPrimaryG0CharacterEncoding: set default g0 encoding to", t, "with g2 encoding to", this._g2CharacterEncoding), e && this.onSet_.notify_();
  }
  setSecondaryG0CharacterEncoding_(t, e) {
    this._secondaryG0CharacterEncoding = t, console.debug("PageModel.setSecondaryG0CharacterEncoding: set second g0 encoding to", t), e && this.onSet_.notify_();
  }
  setG2CharacterEncoding_(t, e) {
    this._g2CharacterEncoding = t, console.debug("PageModel.setG2CharacterEncoding: set g2 encoding to", t), e && this.onSet_.notify_();
  }
  getRow_(t) {
    if (t >= m)
      throw new Error("PageModel.getRow E42 bad rowNum");
    const e = new be();
    let _, s, i = n.ALPHA_, a = g.WHITE, A = !1, E = d.NORMAL_SIZE_, I = !1, u = !1, c = !1, O = !1, G = g.BLACK, v = n.MOSAIC_CONTIGUOUS_, l = {
      active_: !1,
      char_: " ",
      type_: n.MOSAIC_CONTIGUOUS_
    }, $ = [];
    return me.includes(this._level) && ($ = this._enhancement.filter((o) => o.y_ == t)), this._screen[t].forEach((o, N) => {
      const tt = o.byte_, U = Rt(this._level, tt);
      switch (_ = a, o.type_ = i, o.boxed_ = O, s = I, U.attribute_ != h.STEADY && (o.flashing_ = A), U.attribute_ != h.NORMAL_SIZE && (o.size_ = E), U.attribute_ != h.CONCEAL && (o.concealed_ = u), c && (U.attribute_ != h.HOLD_MOSAICS && (l.active_ = !1, l.char_ = " "), c = !1), U.attribute_) {
        case h.TEXT_COLOUR:
          i = n.ALPHA_, a = U.colour_, u = !1, o.setSpace_(l);
          break;
        case h.MOSAIC_COLOUR:
          i = v, a = U.colour_, u = !1, o.setSpace_(l);
          break;
        case h.NEW_BACKGROUND:
          G = _, o.setSpace_(l);
          break;
        case h.BLACK_BACKGROUND:
          G = g.BLACK, o.setSpace_(l);
          break;
        case h.CONTIGUOUS_GRAPHICS:
          v = n.MOSAIC_CONTIGUOUS_, o.type_ == n.MOSAIC_SEPARATED_ && (o.type_ = n.MOSAIC_CONTIGUOUS_), i == n.MOSAIC_SEPARATED_ && (i = n.MOSAIC_CONTIGUOUS_), o.setSpace_(l);
          break;
        case h.SEPARATED_GRAPHICS:
          v = n.MOSAIC_SEPARATED_, o.type_ == n.MOSAIC_CONTIGUOUS_ && (o.type_ = n.MOSAIC_SEPARATED_), i == n.MOSAIC_CONTIGUOUS_ && (i = n.MOSAIC_SEPARATED_), o.setSpace_(l);
          break;
        case h.ESC:
          this._secondaryG0CharacterEncoding && (I = !s), o.setSpace_(l);
          break;
        case h.FLASH:
          A = !0, o.setSpace_(l);
          break;
        case h.STEADY:
          o.flashing_ = !1, A = !1, o.setSpace_(l);
          break;
        case h.NORMAL_SIZE:
          o.size_ = d.NORMAL_SIZE_, E = d.NORMAL_SIZE_, o.setSpace_(l);
          break;
        case h.DOUBLE_HEIGHT:
          E = d.DOUBLE_HEIGHT_, e.doubleHeight_ = !0, o.setSpace_(l);
          break;
        case h.DOUBLE_WIDTH:
          E = d.DOUBLE_WIDTH_, o.setSpace_(l);
          break;
        case h.DOUBLE_SIZE:
          E = d.DOUBLE_SIZE_, e.doubleHeight_ = !0, o.setSpace_(l);
          break;
        case h.CONCEAL:
          o.concealed_ = !0, u = !0, o.setSpace_(l);
          break;
        case h.HOLD_MOSAICS:
          l.active_ = !0, o.setSpace_(l);
          break;
        case h.RELEASE_MOSAICS:
          c = !0, o.setSpace_(l);
          break;
        case h.START_BOX:
          N >= 1 && this._screen[t][N - 1].byte_ == this._startBoxChar && (o.boxed_ = !0, O = !0), o.setSpace_(l);
          break;
        case h.END_BOX:
          N + 1 < b && this._screen[t][N + 1].byte_ == this._endBoxChar && (O = !1), o.setSpace_(l);
          break;
        case h.UNKNOWN_:
          o.setSpace_(l);
          break;
        default:
          s ? o.setMappedChar_(this._secondaryG0CharacterEncoding) : o.setMappedChar_(this._primaryG0CharacterEncoding), o.isMosaic_() && (l.char_ = tt, l.type_ = o.type_);
      }
      o.fgColour_ = _, o.bgColour_ = G, $.filter((B) => B.x_ == N).forEach((B) => {
        o = new ue(o), B.type_ == "g0" ? (o.byte_ = B.char_, o.diacritic_ = B.diacritic_, o.type_ = n.ALPHA_, this._primaryG0CharacterEncoding.includes("latin") ? o.setMappedChar_("g0_latin") : o.setMappedChar_(this._primaryG0CharacterEncoding)) : B.type_ == "g1" ? this._level == Q[2.5] && (o.byte_ = B.char_, o.type_ = v, this._primaryG0CharacterEncoding.includes("latin") ? o.setMappedChar_("g0_latin") : o.setMappedChar_(this._primaryG0CharacterEncoding)) : B.type_ == "g2" ? (o.byte_ = B.char_, o.type_ = n.ALPHA_, o.setMappedChar_(this._g2CharacterEncoding)) : B.type_ == "g3" ? this._isAllowedG3Char(B.char_) && (o.byte_ = B.char_, o.type_ = n.G3_, o.setMappedChar_()) : B.type_ == "char" && (o.enhancedChar_ = B.char_, o.type_ = n.ALPHA_);
      }), e.addCell_(o);
    }), e;
  }
  enhance_(t) {
    this._enhancement = t;
  }
  clearEnhancements_() {
    this._enhancement = [];
  }
  getBytes_() {
    const t = new Uint8Array(m * b);
    return this._screen.forEach((e, _) => {
      e.forEach((s, i) => {
        t[_ * b + i] = s.byte_.charCodeAt(0);
      });
    }), t;
  }
  _isAllowedG3Char(t) {
    return !(this._level == Q[1.5] && we.indexOf(t) == -1);
  }
}
const Oe = /* @__PURE__ */ new Le();
function De(r) {
  return new Se(Oe, r);
}
export {
  h as Attributes,
  g as Colour,
  Q as Level,
  De as Teletext
};
//# sourceMappingURL=teletext.js.map
