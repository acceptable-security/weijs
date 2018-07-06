/**
 * A generic type instance.
 * 
 * @description The subclasses of {@link WeiType} are instances of a type. For example, {@link WeiABIType}
 * would be used represent that the argument to a function is a uint256, however, {@link WeiTypeNumber} would
 * be used to represent a 0x1234 that someone wants to pass to that function. It would be created by
 * {@link WeiABIType#parse} in {@link WeiFunctionABI#encode}, and then encoded using {@link WeiType#encode}
 * so that it can be put in a transaction.
 *
 * Internally most of the {@link WeiType} subclasses store their arguments as Buffers (by reducing the input
 * types down to it) so that encoding is usually a matter of returning the internal buffer, and decoding
 * is a matter of parsing the internal buffer to a relevant type (e.g. a BN for {@link WeiTypeNumber}).
 */
class WeiType {
    /**
     * Create a generic type instance. Do not call directly.
     *
     * @param {WeiABIType} abiType - The ABI type that generated this instance.
     * @param {*} input - The argument being handled. 
     * @abstract
     */
    constructor() {
        if ( this.constructor.name == 'WeiType' ) {
            throw new Error("This is an abstract type. Do not use directly");
        }
    }

    /**
     * Encode this instance.
     *
     * @returns {Buffer} The encoded instance.
     * @abstract
     */
    encode() {
        throw new Error("This is an abstract type. Do not use directly");
    }

    /**
     * Decode this instance
     *
     * @returns {*} The decoded instance, of relevant type.
     * @abstract
     */
    decode() {
        throw new Error("This is an abstract type. Do not use directly");
    }
}

module.exports = WeiType;