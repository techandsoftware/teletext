// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

// Arabic chars in initial, medial or final form are cursive
const CURSIVE_CHARS = "ﻰﺋﺊﭼﭽﭘﭙﮔﻎﻼﻬﻪﻊﺔﺒﺘﺎﺑﺗﺛﺟﺣﺧﺳﺷﺻﺿﻃﻇﻋﻏﺜﺠﺤﺨـﻓﻗﻛﻟﻣﻧﻫﻰﻳﻴﻌﻐﻔﻘﻠﻤﻨ";

// "base64url" encoding defined here https://tools.ietf.org/html/rfc4648
// the packed data format is from https://github.com/rawles/edit.tf
export function decodeBase64URLEncoded_(input) {
        // convert URL-encoded to real base 64
        input = input.replace(/-/g, '+').replace(/_/g, '/');
        const pad = input.length % 4;
        if (pad) {
            if (pad === 1) throw new Error('Utils.decodeBase64URLEncoded E16: Input base64url string is the wrong length to determine padding');
            input += new Array(5 - pad).join('=');
        }
        const data = atob(input); // MSB first

        // convert octets to rows of 7 bit chars
        const rows = [];
        let row = [];
        for (const val of dataTo7Bits(data)) {
            row.push(String.fromCharCode(val));
            if (row.length == 40) {
                rows.push(row.join(''));
                row = [];
            }
        }
        if (row.length < 40)
            rows.push(row.join(''));

        return rows;
    }

// Output Line format from .tti file format https://zxnet.co.uk/teletext/documents/ttiformat.pdf
export function decodeOutputLine_(line) {
        const decoded = [];
        let decodeNextChar = false;
        for (const c of [...line]) {
            const code = c.charCodeAt(0);
            if (code == 27) { // ESC
                decodeNextChar = true;
            } else if (code >= 0x80 && code <= 0x9f) {
                const char = String.fromCharCode(code - 0x80);
                decoded.push(char);
                decodeNextChar = false;
            } else if (code >= 0xa0) {
                console.warn('W47 decodeOutputLine: bad character:', c);
                decoded.push('\x7f');
                decodeNextChar = false;
            } else if (decodeNextChar) {
                const char = String.fromCharCode(code - 0x40);
                decoded.push(char);
                decodeNextChar = false;
            } else {
                decoded.push(c);
            }
        }
        return decoded;
    }

export function getRowsFromOutputLines_(lines) {
    const rows = [];
    const regEx = /^OL,(\d{1,2}),(.*)/
    for (const line of [...lines]) {
        const matches = line.match(regEx);
        if (matches != null) {
            rows[matches[1]] = decodeOutputLine_(matches[2]);
        } else {
            console.warn('E66 getRowsFromOutputLines_: bad line', line);
        }
    }
    return rows;
}

export function isCursive_(char) {
    return CURSIVE_CHARS.indexOf(char) != -1;
}


// private functions

function intToBits(n) {
    let bits = [];
    for (let b = 7; b >= 0; b--) {
        bits.push(n & (1 << b) ? 1 : 0);
    }
    return bits;
}

// unpacks MSB-first 8-bit bytes to 7-bit bytes
//   01000000 10000001 00000001 ...
// = 0100000 0100000 0100000 01...
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
