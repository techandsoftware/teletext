import Uint1Array from 'uint1array';

export class Utils {

    // "base64url" encoding defined here https://tools.ietf.org/html/rfc4648
    // the packed data format is from https://github.com/rawles/edit.tf
    // returns a Uint1Array
    static decodeBase64URLEncoded(input) {
        // adjust the input before passing to atob
        input = input.replace(/-/g, '+').replace(/_/g, '/');
        const pad = input.length % 4;
        if (pad) {
            if (pad === 1) throw new Error('Utils.decodeBase64URL: Input base64url string is the wrong length to determine padding');
            input += new Array(5-pad).join('=');
        }

        
        const packed = atob(input);
        // let bitArray = [];
        // packed.forEach(c => {
            // const bits = c.charCodeAt(0).toString(2);
            // bitArray = bitArray.concat([]...bits);
        // })


        // as Unit8Array stores LSB first but we want MSB first we need to deal with that
        // const msbCodes = [...packed].map(c => getMsbCode(c));
        // const codes =    [...packed].map(c => c.charCodeAt(0));
        const msbCodes = [...packed].map(c => getMsbCode(c));
        
        // console.log(codes);
        // console.log(msbCodes);
        // debugger;

        // const buffer1 = new ArrayBuffer(msbCodes.length);
        // const bytes1 = new Uint8Array(buffer1);
        // bytes1.set(codes);
        // const bits1 = new Uint1Array(buffer1);

        const buffer = new ArrayBuffer(msbCodes.length);
        const bytes = new Uint8Array(buffer);
        bytes.set(msbCodes);
        const bits2 = new Uint1Array(buffer);


        // debugger;

        // const buffer2 = new ArrayBuffer(1);
        // const byte2 = new Uint8Array(buffer2);
        // byte2.set([64])
        // const bits2 = new Uint1Array(buffer2);
        // debugger;

        return Utils.getUnpackedData(bits2);
    }

    static getUnpackedData(bitArray) {
        // const firstBitIndex = (280 * row) + (7 * col);
        const page = [];

        for (let r = 0; r < 25; r++) {
            const rowChars = [];
            for (let c = 0; c < 40; c++) {
                let bitSignificance = 6;
                let charCode = 0;
                const firstBitIndex = (280 * r) + (7 * c);
                // console.log(r, c, bitArray.slice(firstBitIndex, firstBitIndex+7).toString());
                // debugger;
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

    
}

const msbCodes = {};

// get charCode for a char with the bit significance reversed
function getMsbCode(char) {
    if (char in msbCodes) return msbCodes[char];
    
    const msbBits = [...char.charCodeAt(0).toString(2).padStart(8, '0')].reverse();
    let msbCode = 0;
    for (let bit = 0; bit < 8; bit++) {
        msbCode += msbBits[bit] * Math.pow(2, 7-bit);
    }
    msbCodes[char] = msbCode;
    return msbCode;
}

// or is this better?
// msbCode += (code & 0b10000000) >> 7;  //  2^7
// msbCode += (code & 0b01000000) >> 5;  //  2^6
// msbCode += (code & 0b00100000) >> 3;  //  2^5
// msbCode += (code & 0b00010000) >> 1;  //  2^4
// msbCode += (code & 0b00001000) << 1;  //  2^3
// msbCode += (code & 0b00000100) << 3;  //  2^2
// msbCode += (code & 0b00000010) << 5;  //  2^1
// msbCode += (code & 0b00000001) << 7;  //  2^0
