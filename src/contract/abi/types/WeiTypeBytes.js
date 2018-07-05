const assert = require('assert');
const WeiType = require('./WeiType.js');

class WeiTypeBytes extends WeiType {
    constructor(abiType, input) {
    	super();
    	
        this.type = abiType;

        assert(this.type.isStaticBytes);

        if ( typeof input == 'string' ) {
            if ( input.substring(0, 2) == '0x' ) {
                input = Buffer.from(input.substring(2), 'hex');
            }
            else {
                input = Buffer.from(input, 'utf8');
            }
        }

        if ( !(input instanceof Buffer) ) {
            throw new Error("Unable to handle unknown input type");
        }

        if ( input.length > this.type.byteCount ) {
            throw new Error(`Can't take a buffer of ${input.length} for a ${this.type.byteCount} byte type`);
        }

        this.data = input;
        this.pad();
    }

    pad() {
        if ( this.data.length % 32 != 0 ) {
            // Pad the input to 32 byte alignment
            const pad = [];

            for ( let i = 0; i < this.data.length % 32; i++ ) {
                pad.push(0);
            }

            this.data = this.data.concat(Buffer.from(pad));
        }
    }

    encode() {
        return this.data;
    }

    decode() {
        return this.data;
    }
}

module.exports = WeiTypeBytes;