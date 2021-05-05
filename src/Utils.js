// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

import Uint1Array from 'uint1array';

// Arabic chars in initial, medial or final form are cursive
const CURSIVE_CHARS = "ﻰﺋﺊﭼﭽﭘﭙﮔﻎﻼﻬﻪﻊﺔﺒﺘﺎﺑﺗﺛﺟﺣﺧﺳﺷﺻﺿﻃﻇﻋﻏﺜﺠﺤﺨـﻓﻗﻛﻟﻣﻧﻫﻰﻳﻴﻌﻐﻔﻘﻠﻤﻨ";

export class Utils {

    // "base64url" encoding defined here https://tools.ietf.org/html/rfc4648
    // the packed data format is from https://github.com/rawles/edit.tf
    // returns a Uint1Array
    static decodeBase64URLEncoded_(input, atob) {
        // adjust the input before passing to atob
        input = input.replace(/-/g, '+').replace(/_/g, '/');
        const pad = input.length % 4;
        if (pad) {
            if (pad === 1) throw new Error('Utils.decodeBase64URLEncoded E16: Input base64url string is the wrong length to determine padding');
            input += new Array(5-pad).join('=');
        }
        const packed = atob(input);

        // FUDGE as Unit8Array.set stores LSB first but we want MSB first in the bit array, getMsbCode reverses the bits
        const msbCodes = [...packed].map(c => getMsbCode(c));
        
        const buffer = new ArrayBuffer(msbCodes.length);
        const bytes = new Uint8Array(buffer);
        bytes.set(msbCodes);
        const bits = new Uint1Array(buffer);

        return getUnpackedData(bits);
    }

    // Output Line format from .tti file format https://zxnet.co.uk/teletext/documents/ttiformat.pdf
    static decodeOutputLine_(line) {
        const decoded = [];
        let decodeNextChar = false;
        for (const c of [...line]) {
            const code = c.charCodeAt(0);
            if (code == 27) { // ESC
                decodeNextChar = true;
            } else if (code >= 0x80) {
                const char = String.fromCharCode(code - 0x80);
                decoded.push(char);
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


    static getRowsFromOutputLines_(lines) {
        const rows = [];
        const regEx = /^OL,(\d{1,2}),(.+)/
        for (const line of [...lines]) {
            const matches = line.match(regEx);
            if (matches != null) {
                rows[matches[1]] = Utils.decodeOutputLine_(matches[2]);
            } else {
                console.warn('E66 getRowsFromOutputLines_: bad line', line);
            }
        }
        return rows;
    }

    static isCursive_(char) {
        return CURSIVE_CHARS.indexOf(char) != -1;
    }
}

const msbCodes = {};

// get charCode for a char with the bit significance reversed
function getMsbCode(char) {
    if (char in msbCodes) return msbCodes[char];
    
    const msbBits = [...char.charCodeAt(0).toString(2).padStart(8, '0')].reverse();
    msbCodes[char] = Number.parseInt(msbBits.join(''), 2); 
    return msbCodes[char];
}

// or is this better?
// function getMsbCode(char) {
//     if (char in msbCodes) return msbCodes[char];

//     const code = char.charCodeAt(0);
//     msbCodes[char] =
//               ((code & 0b10000000) >> 7)
//             + ((code & 0b01000000) >> 5)
//             + ((code & 0b00100000) >> 3)
//             + ((code & 0b00010000) >> 1)
//             + ((code & 0b00001000) << 1)
//             + ((code & 0b00000100) << 3)
//             + ((code & 0b00000010) << 5)
//             + ((code & 0b00000001) << 7);
//     return msbCodes[char];
// }


function getUnpackedData(bitArray) {
    // const firstBitIndex = (280 * row) + (7 * col);
    const page = [];

    for (let r = 0; r < 25; r++) {
        const rowChars = [];
        for (let c = 0; c < 40; c++) {
            let bitSignificance = 6;
            let charCode = 0;
            const firstBitIndex = (280 * r) + (7 * c);
            for (let bit = firstBitIndex; bit < firstBitIndex + 7; bit++) {
                charCode += bitArray[bit] * Math.pow(2, bitSignificance);
                bitSignificance--;
            }
            rowChars.push(String.fromCharCode(charCode));
        }
        page.push(rowChars.join(''));
    }
    return page;
}
