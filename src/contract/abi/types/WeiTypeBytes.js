const assert = require('assert');
const WeiType = require('./WeiType.js');

/** A constant size bytes array. This would be like bytes<M> where 0 <= M <= 32. */
class WeiTypeBytes extends WeiType {
    /**
     * Create a bytes type instance.
     *
     * @param {WeiABIType} abiType - The ABI type that generated this instance.
     * @param {(string|Buffer)} input - The argument being handled. Strings that begin with "0x" will be
     */
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

    /**
     * Pads the internal buffer to 32 bytes.
     *
     * @private
     */
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

    /**
     * Encode this instance.
     *
     * @returns {Buffer} The encoded instance.
     */
    encode() {
        return this.data;
    }


    /**
     * Decode this instance.
     *
     * @returns {Buffer} The decoded instance.
     */
    decode() {
        return this.data;
    }
}

module.exports = WeiTypeBytes;