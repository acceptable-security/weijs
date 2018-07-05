const BN = require('bn.js');
const WeiType = require('./WeiType.js');

class WeiTypeFixed extends WeiType {
    constructor(abiType, input) {
    	super();
    	
        this.type = abiType;

        if ( typeof input != 'number' ) {
            throw new Error("Fixed numbers must take a number");
        }

        const parts = input.toString().split('.');

        if ( parts[0].length > this.type.fixedUpper ) {
            throw new Error(`Attempted to use a ${parts.length} decimal long number on a ${this.type.fixedUpper} fixed number`);
        }
        else if ( parts[1].length > this.type.fixedLower ) {
            throw new Error(`Attempted to use a ${parts.length} decimal long number on a ${this.type.fixedLower} fixed number`);
        }

        const joined = new BN(''.join(parts));
        const exp = (new BN('10')).exp(this.type.fixedLower - parts[1].length);

        this.data = joined.mul(exp).toBuffer(32);
    }

    encode() {
        return this.data;
    }

    decode() {
        const bn = new BN(this.data);
        const div = (new BN('10')).exp(this.type.fixedLower);

        const upper = bn.div(div).toString();
        const lower = bn.mod(div).toString();

        return +('.'.join([upper, lower]));
    }
}

module.exports = WeiTypeFixed;