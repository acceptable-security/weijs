const BN = require('bn.js');
const WeiType = require('./WeiType.js');

/** A fixed point number. This would be like fixed<M>x<N> or ufixed. */
class WeiTypeFixed extends WeiType {
    /**
     * Create a fixed point number type instance.
     *
     * @params {WeiABIType} abiType - The ABI type that generated this instance.
     * @params {number} input - The argument being handled. Strings that begin with "0x" will be
     */
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
     * @returns {number} The decoded instance.
     */
    decode() {
        const bn = new BN(this.data);
        const div = (new BN('10')).exp(this.type.fixedLower);

        const upper = bn.div(div).toString();
        const lower = bn.mod(div).toString();

        return +('.'.join([upper, lower]));
    }
}

module.exports = WeiTypeFixed;