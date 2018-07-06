const assert = require('assert');
const WeiType = require('./WeiType.js');

/** A dynamically sized array. This includes strings and bytes, or T[] style. */
class WeiTypeDynamic extends WeiType {
    /**
     * Create a dynamic type instance.
     *
     * @param {WeiABIType} abiType - The ABI type that generated this instance.
     * @param {(string|Buffer|Array)} input - The argument being handled. Strings that begin with "0x" 
     * will be treated as hexidecimal strings. If its an T[]
     */
    constructor(abiType, input) {
        super();
        
        this.type = abiType;

        assert(this.type.isDynamicArray || this.type.isDynamicType);

        if ( this.type.isDynamicType ) {
            switch ( this.type.simpleType ) {
            case 'string': this.data = Buffer.from(input, 'utf8'); break;
            case 'bytes':  this.data = input;                      break;
            }

            if ( !(this.data instanceof Buffer) ) {
                throw new Error(`Unable to parse input for ${this.type.simpleType}`);
            }
        }
        else {
            if ( input instanceof Array ) {
                this.data = [];

                for ( const element of input ) {
                    this.data.push(this.type.parse(element, true));
                }
            }
            else if ( input instanceof Buffer ) {
                this.data = [];

                while ( input.length > 32 ) {
                    const tmp = input.slice(0, 32);

                    this.data.push(this.type.parse(tmp, true));

                    input = input.slice(32);
                }
            }
            else {
                throw new Error("Unable to parse input for dynamic array.");
            }
        }
    }

    /**
     * Get the size of the data inside. If it's an array thats the amount of members,
     * and if it is a string/bytes, then it is the amount of data.
     *
     * @returns {number} The amount of data.
     */
    size() {
        return this.data.length;
    }

    /**
     * Encode this instance. The data inside is for the dynamic section, not the static.
     *
     * @returns {Buffer} The encoded instance.
     */
    encode() {
        if ( this.data instanceof Array ) {
            let tmp = Buffer.from([]);

            for ( const element of this.data ) {
                const encode = element.encode();
                tmp = Buffer.concat([tmp, encode]);
            }

            return tmp;
        }
        else if ( this.data instanceof Buffer ) {
            let tmp = this.data;

            if ( this.data.length % 32 != 0 ) {
                const amt = 32 - (this.data.length % 32);
                const pad = [];

                for ( let i = 0; i < amt; i++ ) {
                    pad.push(0);
                }

                tmp = Buffer.concat([tmp, Buffer.from(pad)]);
            }

            return tmp;
        }
        else {
            throw new Error("Unable to encode internal data");
        }
    }

    /**
     * Decode this instance. The data needed is from the dynamic section, not the static.
     *
     * @returns {Buffer} The decoded instance.
     */
    decode() {
        if ( this.data instanceof Array ) {
            let tmp = [];

            for ( const element of this.data ) {
                tmp.push(element.decode());
            }

            return tmp;
        }
        else if ( this.data instanceof Buffer ) {
            if ( this.type.simpleType == "string" ) {
                return this.data.toString('utf8');
            }
            else {
                return this.data;
            }
        }
        else {
            throw new Error("Unable to decode internal data");
        }
    }
}

module.exports = WeiTypeDynamic;