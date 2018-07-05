const assert = require('assert');
const WeiType = require('./WeiType.js');

class WeiTypeDynamic extends WeiType {
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

    size() {
        return this.data.length;
    }

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