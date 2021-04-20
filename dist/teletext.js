// SPDX-FileCopyrightText: (c) 2021 Tech and Software Ltd.
// SPDX-FileCopyrightText: (c) 2017 dosaygo
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0
const TYPED_ARRAYS = new Set([
    "Uint1Array",
    "Int8Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Int16Array",
    "Uint16Array",
    "Int32Array",
    "UInt32Array",
    "Float32Array",
    "Float64Array"
  ]);
  const INTERNAL_FORMAT = Uint8Array;
  const $ = Symbol("[[Uint1ArrayInternal]]");

  // Uint1Array internals : toArray, getBit, setBit

    class Uint1ArrayPrivates {
      constructor( publics, { length : length = null,
                  buffer : buffer = null,
                  byteOffset : byteOffset = 0,
                  byteLength : byteLength = null} = {} ) {

        let internal;

        if ( !! buffer ) {
          length = (byteLength || buffer.byteLength) * 8;
        } else if ( ! length ) {
          length = 0;
        }

        const wordBytes = INTERNAL_FORMAT.BYTES_PER_ELEMENT;
        const wordSize = wordBytes * 8;
        const wordSizeMask = wordSize - 1;
        const wordSizeShift = msb_index( wordSize );
        const wordCount = Math.max(
          1, ( length + wordSizeMask ) >> wordSizeShift);
        if ( !! buffer ) {
          internal = new INTERNAL_FORMAT( buffer, byteOffset, wordCount );
        } else  {
          buffer = new ArrayBuffer( wordBytes * wordCount );
          internal = new INTERNAL_FORMAT( buffer );
        }

        Object.assign( this, {
          buffer,
          byteOffset,
          length,
          wordSize,
          wordCount,
          wordSizeMask,
          wordSizeShift,
          internal
        });
      }
      toArray() {
        const array = new Uint8Array( this.length );
        for( let j = 0; j < this.wordCount; j++ ) {
          const word = this.internal[j];
          for( let i = j*this.wordSize; i < (j+1)*this.wordSize; i++ ) {
            array[i] = this.getBit( i, word );
          }
        }
        return array;
      }
      getBit( i, word ) {
        if ( i >= this.length ) {
          return;
        }
        const word_offset = i & this.wordSizeMask;
        if ( word == undefined ) {
          const word_number = i >> this.wordSizeShift;
          word = this.internal[word_number];
        }
        const bit = (word >> word_offset)&1;
        return bit;
      }
      setBit( i, bit ) {
        if ( i >= this.length ) {
          return;
        }
        const word_number = i >> this.wordSizeShift;
        const word_offset = i & this.wordSizeMask;
        const word = this.internal[word_number];
        let new_word = word;
        new_word |= ( bit << word_offset ); // make it 1 if 1, no change if 0
        new_word &= ~((~bit&1) << word_offset ); // make it 0 if 0, no change if 1
        if ( word !== new_word ) {
          this.internal[word_number] = new_word;
        }
        return bit;
      }
    }

    class Uint1Array {
      // Uint1Array constructor

        constructor( arg , byteOffset = 0, byteLength = null ) {
          const argType = resolveTypeName(arg);

          let length, privates, temp;

          switch( argType ) {
            case "Number":
              arg = ~~arg; // integer part only
              length = arg;
              privates = new Uint1ArrayPrivates( this, { length } );
              break;
            case "ArrayBuffer":
              const buffer = arg;
              privates = new Uint1ArrayPrivates( this, {
                buffer, byteOffset, byteLength } );
              break;
            case "Undefined":
            case "Null":
            case "RegExp":
            case "Infinity":
              length = 0;
              privates = new Uint1ArrayPrivates( this, { length } );
              break;
            case "Array":
            case "Int8Array":
            case "Uint8Array":
            case "Uint8ClampedArray":
            case "Int16Array":
            case "Uint16Array":
            case "Int32Array":
            case "UInt32Array":
            case "Float32Array":
            case "Float64Array":
            case "Uint1Array":
            case "Object":
            default:
              temp = create_from_iterable( arg );
              privates = new Uint1ArrayPrivates( this, { length : temp.length } );
              temp.forEach( (val, i) => privates.setBit( i, toBit( val ) ) );
              break;
          }

          // for private access to internal properties

          this[$] = privates;

          // proxy for array-like bracket-accessor via index

          const accessorProxy = new BracketAccessorProxy( this );

          return accessorProxy;
        }

      // Static property slots on the constructor

        static get BYTES_PER_ELEMENT() {
          return 0.125;
        }
        static get name() {
          return "Uint1Array";
        }
        static get length() {
          return 0;
        }
        static get [Symbol.species]() {
          return this;
        }

        static [Symbol.hasInstance](instance) {
          return instance.__proto__ = this;
        }

      // Static method slots on the constructor

        static from( iterable ) {
          const temp = create_from_iterable( iterable );
          return new Uint1Array( temp );
        }

        static of( ...items ) {
          return Uint1Array.from( items );
        }

      // Property slots on the instances

        get buffer() {
          return this[$].buffer;
        }

        get byteLength() {
          return ( this.length + 7 ) >> 3;
        }

        get byteOffset() {
          return this[$].byteOffset;
        }

        get length() {
          return this[$].length;
        }

        get [Symbol.toStringTag]() {
          return "Uint1Array";
        }

      // Method slots on the instance ( STANDARD as per the TypedArray Spec )

        copyWithin( targetStart, sourceStart = 0, sourceEnd = this.length ) {
          if ( ! Number.isInteger( targetStart ) ) {
            return this;
          }
          const temp = new Uint8Array( sourceEnd - sourceStart );
          for( let i = sourceStart; i < sourceEnd; i++ ) {
            temp[i-sourceStart] = this[i];
          }
          this.set( temp, targetStart );
          return this;
        }

        entries() {
          return this[$].toArray().entries();
        }

        every( ...args ) {
          return this[$].toArray().every( ...args );
        }

        fill( value, start = 0, end = this.length ) {
          for( let i = start; i < end; i++ ) {
            this[i] = value;
          }
          return this;
        }

        filter( ...args ) {
          return new Uint1Array( this[$].toArray().filter( ...args ) );
        }

        find( ...args ) {
          return this[$].toArray().find( ...args );
        }

        findIndex( ...args ) {
          return this[$].toArray().findIndex( ...args );
        }

        forEach( ...args ) {
          this[$].toArray().forEach( ...args );
        }

        includes( ...args ) {
          return this[$].toArray().includes( ...args );
        }

        indexOf( ...args ) {
          return this[$].toArray().indexOf( ...args );
        }

        join( ...args ) {
          return this[$].toArray().join( ...args );
        }

        keys( ...args ) {
          return this[$].toArray().keys( ...args );
        }

        lastIndexOf( ...args ) {
          return this[$].toArray().lastIndexOf( ...args );
        }

        map( ...args ) {
          return new Uint1Array( this[$].toArray().map( ...args ) );
        }

        reduce( ...args ) {
          return this[$].toArray().reduce( ...args );
        }

        reduceRight( ...args ) {
          return this[$].toArray().reduceRight( ...args );
        }

        reverse() {
          const temp = this[$].toArray().reverse();
          this.set( temp );
          return this;
        }

        set( arr, offset = 0 ) {
          if ( ! Number.isInteger( offset ) ) {
            return;
          }

          const typeName = resolveTypeName(arr);

          // returning without doing nothing if the argument is
          // neither an array nor a typedarray seems to be the
          // implemented behaviour in the browser for <TypedArray>.set
          // and we do not differ here
          if ( typeName !== "Array" && ! TYPED_ARRAYS.has( typeName ) ) {
            return;
          }
          const last = Math.min( arr.length + offset, this.length );
          arr = arr.map( v => toBit( v ) );
          for( let i = offset; i < last; i++ ) {
            this[i] = arr[i-offset];
          }
        }

        slice( ...args ) {
          return new Uint1Array( this[$].toArray().slice( ...args ) );
        }

        sort( ...args ) {
          const sorting = this[$].toArray().sort( ...args );
          this.set( sorting );
          return this;
        }

        subarray( ...args ) {
          return new Uint1Array( this[$].toArray().subarray( ...args ) );
        }

        values( ...args ) {
          return this[$].toArray().values( ...args );
        }

        toLocaleString( ...args ) {
          return Array.from(this).toLocaleString();
        }

        toString() {
          return Array.from(this).toString();
        }

        [Symbol.iterator]() {
          return this[$].toArray()[Symbol.iterator]();
        }

        valueOf() {
          return this;
        }

      // Method slots on the instances ( NON STANDARD )

        // This behaviour is chosen ( to return an Array for JSON stringification )
        // because I decided that the behaviour of TypedArrays to return an object
        // with numeric properties such as {0: 0, 1:0, 2:1} didn't work and was crap.

        toJSON() {
          return Array.from(this);
        }
    }

  // array bracket-accessor proxy

    function BracketAccessorProxy( typed_array_api ) {
      const privates = typed_array_api[$];
      const array_accessor_handler = {
        get( _, slot, surface ) {
          const i = typeof slot == "string" ? parseInt(slot) : slot;
          if ( Number.isInteger( i ) ) {
            return privates.getBit( i );
          } else {
            return Reflect.get( typed_array_api, slot );
          }
        },
        set( _, slot, value, surface ) {
          const i = typeof slot == "string" ? parseInt(slot) : slot;
          if ( Number.isInteger( i ) ) {
            privates.setBit( i, toBit( value ) );
            return true;
          } else {
            return Reflect.set( typed_array_api, slot, value );
          }
        }
      };
      return new Proxy( typed_array_api, array_accessor_handler );
    }

  // helpers

    const typeNameMatcher = /\[object (\w+)]/;

    function create_from_iterable( iterable ) {
      const temp = [];
      for( let item of iterable ) {
        const bit = toBit( item );
        temp.push( bit );
      }
      return temp;
    }

    function msb_index( number ) {
      let i = 0;
      while( number >>= 1 ) {
        i++;
      }
      return i;
    }

    function toBit( thing ) {
      if ( typeof thing == "number" && ! Number.isNaN(thing) ) {
        return thing % 2;
      } else {
        return new Boolean(thing).valueOf();
      }
    }

    function resolveTypeName( thing ) {
      const cname = thing && thing.constructor ? thing.constructor.name : null;
      const tname = typeNameMatcher.exec( Object.prototype.toString.call( thing ) )[1];
      if ( tname !== cname && !! cname ) return cname;
      return tname;
    }

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.

class Utils {

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

        // FUDGE as Unit8Array.set stores LSB first but we want MSB first in the bit array, getMsbCode reverses the bits
        const msbCodes = [...packed].map(c => getMsbCode(c));
        
        const buffer = new ArrayBuffer(msbCodes.length);
        const bytes = new Uint8Array(buffer);
        bytes.set(msbCodes);
        const bits = new Uint1Array(buffer);

        return getUnpackedData(bits);
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

var ENGINEERING = "QIECBAgQIIcWLGg2EDdy3QIKnXKgYtUE7f2QA2TB0wYr2DECAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYMS54fzJmix4-YCDToOLOjyZ0WLSkzo6AkcGHuZUcRHlB4dgyAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAQAEABAAWDP9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YNCho9zImSoAqBGoAp0FUy8-iChhz5UCA4MPEuZYgTAFyAFg1_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2DYCAAoACACeQHkBdYTJlixIkSKlSJEoUKIEBQABAAQAEABYN_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39g4AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGDn9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_YsAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIBix_f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f2LICAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAYs_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_39i0AgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgAIACAAgGLX9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9__f_3_9_Ytq-jT0yg7OXZs39w0Pzh3Ao_LLl3BZuHPl3dMIGllyBIWzrlLmkKJGTSJUycsoUqlZJYtXLzLBiyZlWjVs3IuHLp2UePXz9AgQokaBIlTJ0ChSqVoFi1cvQMGLJmgaNWzdA4cunaB49fP0ECDChoIkWNHQSJMqWgmTZ09BQo0qaCpVrV0FizatoLl29fQYMOLGgyZc2dBo06taDZt3b0HDjy5oOnXt3QePPr2g-ff38pgw4sZHJlzZyujTq1ktm3dvNcOPLmW6de3cn48-vZf59_fwZiHv3Y8uHYIjbMPPQDVCxcLf4E0-mXDk8mI-_dlFCn5a9_DKr6q-qvqr6q-qvqr6AFS390DJoGQKr6q-qvqr6q-qvqr6o";
var ADVERT = "QIECBAgQIJ9KDDmRUDZi3QU8PRk1QQeHIHDaIEDJiwYumDACdDwcnbLy6aeeXbl3dECBAgQIECBAgQIECBAgQIHwZkvcoCx0og8LNGjYwQPEjzpoWaNjBA82YHnTQwabEjTpowPEiBAgLHSiBbs1atjFA9SPe2pZqQNUHX1qQatSlrqQNW-5UsaIECAsdKIFidUqQJUCVAlVKlipchQJUCJanVIEqpAlSqlC5CgQIEB0ogQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQHSKBAgQYEH7ogQaGCApw_fEm54R3PCm5JuSKHoFUEVIECAudIoECBB6-___TB-_v0JTU_WqkZHFyQKHmjYgYBECpAqQIC50igQIEH___3_-iD__6FFSAig-IP6JCg26lzRr3avEgFUgLnSKBAg1f1X9lv_9NSBAgI6G-HX1V_EqBUqQJUqXBzagVSAudIoECD9_Qa2qL__6IMDzoq682qdAgQIEARAgQIECBAgVIC50igQIP_9AiaoFX__0VfV_1kjQIECBAgQBECBAgAoECpAgLnSKBBq__0CBCgQa___oreokCBAgQIECBAgQBECBAgVIECAudIoEHr__QIECBAg3_36FAgQIECBAgQIECAIgQIFSBAgQIAZ0igQf_7dAgKIECAinKf9bTR9QIv-N6i_ofzNagQIECBAgJnSKDR__tUBRAoe6NiBB_XYf_rqg_q2iD-gRb-iBAgQIECAmdIoNX_-1QFECDrq9IMH9h664P_D-w34P7DZ4ToECBAgQICZ0ig___5TQ8SfEHzQ82MPCzpoedEHzA82MPjDQ0-LNDSk0JnSOD___lNXVh_Qf9T3cx_oP-prqa_1S3Y0_q_zX-s1NdTUmdI6v_9-U1NUH9B_1NdTX-g_6mvpL_wMNTX-g1Nf6DAz1tSZ0j-_v0JREjQokaFEhRIUSNCiRoUCNAjRoEaBEhRo0CNGgBnSP9OgQFECCNPpIIVKfDkVaUWmggzoiCFPny5M6PTQIECAGdIjUAGlJnR0DBu5coGrFm0YMEE-kgpxYqChBjxUDNuwQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAy92np007s6AFSy9tOXvzQA7O_ryQTd-7L5DQVtpBJ3ZMvg";
var UK = "QIECBAgQIIcWLGg2EDFy2QIJu_cgZNUETLjQA2TN0xYr2DAodJIECBAgQIEGDB4_PUCBAgQIECBAgQIECBAgQIEANkvaMih0kgQIECDA1Qfv__OgQYGCBAgQIECBAgQIECBAgQIECBAgKHSSBAgQIH6FR-__-v7___oECBAgQIEAORPmxUE6LXpoECAodJIECBAoQKum7______9-gQIECBAgQA82_Zs39-aB8-QIAh0kgQIECBAgSev_____v06BAgQIECBAgQIECBAgQIECBAgKHSSBAgQIECBR00____-_w9GCBAgQIECBAgQIECBAgQIECAodJIECBAgQIECD8rx________ECBAgQIECBAgQIECBAgQICh0kgQIECBAgQLETRlv_______6oECBAgQIECBAgQIECBAgKHSyBAgQIHGQlwYIEH_-_x_____9-dECBAgQIECBAgQIECAIdLIECDAmJbfz_-0RJ0qBV________7sECBAgQIECBAgQIAh0sgQIMzAl-__fX5Sg0JECvX______586IECBAgQIECBAgCHSyBAgwJiW9OjX_0qBAgQIEX________-l8fPjBAgQIECAIdLIEHBYhQIECBQxQICWDhg5fv____________tUCBAgQIAh0sgzIECBAgQIEGlAgQEtP_______________-lQIECBAgCHSyBUwQIECBAgQakCBASQqv_____________-6FAgQIECAIdLIECJygQIECBAgaoEBJBg______________5-OiBAgQIAh0sgQKGKBAgQIEHBKgJIMH7____8v__________QoECBAgCHSyBRmQIECBA4RoECAkgVoVaNel________r16FAgQIECAIdLINCFAgwOEyBAgQICSBAgQePn7___r06RAgQIECBAgQIAh0sgQLeKxCgQIECBAgJIECDR__v0aNGhQIECBAgQIECBAgCHSSBAgQIECBAgQIECBAgQYP3_-1QIECBAgQIECBAgQIECAIdJIECBAgQIECBAgQIECBB6boUSBAgQIECBAgQIECBAgQIAh0kgQIECBAgQIECBAgQIFStAgQIECBAgQIECBAgQIECBAgAzsvjognZe_MFIy4cmzTuy8wdTfwQU-G_l0DVKy-lhyad6A";
var SPLASH = "QIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECAsaMIEGDx8YIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQICxowg0N2bdmgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgLGjCBFvz9_6BAZQIECBAgQIECAig0NECBAgQIECBAgQIECAsaMcOD5tjyoGCBAgQIECBAgQICLhCgQIECBAgQIECBAgQICxowoTod79ArSEcHBAgQIECBAg0ITKBAgQcGCBAgQIECBAgLGjCBBgXIUCAyRXmlLBAgQIECBuZ4fPn___aoECBAgQIECBAaQIECBAgQIEBFAgQaTPDh8-f___-vXo9f9qgQIECBAgQIECBAgQIEBFAgQcOHz5____69ejRoECBAg__0CBAgQIECBAgQIECBAgQEUCL___r16NGXQIOHDh8-NCOD-3QIECBAgQIECBAgQIECBARQINf0ug-fPi9evRo0aBAgI6v6VAgQIECBAgQIECBAgQIEBFAgRf2hfBw4cOHD58-fPiAj-_oECBAgQIECBAgQIECBAgQEUCBBr-l0SNGjRo0CBAgQEcH9qgQIECBAgQIECBAgQIECBARQIECL-0Lr169ev-fPnxAR1f0KBAgQIECBAgQIAiBAgQIEBFAgQINf3hw4cOCBAgQIEBH-_QIECBAgQIECBAgCIECBAgQIEB1ARRL1-_____________7VAgOIECBAgQIECAIgQIECBAgQHUBNAgQf26BAgQIN_8ijRoECA4gQIECBAgQIAiBAgQIECA6gQE0CDV_QoECBAgRf2iBAgQIEBxAgQIECBAgCIECBAgQIDqBAgQE0aFAgQIECBAgQIECBAgQHECBAgQIECAIgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIBp0Kg3cNqDSggdMuPRh3ZOe_N074eWVf0y7MvTL46IECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQKMalAyYMmKCplx6ECZBT35unfDyyoJnTIuQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECBAgQIECA";
var testpages = {
	ENGINEERING: ENGINEERING,
	ADVERT: ADVERT,
	UK: UK,
	SPLASH: SPLASH
};

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

const NS = "http://www.w3.org/2000/svg";

let clipPathId = 0;

// The API exposed here is a subset of svg.js v3 - https://svgjs.com/docs/3.0/
// This wraps objects around DOM Elements

class Element {
    constructor() {
        // subclass to create this._e
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

class SVG extends Element {
    constructor() {
        super();
        this._e = document.createElementNS(NS, "svg");
        this._e.setAttribute('xmlns', NS);
        return this;
    }

    addTo(selector) {
        document.querySelector(selector).appendChild(this._e);
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
        const styleNode = document.createElementNS(NS, 'style');
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
        this._e = document.createElementNS(NS, 'g');
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
        this._e = document.createElementNS(NS, 'image');
        this._e.setAttribute('width', parseInt(width));
        this._e.setAttribute('height', parseInt(height));
        return this;
    }
}

class Use extends Element {
    constructor(id) {
        super();
        this._e = document.createElementNS(NS, 'use');
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
        this._e = document.createElementNS(NS, 'symbol');
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
        this._e = document.createElementNS(NS, 'text');
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
        this._e = document.createElementNS(NS, 'defs');
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
        this._e = document.createElementNS(NS, 'clipPath');
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
        if (widthOrEl instanceof SVGElement) {
            this._e = widthOrEl;
            return this;
        }
        const width = widthOrEl;
        this._e = document.createElementNS(NS, 'rect');
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
        this._e = document.createElementNS(NS, 'line');
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

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

const Colour = {
    BLACK  : Symbol('BLACK'),
    RED    : Symbol('RED'),
    GREEN  : Symbol('GREEN'),
    YELLOW : Symbol('YELLOW'),
    BLUE   : Symbol('BLUE'),
    MAGENTA: Symbol('MAGENTA'),
    CYAN   : Symbol('CYAN'),
    WHITE  : Symbol('WHITE'),
};
Object.freeze(Colour);

const CellType = {
    ALPHA : Symbol('ALPHA'),
    MOSAIC_CONTIGUOUS: Symbol('MOSAIC_CONTIGUOUS'),
    MOSAIC_SEPARATED: Symbol('MOSAIC_SEPARATED'),
};
Object.freeze(CellType);

const CellSize = {
    NORMAL_SIZE:   Symbol('NORMAL_SIZE'),
    DOUBLE_HEIGHT: Symbol('DOUBLE_HEIGHT'),
    DOUBLE_WIDTH:  Symbol('DOUBLE_WIDTH'),
    DOUBLE_SIZE:   Symbol('DOUBLE_SIZE'),
};
Object.freeze(CellSize);

class Attributes {
    static charFromTextColour(colour) {
        if (colour in textColourToChar) return textColourToChar[colour];
        throw new Error('Attributes.charFromTextColour: bad colour: ' + colour);
    }

    static charFromGraphicColour(colour) {
        if (colour in graphicColourToChar) return graphicColourToChar[colour];
        throw new Error('Attributes.charFromGraphicColour: bad colour');
    }

    static charFromAttribute(attrib) {
        if (attrib in spacingAttributesToChar) return spacingAttributesToChar[attrib];
        throw new Error('Attributes.charFromAttribute: bad attribute');
    }

    static attribFromChar(level, char) {
        let attribute = null;
        let colour = null;
        if (char in attributeChars && charCodesByLevel[level].includes(char.charCodeAt(0))) {
            if (char in charToTextColour) {
                attribute = Attributes.TEXT_COLOUR;
                colour = attributeChars[char];
            } else if (char in charToGraphicColour) {
                attribute = Attributes.MOSAIC_COLOUR;
                colour = attributeChars[char];
            } else {
                attribute = attributeChars[char];
            }
        } else if (char.charCodeAt(0) <= 0x1f) {
            attribute = Attributes.UNKNOWN;
        }
        return { attribute, colour };
    }

    static fillColourFromColourAttrib(colour) {
        return colourAttribToFillColour[colour];
    }
}
Attributes.TEXT_COLOUR         = CellType.ALPHA;
Attributes.MOSAIC_COLOUR       = Symbol('MOSAIC_COLOUR');
Attributes.NEW_BACKGROUND      = Symbol('NEW_BACKGROUND');
Attributes.BLACK_BACKGROUND    = Symbol('BLACK_BACKGROUND');
Attributes.CONTIGUOUS_GRAPHICS = CellType.MOSAIC_CONTIGUOUS;
Attributes.SEPARATED_GRAPHICS  = CellType.MOSAIC_SEPARATED;
Attributes.ESC                 = Symbol('ESC');
Attributes.FLASH               = Symbol('FLASH');
Attributes.STEADY              = Symbol('STEADY');
Attributes.NORMAL_SIZE         = CellSize.NORMAL_SIZE;
Attributes.DOUBLE_HEIGHT       = CellSize.DOUBLE_HEIGHT;
Attributes.DOUBLE_WIDTH        = CellSize.DOUBLE_WIDTH;
Attributes.DOUBLE_SIZE         = CellSize.DOUBLE_SIZE;
Attributes.CONCEAL             = Symbol('CONCEAL');
Attributes.HOLD_MOSAICS        = Symbol('HOLD_MOSAICS');
Attributes.RELEASE_MOSAICS     = Symbol('RELEASE_MOSAICS');
Attributes.START_BOX           = Symbol('START_BOX');
Attributes.END_BOX             = Symbol('END_BOX');
Attributes.UNKNOWN             = Symbol('UNKNOWN'); // pseudo-attribute

// private data below

const colourAttribToFillColour = {
    [Colour.BLACK]   : '#000',
    [Colour.RED]     : '#f00',
    [Colour.GREEN]   : '#0f0',
    [Colour.YELLOW]  : '#ff0',
    [Colour.BLUE]    : '#00f',
    [Colour.MAGENTA] : '#f0f',
    [Colour.CYAN]    : '#0ff',
    [Colour.WHITE]   : '#fff',
};
Object.freeze(colourAttribToFillColour);

// TODO - tidy up strings
const charToTextColour = {
    [String.fromCharCode(0x0)] : Colour.BLACK,
    [String.fromCharCode(0x1)] : Colour.RED,
    [String.fromCharCode(0x2)] : Colour.GREEN,
    [String.fromCharCode(0x3)] : Colour.YELLOW,
    [String.fromCharCode(0x4)] : Colour.BLUE,
    [String.fromCharCode(0x5)] : Colour.MAGENTA,
    [String.fromCharCode(0x6)] : Colour.CYAN,
    [String.fromCharCode(0x7)] : Colour.WHITE,
};
Object.freeze(charToTextColour);
const charToGraphicColour = {
    [String.fromCharCode(0x10)] : Colour.BLACK,
    [String.fromCharCode(0x11)] : Colour.RED,
    [String.fromCharCode(0x12)] : Colour.GREEN,
    [String.fromCharCode(0x13)] : Colour.YELLOW,
    [String.fromCharCode(0x14)] : Colour.BLUE,
    [String.fromCharCode(0x15)] : Colour.MAGENTA,
    [String.fromCharCode(0x16)] : Colour.CYAN,
    [String.fromCharCode(0x17)] : Colour.WHITE,
};
Object.freeze(charToGraphicColour);
const attributeChars = {
    [String.fromCharCode(0x08)] : Attributes.FLASH,
    [String.fromCharCode(0x09)] : Attributes.STEADY,
    [String.fromCharCode(0x0a)] : Attributes.END_BOX,
    [String.fromCharCode(0x0b)] : Attributes.START_BOX,
    [String.fromCharCode(0x0c)] : Attributes.NORMAL_SIZE,
    [String.fromCharCode(0x0d)] : Attributes.DOUBLE_HEIGHT,
    [String.fromCharCode(0x0e)] : Attributes.DOUBLE_WIDTH,
    [String.fromCharCode(0x0f)] : Attributes.DOUBLE_SIZE,
    [String.fromCharCode(0x18)] : Attributes.CONCEAL,
    [String.fromCharCode(0x19)] : Attributes.CONTIGUOUS_GRAPHICS,
    [String.fromCharCode(0x1a)] : Attributes.SEPARATED_GRAPHICS,
    [String.fromCharCode(0x1b)] : Attributes.ESC,
    [String.fromCharCode(0x1c)] : Attributes.BLACK_BACKGROUND,
    [String.fromCharCode(0x1d)] : Attributes.NEW_BACKGROUND,
    [String.fromCharCode(0x1e)] : Attributes.HOLD_MOSAICS,
    [String.fromCharCode(0x1f)] : Attributes.RELEASE_MOSAICS,
};

const textColourToChar = {};
for (const char in charToTextColour) {
    textColourToChar[charToTextColour[char]] = char;
    attributeChars[char] = charToTextColour[char];
}
Object.freeze(textColourToChar);
const graphicColourToChar = {};
for (const char in charToGraphicColour) {
    graphicColourToChar[charToGraphicColour[char]] = char;
    attributeChars[char] = charToGraphicColour[char];
}
Object.freeze(graphicColourToChar);
Object.freeze(attributeChars);

const spacingAttributesToChar = {};
for (const char in attributeChars) {
    spacingAttributesToChar[attributeChars[char]] = char;
}
Object.freeze(spacingAttributesToChar);

// 'level 0' is fake but derived from Ceefax 1975 pages at https://archive.teletextarchaeologist.org/Pages/Details/21000
// which has different control codes
const Level = {
    0:   Symbol('0'),   // 7 colour text and contiguous graphics, flashing
    1:   Symbol('1'),   // + background colours, separated graphics, conceal, box, double height
    1.5: Symbol('1.5'), // + black text/graphics
    2.5: Symbol('2.5'), // + double width, double size
};
Object.freeze(Level);

const charCodesByLevel = {};
charCodesByLevel[Level[0]] = [     // fictional level 0
    0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7,
    0x08, 0x09,
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
];
charCodesByLevel[Level[1]] = [...charCodesByLevel[Level[0]]].concat([
    0x0a, 0x0b, 0x0c, 0x0d, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
]);
charCodesByLevel[Level[1.5]] = [...charCodesByLevel[Level[1]]].concat([0x0, 0x10]);
charCodesByLevel[Level[2.5]] = [...charCodesByLevel[Level[1.5]]].concat([0xe, 0xf]);
Object.freeze(charCodesByLevel);

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.

const WIDTH_PX = 400;
const HEIGHT_PX = 250;
const COLS = 40;
const ROWS$1 = 25;
const SCREEN_SCALE = 2;
const ASPECT_RATIO_VERTICAL_SCALE = {
    1.33: WIDTH_PX/(1.33 * HEIGHT_PX),
    1.2:  WIDTH_PX/(1.2  * HEIGHT_PX),
    1.22: WIDTH_PX/(1.22 * HEIGHT_PX),
};
const DEFAULT_ASPECT_RATIO = 1.2;

const CELL_HEIGHT = HEIGHT_PX / ROWS$1;
const CELL_WIDTH = WIDTH_PX / COLS;
const CELL_DOUBLE_HEIGHT = CELL_HEIGHT * 2;
const CELL_DOUBLE_WIDTH = CELL_WIDTH * 2;

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

class VectorViewBase {
    constructor(model) {
        this._svg = new SVG()
            .viewbox(`0 0 ${WIDTH_PX - 1} ${HEIGHT_PX - 1}`)
            .size(WIDTH_PX * SCREEN_SCALE, HEIGHT_PX * SCREEN_SCALE * ASPECT_RATIO_VERTICAL_SCALE[DEFAULT_ASPECT_RATIO])
            .attr({
                'preserveAspectRatio': 'none',
                'style': 'font-family: sans-serif'
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
        this.d.removeClass('flash_flashing');
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
                if (nextCellObscured) {
                    nextCellObscured = false;
                    this._clearCell(cellView);
                    this._extendBackgroundForRow(rowIndex);
                    if (previousBoxed) this._extendBox();
                    return;
                }

                const cell = rowModel.getCell(cellIndex);
                const bg = Attributes.fillColourFromColourAttrib(cell.bgColour);
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

                if (cell.size == CellSize.DOUBLE_WIDTH || cell.size == CellSize.DOUBLE_SIZE) nextCellObscured = true;
                previousBg = bg;
                previousBoxed = cell.boxed;
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
        if ('_endOfUpdate' in this._plugins) this._plugins._endOfUpdate(this._svg.width(), this._svg.height());
        this.d.addClass('conceal_concealed');
        // FUDGE keep flashing synchronised
        if (pageContainsFlash) setTimeout(() => this.d.addClass('flash_flashing'), 100);
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
        if (cell.size == CellSize.DOUBLE_HEIGHT)
            cellView.attr('transform', `translate(0 ${_getYTranslate(rowIndex)}) scale(1 2)`);
        else if (cell.size == CellSize.DOUBLE_WIDTH)
            cellView.attr('transform', `translate(${_getXTranslate(cellIndex)} 0) scale(2 1)`);
        else if (cell.size == CellSize.DOUBLE_SIZE)
            cellView.attr('transform', `translate(${_getXTranslate(cellIndex)} ${_getYTranslate(rowIndex)}) scale(2 2)`);

        if (cell.flashing) cellView.addClass('flash');
        if (cell.concealed) cellView.addClass('conceal');
    }

    reveal() {
        this.d.toggleClass('conceal_concealed');
    }

    setFont(font) {
        let newFont = font;
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
            this.d.clipWith(this._boxLayer);
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
        for (let row = 0; row < ROWS$1; row++) {
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
        for (let rowNum = 0; rowNum < ROWS$1; rowNum++) {
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
            .move(x, y);
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
            isDoubleWidth: isDoubleWidthFn,
            isDoubleSize: isDoubleSizeFn,
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
VectorViewBase._CELL_DOUBLE_WIDTH = CELL_DOUBLE_WIDTH;
VectorViewBase._CELL_DOUBLE_HEIGHT = CELL_DOUBLE_HEIGHT;
VectorViewBase._WIDTH_PX = WIDTH_PX;
VectorViewBase._HEIGHT_PX = HEIGHT_PX;
// constants for plugins
VectorViewBase.ROWS = ROWS$1;
VectorViewBase.COLS = COLS;

// helper functions used by plugin
const colourLookupFn = colourSymbol => Attributes.fillColourFromColourAttrib(colourSymbol);
const isDoubleHeightFn = size => size == CellSize.DOUBLE_HEIGHT;
const isDoubleWidthFn = size => size == CellSize.DOUBLE_WIDTH;
const isDoubleSizeFn = size => size == CellSize.DOUBLE_SIZE;
const isSeparatedMosaicFn = type => type == CellType.MOSAIC_SEPARATED;

// functions used for cell transforms
const _getYTranslate = row => 0 - (row * CELL_HEIGHT);
const _getXTranslate = col => 0 - (col * CELL_WIDTH);

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

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.

class View extends VectorViewBase {
    constructor(model, webkitCompat) {
        super(model);
        // webkit doesn't use the width/height on <symbol> which is SVG2.
        // When webkitCompat is true, the width/height are duplicated on <use>
        this._webkitCompat = webkitCompat;
        this._mosaicSymbols = new Set();
        console.debug('VectorViewGraphicMosaic constructed');
    }

    _createDisplay() {
        super._createDisplay();
        this._graphicrows = [];
        this._graphicLayer = this.d.group();
    }

    _resetRow(rowIndex) {
        super._resetRow(rowIndex);
        this._resetGraphicRow(rowIndex);
    }

    _renderCell(cellView, cell, attr, fill, cellIndex, rowIndex, isMosaic) {
        if ('_background' in this._plugins) {
            this._plugins._background(rowIndex, cellIndex, cell.size, cell.bgColour);
        }

        if (cell.type == CellType.ALPHA || !isMosaic) {
            this._renderText(cellView, cell, attr, fill, cellIndex, rowIndex);
        } else if (isMosaic) {
            cellView.plain(' ').attr(attr);
            this._renderMosaic(rowIndex, cellIndex, cell, fill);
        }
    }

    _renderMosaic(row, col, cell, fill) {
        if ('_mosaic' in this._plugins) {
            const rendered = this._plugins._mosaic(row, col, cell, fill);
            if (rendered) return;
        }

        const sextants = cell.getSextants();
        if (!sextants.includes('1')) return;
        let id = cell.type == CellType.MOSAIC_CONTIGUOUS ? 'c' : 's';
        id += sextants.join('');

        let width = VectorViewBase._CELL_WIDTH;
        let height = VectorViewBase._CELL_HEIGHT;
        if (cell.type == CellType.MOSAIC_CONTIGUOUS) {
            width = VectorViewBase._CELL_WIDTH + 0.3;
            height = VectorViewBase._CELL_HEIGHT + 0.2;
        }

        if (!this._mosaicSymbols.has(id)) {
            this._mosaicSymbols.add(id);
            const symbol = this._svg.symbol(id);

            if (cell.type == CellType.MOSAIC_CONTIGUOUS) {
                symbol.attr({
                    preserveAspectRatio: 'none',
                    width: width,     // FUDGE cell is bigger than it should be
                    height: height,   // to close tiny gaps on Chromecast
                    viewBox: '0 0 12 18',
                });
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect(6, 6).move((i % 2) * 6, Math.floor(i/2) * 6);
                }
            } else {
                symbol.attr({
                    preserveAspectRatio: 'none',
                    width: width,
                    height: height,
                    viewBox: '0 0 12 18',
                });
                for (let i = 0; i < 6; i++) {
                    sextants[i] == '1' && symbol.rect(4, 4).move(((i % 2) * 6) + 1, (Math.floor(i/2) * 6) + 2);
                }
            }
        }

        let use;
        if (cell.type == CellType.MOSAIC_CONTIGUOUS)
            use = this._graphicrows[row]
                .use(id)
                .move(col * VectorViewBase._CELL_WIDTH - 0.15, row * VectorViewBase._CELL_HEIGHT - 0.1)
                .fill(fill);
        else
            use = this._graphicrows[row]
                .use(id)
                .move(col * VectorViewBase._CELL_WIDTH, row * VectorViewBase._CELL_HEIGHT)
                .fill(fill);
        if (this._webkitCompat) // FUDGE need width/height for webkit browsers as they don't inherit them from symbol
            use.attr({width: width, height: height});
        if (cell.size == CellSize.DOUBLE_HEIGHT || cell.size == CellSize.DOUBLE_SIZE)
            use.attr('height', VectorViewBase._CELL_DOUBLE_HEIGHT);
        if (cell.size == CellSize.DOUBLE_WIDTH || cell.size == CellSize.DOUBLE_SIZE)
            use.attr('width', VectorViewBase._CELL_DOUBLE_WIDTH);
        if (cell.flashing) use.addClass('flash');
        if (cell.concealed) use.addClass('conceal');
    }

    _resetGraphicRow(rowNum) {
        if (this._graphicrows[rowNum]) this._graphicrows[rowNum].remove();
        this._graphicrows[rowNum] = this._graphicLayer.group();
    }

    // eslint-disable-next-line no-unused-vars
    _getCellAttr(cellType, isMosaicChar) {
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
}

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
class ViewClassic extends VectorViewBase {}

const TEST_PAGE_NAMES = ['SPLASH', 'ENGINEERING', 'ADVERT', 'UK'];

class TeletextController {
    constructor(model, options) {
        this._opt = {
            webkitCompat: true // generate SVG that's compatible with webkit by default. The resulting SVG is larger
        };
        if (typeof options == 'object')
            if ('webkitCompat' in options && !options.webkitCompat) this._opt.webkitCompat = false;

        this._view = new View(model, this._opt.webkitCompat);
        this._model = model;
        this._levelIndex = 1;
        this._testPageIndex = 0;
        this._initEventHandlers();
        this._viewSelector = null;
        this._height = null;
        console.debug('TeletextController constructed');
    }

    setRow(rowNum, string) {
        this._model.setRowFromChars(rowNum, string);
    }

    setPageRows(rows) {
        this._model.setRows(rows);
    }

    showTestPage() {
        this.loadPageFromEncodedString(testpages[TEST_PAGE_NAMES[this._testPageIndex]]);
        this._testPageIndex++;
        if (this._testPageIndex == TEST_PAGE_NAMES.length) this._testPageIndex = 0;
    }
    
    showRandomisedPage() {
        const rows = [];
        for (let row = 0; row < 25; row++) {
            const cols = [];
            for (let col = 0; col < 40; col++) {
                cols.push(String.fromCharCode(Math.random() * 127));
            }
            rows.push(cols.join(''));
        }
        this.setPageRows(rows);
    }

    loadPageFromEncodedString(input) {
        const decoded = Utils.decodeBase64URLEncoded(input);
        // this.setRow(0, decoded[2]);
        this.setPageRows(decoded);
    }

    _initEventHandlers() {
        window.addEventListener('ttx.reveal', () => this._view.reveal());
        window.addEventListener('ttx.mix', () => this._view.mixMode());
        window.addEventListener('ttx.subtitlemode', () => this._view.boxMode());
    }

    toggleReveal() {
        this._view.reveal();
    }

    toggleMixMode() {
        this._view.mixMode();
    }

    toggleBoxMode() {
        this._view.boxMode();
    }

    toggleGrid() {
        this._view.grid();
    }

    setLevel(level) {
        this._model.setLevel(level);
    }

    addTo(selector) {
        this._selector = selector;
        this._view.addTo(selector);
    }

    setFont(font) {
        this._view.setFont(font);
    }

    clearScreen(withUpdate) {
        this._model.clearScreen(withUpdate);
    }

    setAspectRatio(aspectRatio) {
        if (aspectRatio == 'natural') {
            this._view.setAspectRatio(aspectRatio);
            return;
        }
        const ar = parseFloat(aspectRatio);
        if (Number.isNaN(ar)) throw new Error("E80 setAspectRatio: bad number");
        this._view.setAspectRatio(ar);
    }

    setHeight(height) {
        const newHeight = parseFloat(height);
        if (Number.isNaN(newHeight)) throw new Error("E98 setHeight: bad number");
        this._view.setHeight(newHeight);
        this._height = newHeight;
    }

    setDefaultG0Charset(...args) {
        this._model.setPrimaryG0CharacterEncoding(...args);
    }

    setSecondG0Charset(...args) {
        this._model.setSecondaryG0CharacterEncoding(...args);
    }

    remove() {
        this._view.detach();
        if (this._selector) {
            const el = document.querySelector(this._selector);
            if (el) el.removeChild(el.firstChild);
        }
        this._view = null;
    }

    setView(view) {
        this.remove();
        switch (view) {
            case 'classic__font-for-mosaic':
                this._view = new ViewClassic(this._model);
                break;
            case 'classic__graphic-for-mosaic':
                this._view = new View(this._model, this._opt.webkitCompat);
                break;
            default:
                throw new Error("setView E126: bad view name:" + view);
        }
        if (this._height) this._view.setHeight(this._height);
        if (this._selector) this._view.addTo(this._selector);
        this._model.notify();
    }

    registerViewPlugin(plugin) {
        plugin.registerWithView(this._view);
        this._model.notify();
    }

    // dumpToConsole() {
    //     this._model.dumpToConsole();
    // }
}

var latin_g0 = {
	$: "¤",
	"": "■"
};
var latin_g0__czech_slovak = {
	"#": "#",
	$: "ů",
	"@": "č",
	"[": "ť",
	"\\": "ž",
	"]": "ý",
	"^": "í",
	_: "ř",
	"`": "é",
	"{": "á",
	"|": "|",
	"}": "ú",
	"~": "š"
};
var latin_g0__english = {
	"#": "£",
	$: "$",
	"@": "@",
	"[": "←",
	"\\": "½",
	"]": "→",
	"^": "↑",
	_: "#",
	"`": "—",
	"{": "¼",
	"|": "‖",
	"}": "¾",
	"~": "÷"
};
var latin_g0__estonian = {
	"#": "#",
	$: "õ",
	"@": "Š",
	"[": "Ä",
	"\\": "Ö",
	"]": "Ž",
	"^": "Ü",
	_: "Õ",
	"`": "š",
	"{": "ä",
	"|": "ö",
	"}": "ž",
	"~": "ü"
};
var latin_g0__french = {
	"#": "é",
	$: "ï",
	"@": "à",
	"[": "ë",
	"\\": "ê",
	"]": "ù",
	"^": "î",
	_: "#",
	"`": "è",
	"{": "â",
	"|": "ô",
	"}": "û",
	"~": "ç"
};
var latin_g0__german = {
	"#": "#",
	$: "$",
	"@": "§",
	"[": "Ä",
	"\\": "Ö",
	"]": "Ü",
	"^": "^",
	_: "_",
	"`": "°",
	"{": "ä",
	"|": "ö",
	"}": "ü",
	"~": "ß"
};
var latin_g0__italian = {
	"#": "£",
	$: "$",
	"@": "é",
	"[": "°",
	"\\": "ç",
	"]": "→",
	"^": "↑",
	_: "#",
	"`": "ù",
	"{": "à",
	"|": "ò",
	"}": "è",
	"~": "ì"
};
var latin_g0__latvian_lithuanian = {
	"#": "#",
	$: "$",
	"@": "Š",
	"[": "ė",
	"\\": "ę",
	"]": "Ž",
	"^": "č",
	_: "ū",
	"`": "š",
	"{": "ą",
	"|": "ų",
	"}": "ž",
	"~": "į"
};
var latin_g0__polish = {
	"#": "#",
	$: "ń",
	"@": "ą",
	"[": "Ƶ",
	"\\": "Ś",
	"]": "Ł",
	"^": "ć",
	_: "ó",
	"`": "ę",
	"{": "ż",
	"|": "ś",
	"}": "ł",
	"~": "ź"
};
var latin_g0__portuguese_spanish = {
	"#": "ç",
	$: "$",
	"@": "¡",
	"[": "á",
	"\\": "é",
	"]": "í",
	"^": "ó",
	_: "ú",
	"`": "¿",
	"{": "ü",
	"|": "ñ",
	"}": "è",
	"~": "à"
};
var latin_g0__romanian = {
	"#": "#",
	$: "¤",
	"@": "Ț",
	"[": "Â",
	"\\": "Ș",
	"]": "Ă",
	"^": "Î",
	_: "ı",
	"`": "ț",
	"{": "â",
	"|": "ș",
	"}": "ă",
	"~": "î"
};
var latin_g0__serbian_croatian_slovenian = {
	"#": "#",
	$: "Ë",
	"@": "Č",
	"[": "Ć",
	"\\": "Ž",
	"]": "Đ",
	"^": "Š",
	_: "ë",
	"`": "č",
	"{": "ć",
	"|": "ž",
	"}": "đ",
	"~": "š"
};
var latin_g0__swedish_finnish_hungarian = {
	"#": "#",
	$: "¤",
	"@": "É",
	"[": "Ä",
	"\\": "Ö",
	"]": "Å",
	"^": "Ü",
	_: "_",
	"`": "é",
	"{": "ä",
	"|": "ö",
	"}": "å",
	"~": "ü"
};
var latin_g0__turkish = {
	"#": "₺",
	$: "ğ",
	"@": "İ",
	"[": "Ş",
	"\\": "Ö",
	"]": "Ç",
	"^": "Ü",
	_: "Ğ",
	"`": "ı",
	"{": "ş",
	"|": "ö",
	"}": "ç",
	"~": "ü"
};
var greek_g0 = {
	"<": "«",
	">": "»",
	"@": "ΐ",
	A: "Α",
	B: "Β",
	C: "Γ",
	D: "Δ",
	E: "Ε",
	F: "Ζ",
	G: "Η",
	H: "Θ",
	I: "Ι",
	J: "Κ",
	K: "Λ",
	L: "Μ",
	M: "Ν",
	N: "Ξ",
	O: "Ο",
	P: "Π",
	Q: "Ρ",
	R: "ʹ",
	S: "Σ",
	T: "Τ",
	U: "Υ",
	V: "Φ",
	W: "Χ",
	X: "Ψ",
	Y: "Ω",
	Z: "Ϊ",
	"[": "Ϋ",
	"\\": "ά",
	"]": "έ",
	"^": "ή",
	_: "ί",
	"`": "ΰ",
	a: "α",
	b: "β",
	c: "γ",
	d: "δ",
	e: "ε",
	f: "ζ",
	g: "η",
	h: "θ",
	i: "ι",
	j: "κ",
	k: "λ",
	l: "μ",
	m: "ν",
	n: "ξ",
	o: "ο",
	p: "π",
	q: "ρ",
	r: "ς",
	s: "σ",
	t: "τ",
	u: "υ",
	v: "φ",
	w: "χ",
	x: "ψ",
	y: "ω",
	z: "ϊ",
	"{": "ϋ",
	"|": "ό",
	"}": "ύ",
	"~": "ώ",
	"": "■"
};
var cyrillic_g0 = {
	"@": "Ю",
	A: "А",
	B: "Б",
	C: "Ц",
	D: "Д",
	E: "Е",
	F: "Ф",
	G: "Г",
	H: "Х",
	I: "И",
	J: "Ѝ",
	K: "К",
	L: "Л",
	M: "М",
	N: "Н",
	O: "О",
	P: "П",
	Q: "Я",
	R: "Р",
	S: "С",
	T: "Т",
	U: "У",
	V: "Ж",
	W: "В",
	X: "Ь",
	Z: "З",
	"[": "Ш",
	"]": "Щ",
	"^": "Ч",
	"`": "ю",
	a: "а",
	b: "б",
	c: "ц",
	d: "д",
	e: "е",
	f: "ф",
	g: "г",
	h: "х",
	i: "и",
	j: "ѝ",
	k: "к",
	l: "л",
	m: "м",
	n: "н",
	o: "о",
	p: "п",
	q: "я",
	r: "р",
	s: "с",
	t: "т",
	u: "у",
	v: "ж",
	w: "в",
	x: "ь",
	z: "з",
	"{": "ш",
	"}": "щ",
	"~": "ч",
	"": "■"
};
var cyrillic_g0__russian_bulgarian = {
	"&": "ы",
	Y: "Ъ",
	"\\": "Э",
	_: "Ы",
	y: "ъ",
	"|": "э"
};
var cyrillic_g0__serbian_croatian = {
	"@": "Ч",
	J: "Ј",
	Q: "Ќ",
	V: "В",
	W: "Ѓ",
	X: "Љ",
	Y: "Њ",
	"[": "Ћ",
	"\\": "Ж",
	"]": "Ђ",
	"^": "Ш",
	_: "Џ",
	"`": "ч",
	j: "ј",
	q: "ќ",
	v: "в",
	w: "ѓ",
	x: "љ",
	y: "њ",
	"{": "ћ",
	"|": "ж",
	"}": "ђ",
	"~": "ш"
};
var cyrillic_g0__ukranian = {
	"&": "ї",
	Y: "І",
	"\\": "Є",
	_: "Ї",
	y: "і",
	"|": "є"
};
var arabic_g0 = {
	"#": "£",
	"&": "ﻰ",
	"'": "ﻱ",
	"(": ")",
	")": "(",
	";": "؛",
	"<": ">",
	">": "<",
	"?": "؟",
	"@": "ﺔ",
	A: "ﺀ",
	B: "ﺒ",
	C: "ﺏ",
	D: "ﺘ",
	E: "ﺕ",
	F: "ﺎ",
	G: "ﺍ",
	H: "ﺑ",
	I: "ﺓ",
	J: "ﺗ",
	K: "ﺛ",
	L: "ﺟ",
	M: "ﺣ",
	N: "ﺧ",
	O: "ﺩ",
	P: "ﺫ",
	Q: "ﺭ",
	R: "ﺯ",
	S: "ﺳ",
	T: "ﺷ",
	U: "ﺻ",
	V: "ﺿ",
	W: "ﻃ",
	X: "ﻇ",
	Y: "ﻋ",
	Z: "ﻏ",
	"[": "ﺜ",
	"\\": "ﺠ",
	"]": "ﺤ",
	"^": "ﺨ",
	_: "#",
	"`": "ـ",
	a: "ﻓ",
	b: "ﻗ",
	c: "ﻛ",
	d: "ﻟ",
	e: "ﻣ",
	f: "ﻧ",
	g: "ﻫ",
	h: "ﻭ",
	i: "ﻰ",
	j: "ﻳ",
	k: "ﺙ",
	l: "ﺝ",
	m: "ﺡ",
	n: "ﺥ",
	o: "ﻴ",
	p: "ﻯ",
	q: "ﻌ",
	r: "ﻐ",
	s: "ﻔ",
	t: "ﻑ",
	u: "ﻘ",
	v: "ﻕ",
	w: "ﻙ",
	x: "ﻠ",
	y: "ﻝ",
	z: "ﻤ",
	"{": "ﻡ",
	"|": "ﻨ",
	"}": "ﻥ",
	"~": "ﻻ",
	"": "■"
};
var hebrew_g0 = {
	"#": "£",
	"[": "←",
	"\\": "½",
	"]": "→",
	"^": "↑",
	_: "#",
	"`": "א",
	a: "ב",
	b: "ג",
	c: "ד",
	d: "ה",
	e: "ו",
	f: "ז",
	g: "ח",
	h: "ט",
	i: "י",
	j: "ך",
	k: "כ",
	l: "ל",
	m: "ם",
	n: "מ",
	o: "ן",
	p: "נ",
	q: "ס",
	r: "ע",
	s: "ף",
	t: "פ",
	u: "ץ",
	v: "צ",
	w: "ק",
	x: "ר",
	y: "ש",
	z: "ת",
	"{": "₪",
	"|": "‖",
	"}": "¾",
	"~": "÷",
	"": "■"
};
var g1_block_mosaic_to_unicode__legacy_computing = {
	"0": "🬏",
	"1": "🬐",
	"2": "🬑",
	"3": "🬒",
	"4": "🬓",
	"5": "▌",
	"6": "🬔",
	"7": "🬕",
	"8": "🬖",
	"9": "🬗",
	" ": " ",
	"!": "🬀",
	"\"": "🬁",
	"#": "🬂",
	$: "🬃",
	"%": "🬄",
	"&": "🬅",
	"'": "🬆",
	"(": "🬇",
	")": "🬈",
	"*": "🬉",
	"+": "🬊",
	",": "🬋",
	"-": "🬌",
	".": "🬍",
	"/": "🬎",
	":": "🬘",
	";": "🬙",
	"<": "🬚",
	"=": "🬛",
	">": "🬜",
	"?": "🬝",
	"`": "🬞",
	a: "🬟",
	b: "🬠",
	c: "🬡",
	d: "🬢",
	e: "🬣",
	f: "🬤",
	g: "🬥",
	h: "🬦",
	i: "🬧",
	j: "▐",
	k: "🬨",
	l: "🬩",
	m: "🬪",
	n: "🬫",
	o: "🬬",
	p: "🬭",
	q: "🬮",
	r: "🬯",
	s: "🬰",
	t: "🬱",
	u: "🬲",
	v: "🬳",
	w: "🬴",
	x: "🬵",
	y: "🬶",
	z: "🬷",
	"{": "🬸",
	"|": "🬹",
	"}": "🬺",
	"~": "🬻",
	"": "█"
};
var g1_block_mosaic_to_unicode__unscii_separated = {
	"0": "",
	"1": "",
	"2": "",
	"3": "",
	"4": "",
	"5": "",
	"6": "",
	"7": "",
	"8": "",
	"9": "",
	" ": " ",
	"!": "",
	"\"": "",
	"#": "",
	$: "",
	"%": "",
	"&": "",
	"'": "",
	"(": "",
	")": "",
	"*": "",
	"+": "",
	",": "",
	"-": "",
	".": "",
	"/": "",
	":": "",
	";": "",
	"<": "",
	"=": "",
	">": "",
	"?": "",
	"`": "",
	a: "",
	b: "",
	c: "",
	d: "",
	e: "",
	f: "",
	g: "",
	h: "",
	i: "",
	j: "",
	k: "",
	l: "",
	m: "",
	n: "",
	o: "",
	p: "",
	q: "",
	r: "",
	s: "",
	t: "",
	u: "",
	v: "",
	w: "",
	x: "",
	y: "",
	z: "",
	"{": "",
	"|": "",
	"}": "",
	"~": "",
	"": ""
};
var encodings = {
	latin_g0: latin_g0,
	latin_g0__czech_slovak: latin_g0__czech_slovak,
	latin_g0__english: latin_g0__english,
	latin_g0__estonian: latin_g0__estonian,
	latin_g0__french: latin_g0__french,
	latin_g0__german: latin_g0__german,
	latin_g0__italian: latin_g0__italian,
	latin_g0__latvian_lithuanian: latin_g0__latvian_lithuanian,
	latin_g0__polish: latin_g0__polish,
	latin_g0__portuguese_spanish: latin_g0__portuguese_spanish,
	latin_g0__romanian: latin_g0__romanian,
	latin_g0__serbian_croatian_slovenian: latin_g0__serbian_croatian_slovenian,
	latin_g0__swedish_finnish_hungarian: latin_g0__swedish_finnish_hungarian,
	latin_g0__turkish: latin_g0__turkish,
	greek_g0: greek_g0,
	cyrillic_g0: cyrillic_g0,
	cyrillic_g0__russian_bulgarian: cyrillic_g0__russian_bulgarian,
	cyrillic_g0__serbian_croatian: cyrillic_g0__serbian_croatian,
	cyrillic_g0__ukranian: cyrillic_g0__ukranian,
	arabic_g0: arabic_g0,
	hebrew_g0: hebrew_g0,
	g1_block_mosaic_to_unicode__legacy_computing: g1_block_mosaic_to_unicode__legacy_computing,
	g1_block_mosaic_to_unicode__unscii_separated: g1_block_mosaic_to_unicode__unscii_separated
};

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.

const sextants = {};

class Cell {
    constructor() {
        this._byte = ' ';
        this._char = ' ';
        this._fgColour = Colour.WHITE;
        this._bgColour = Colour.BLACK;
        this._type = CellType.ALPHA;
        this._flashing = false;
        this._size = CellSize.NORMAL_SIZE;
        this._concealed = false;
        this._boxed = false;
        this._byteHeld = null;
    }

    set byte(byte) {
        this._byte = byte;
    }

    get byte() {
        return this._byte;
    }

    set fgColour(colour) {
        this._fgColour = colour;
    }

    get fgColour() {
        return this._fgColour;
    }

    set bgColour(colour) {
        this._bgColour = colour;
    }

    get bgColour() {
        return this._bgColour;
    }

    setMappedChar(encoding) {
        if (this._type == CellType.ALPHA || ((this._byte.charCodeAt(0) & 0b100000) == 0))
            this._char = getCharWithEncoding(this._byte, encoding);
        else if (this._type == CellType.MOSAIC_CONTIGUOUS)
            this._char = getCharWithEncoding(this._byte, 'g1_block_mosaic_to_unicode__legacy_computing');
        else
            this._char = getCharWithEncoding(this._byte, 'g1_block_mosaic_to_unicode__unscii_separated');

        this._byteHeld = null;
    }

    setSpace(heldMosaic) {
        if ((this._type == CellType.MOSAIC_CONTIGUOUS || this._type == CellType.MOSAIC_SEPARATED)
            && heldMosaic.active) {
            this._byteHeld = heldMosaic.char;
            this._type = heldMosaic.type;
            let charEncoding = 'g1_block_mosaic_to_unicode__legacy_computing';
            if (this._type == CellType.MOSAIC_SEPARATED) charEncoding = 'g1_block_mosaic_to_unicode__unscii_separated';
            this._char = getCharWithEncoding(heldMosaic.char, charEncoding);
        } else {
            this._byteHeld = null;
            this._char = ' ';
        }
    }

    get char() {
        return this._char;
    }

    get type() {
        return this._type;
    }

    set type(type) {
        this._type = type;
    }

    set flashing(state) {
        this._flashing = state;
    }

    get flashing() {
        return this._flashing;
    }

    get size() {
        return this._size;
    }

    set size(size) {
        this._size = size;
    }

    set concealed(concealed) {
        this._concealed = concealed;
    }

    get concealed() {
        return this._concealed;
    }

    set boxed(boxed) {
        this._boxed = boxed;
    }

    get boxed() {
        return this._boxed;
    }

    // used in rendering to distinguish burn-through characters in G1 set
    isMosaicByte() {
        const code = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
        return (code <= 0x7f) && ((code & 0b100000) == 0b100000);
    }
    
    // used in page model to keep track of mosaic to hold 
    isMosaic() {
        const code = this._byte.charCodeAt(0);
        const isMosaic = (this._type == CellType.MOSAIC_CONTIGUOUS || this._type == CellType.MOSAIC_SEPARATED)
                && (code <= 0x7f) 
                && ((code & 0b100000) == 0b100000);
        return isMosaic;
    }

    getSextants() {
        const code = this._byteHeld != null ? this._byteHeld.charCodeAt(0) : this._byte.charCodeAt(0);
        if (code > 0x7f) return null;
        if (code in sextants) return sextants[code];

        let sextant = code - 0x20;
        if (sextant >= 0x40) sextant -= 0x20;
        sextants[code] = [...sextant.toString(2).padStart(6, '0')].reverse();
        return sextants[code];
    }
}

// private

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

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

class Event {
    constructor(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    attach(listener) {
        this._listeners.push(listener);
        return this._listeners.length - 1;
    }

    notify(args) {
        this._listeners.forEach(fn => fn != null && fn(this._sender, args));
    }

    detach(index) {
        this._listeners[index] = null;
    }
}

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0

class RowModel {
    constructor() {
        this._doubleHeight = false;
        this._cells = [];
    }

    get doubleHeight() {
        return this._doubleHeight;
    }

    set doubleHeight(isDoubleHeight) {
        this._doubleHeight = isDoubleHeight;
    }

    addCell(cell) {
        this._cells.push(cell);
    }

    getCell(i) {
        if (i >= this._cells.length) throw new Error('RowModel.getCell E20 bad cell index');
        return this._cells[i];
    }
}

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.

const ROWS = 25;
const CELLS_PER_ROW = 40;
const DEFAULT_PRIMARY_G0_CHARACTER_SET = 'latin_g0';

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
        this._startBoxChar = Attributes.charFromAttribute(Attributes.START_BOX);
        this._level = Level[1];
        
        this.onSet = new Event(this);
        console.debug('PageModel constructed');
    }

    notify() {
        this.onSet.notify();
    }

    setRowFromChars(rowNum, text) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel E29 bad row number");
        }
        this._setRowFromChars(rowNum, text);
        this.onSet.notify();
    }

    setRows(rows) {
        rows = rows.slice(0, ROWS);
        rows.forEach((row, index) => {
            this._setRowFromChars(index, row);
        });
        this.onSet.notify();
    }

    _setRowFromChars(rowNum, text) {
        let textArray = [...text];
        textArray = textArray.slice(0, CELLS_PER_ROW);
        textArray.forEach((c, colNum) => {
            const code = c.charCodeAt(0);
            if (Number.isNaN(code) || code > 127) {
                throw new Error(`PageModel E51 failed to write row: bad character code (${code}) at row ${rowNum} col ${colNum}`);
            }
            this._screen[rowNum][colNum].byte = c;
        });
        if (textArray.length < CELLS_PER_ROW) {
            for (let colNum = textArray.length; colNum < CELLS_PER_ROW; colNum++) {
                this._screen[rowNum][colNum].byte = ' ';
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

    setLevel(level) {
        this._level = level;
        console.debug('PageModel.setLevel: switching to Level', level);
        this.onSet.notify();
    }

    clearScreen(withUpdate) {
        const updateAfterClear = typeof withUpdate != 'undefined' ? withUpdate : true;
        if (updateAfterClear) {
            const rows = [];
            for (let rowNum = 0; rowNum < ROWS; rowNum++) {
                rows.push("");
            }
            this.setRows(rows);
        } else {
            for (let rowNum = 0; rowNum < ROWS; rowNum++) {
                this._setRowFromChars(rowNum, "");
            }
        }
    }

    setPrimaryG0CharacterEncoding(encoding, withUpdate) {
        this._primaryG0CharacterEncoding = encoding;
        console.debug('PageModel.setPrimaryG0CharacterEncoding: set default g0 encoding to', encoding);
        if (withUpdate) this.onSet.notify();
    }

    setSecondaryG0CharacterEncoding(encoding, withUpdate) {
        this._secondaryG0CharacterEncoding = encoding;
        console.debug('PageModel.setSecondaryG0CharacterEncoding: set second g0 encoding to', encoding);
        if (withUpdate) this.onSet.notify();
    }

    getRow(rowNum) {
        if (rowNum >= ROWS) {
            throw new Error("PageModel.getRow E42 bad rowNum");
        }
        const rowModel = new RowModel();
        let textColour, switchedG0CharacterEncoding;

        // start of row defaults for 'set-after' attributes
        let nextCellType = CellType.ALPHA;
        let nextTextColour = Colour.WHITE;
        let nextFlashing = false;
        let nextSize = CellSize.NORMAL_SIZE;
        let nextSwitchedG0CharacterEncoding = false;
        let nextConcealed = false; // setting is set-at, unsetting is set-after
        let cancelNextHoldMosaics = false; // setting is set-at, cancelling is set-after
        let nextBoxed = false;

        // start of row defaults for 'set-at' attributes
        let backgroundColour = Colour.BLACK;
        let graphicType = CellType.MOSAIC_CONTIGUOUS;
        let heldMosaic = {
            active: false,
            char: ' ',
            type: CellType.MOSAIC_CONTIGUOUS
        };

        this._screen[rowNum].forEach((cell, cellIndex) => {
            const char = cell.byte;
            const attrib = Attributes.attribFromChar(this._level, char);

            // 'set-after' attributes from previous cell
            textColour = nextTextColour;
            cell.type = nextCellType;
            cell.boxed = nextBoxed;
            switchedG0CharacterEncoding = nextSwitchedG0CharacterEncoding;
            if (attrib.attribute != Attributes.STEADY) cell.flashing = nextFlashing;
            if (attrib.attribute != Attributes.NORMAL_SIZE) cell.size = nextSize;
            if (attrib.attribute != Attributes.CONCEAL) cell.concealed = nextConcealed;
            if (cancelNextHoldMosaics) {
                if (attrib.attribute != Attributes.HOLD_MOSAICS) {
                    heldMosaic.active = false;
                    heldMosaic.char = ' ';
                }
                cancelNextHoldMosaics = false;
            }

            switch (attrib.attribute) {
                case Attributes.TEXT_COLOUR: // set after this cell
                    nextCellType = CellType.ALPHA;
                    nextTextColour = attrib.colour;
                    nextConcealed = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.MOSAIC_COLOUR: // set after this cell
                    nextCellType = graphicType;
                    nextTextColour = attrib.colour;
                    nextConcealed = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.NEW_BACKGROUND: // set at this cell
                    backgroundColour = textColour;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.BLACK_BACKGROUND: // set at
                    backgroundColour = Colour.BLACK;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.CONTIGUOUS_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_CONTIGUOUS;
                    if (cell.type == CellType.MOSAIC_SEPARATED) cell.type = CellType.MOSAIC_CONTIGUOUS;
                    if (nextCellType == CellType.MOSAIC_SEPARATED) nextCellType = CellType.MOSAIC_CONTIGUOUS;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.SEPARATED_GRAPHICS: // set at
                    graphicType = CellType.MOSAIC_SEPARATED;
                    if (cell.type == CellType.MOSAIC_CONTIGUOUS) cell.type = CellType.MOSAIC_SEPARATED;
                    if (nextCellType == CellType.MOSAIC_CONTIGUOUS) nextCellType = CellType.MOSAIC_SEPARATED;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.ESC: // for switching g0 sets. Set after
                    if (this._secondaryG0CharacterEncoding) {
                        nextSwitchedG0CharacterEncoding = !switchedG0CharacterEncoding;
                    }
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.FLASH: // set after
                    nextFlashing = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.STEADY: // set at
                    cell.flashing = false;
                    nextFlashing = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.NORMAL_SIZE: // set at
                    cell.size = CellSize.NORMAL_SIZE;
                    nextSize = CellSize.NORMAL_SIZE;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.DOUBLE_HEIGHT: // set after
                    nextSize = CellSize.DOUBLE_HEIGHT;
                    rowModel.doubleHeight = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.DOUBLE_WIDTH: // set after
                    nextSize = CellSize.DOUBLE_WIDTH;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.DOUBLE_SIZE: // set after
                    nextSize = CellSize.DOUBLE_SIZE;
                    rowModel.doubleHeight = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.CONCEAL: // set at
                    cell.concealed = true;
                    nextConcealed = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.HOLD_MOSAICS: // set at
                    heldMosaic.active = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.RELEASE_MOSAICS: // set after
                    cancelNextHoldMosaics = true;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.START_BOX: // set between two start box chars
                    if (cellIndex >= 1) {
                        if (this._screen[rowNum][cellIndex-1].byte == this._startBoxChar) {
                            cell.boxed = true;
                            nextBoxed = true;
                        }
                    }
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.END_BOX: // set after
                    nextBoxed = false;
                    cell.setSpace(heldMosaic);
                    break;
                case Attributes.UNKNOWN:
                    cell.setSpace(heldMosaic);
                    break;
                default:
                    if (switchedG0CharacterEncoding)
                        cell.setMappedChar(this._secondaryG0CharacterEncoding);
                    else
                        cell.setMappedChar(this._primaryG0CharacterEncoding);
                    // mosaic chars are held for use when 'hold mosaics' is active
                    if (cell.isMosaic()) {
                        heldMosaic.char = char;
                        heldMosaic.type = cell.type;
                    }
            }

            cell.fgColour = textColour;
            cell.bgColour = backgroundColour;
            rowModel.addCell(cell);
        });
        // console.dir(rowModel);
        return rowModel;
    }

}

// SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.

const model = new PageModel();

function Teletext(options) {
    return new TeletextController(model, options);
}

export { Attributes, Colour, Level, Teletext };
//# sourceMappingURL=teletext.js.map
