"use strict";

// const code = "@".charCodeAt(0);
// console.log(code.toString(2));


const msbBits = [..."@".charCodeAt(0).toString(2).padStart(8, '0')].reverse();
let msbCode = 0;
for (let bit = 0; bit < 8; bit++) {
    msbCode += msbBits[bit] * Math.pow(2, 7-bit);
}
// const binCode = code.toString(2).padStart(8, '0');

console.log(msbCode.toString(2));



// let msbCode = 0;
// msbCode += (code & 0b10000000) >> 7;  //  2^7
// msbCode += (code & 0b01000000) >> 5;  //  2^6
// msbCode += (code & 0b00100000) >> 3;  //  2^5
// msbCode += (code & 0b00010000) >> 1;  //  2^4
// msbCode += (code & 0b00001000) << 1;  //  2^3
// msbCode += (code & 0b00000100) << 3;  //  2^2
// msbCode += (code & 0b00000010) << 5;  //  2^1
// msbCode += (code & 0b00000001) << 7;  //  2^0

// console.log(msbCode.toString(2));
// console.log(msbCode);


// function reverse8bit