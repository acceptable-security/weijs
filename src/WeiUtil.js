const BN = require('bn.js');
const keccack = require('keccak');

/** Helper class with only static utilities that are used by a variety of other classes. */
class WeiUtil {
    /** When no gas limit is passed, defaults to this */
    static get DefaultGas() {
        return 900000;
    }

    /**
     * Determine if something is an object, but not an array object.
     * 
     * @param {any} data - The data to check.
     * @returns {boolean} Whether or not it is an Object.
     */
    static isObj(data) {
        return data instanceof Object && !(data instanceof Array);
    }

    /**
     * Take the keccack256 hash of an object.
     *
     * @param {string|Buffer} data - Data to hash.
     * @returns {Buffer} The hashed data.
     */
    static hash(data) {
        return keccack('keccak256').update(data).digest();
    }

    /**
     * Convert data to hex with 0x in the front.
     * 
     * @param {string|number|BN|Buffer} data - Data to turn to hex.
     * @returns {string} Hexified data.
     */
    static hex(data) {
        if ( typeof data == 'number' ) {
            data = new BN(data);
        }

        if ( data instanceof BN ) {
            data = data.toBuffer('be');
        }

        if ( typeof data == 'string' ) {
            data = Buffer.from(data, 'utf8');
        }

        data = data.toString('hex');

        if ( data.length % 2 != 0 ) {
            data = '0' + data;
        }

        return '0x' + data;
    }
}

module.exports = WeiUtil;