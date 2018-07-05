const BN = require('bn.js');

/** Static class used for encoding and decoding RLP related data. */
class WeiRLP {
    /**
     * Encode data into an RLP encoding
     *
     * @param {number|string|Array|Buffer|undefined|boolean} data - Data to be encoded with RLP.
     * Note that if the string starts with 0x, it will be interpretted as a hex
     * string. The types of the contents of an Array must be of the same argument
     * types as the {@link WeiRLP#encode}.
     *
     * @returns {[Buffer, Buffer]} The first argument is the parsed data, and the second part is
     * the data that still needs to be parsed.
     */
    static encode(data) {
        if ( typeof data == 'number' ) {
            // Special byte
            if ( data >= 0x00 && data <= 0x7F ) {
                if ( data == 0x00 ) {
                    return Buffer.from([ 0x80 ]);
                }
                
                return Buffer.from([ data ]);
            }

            data = (new BN(data)).toBuffer('be');
        }
        else if ( typeof data == 'string' ) {
            if ( data.substring(0, 2) == '0x' ) {
                data = Buffer.from(data.substring(2), 'hex');
            }
            else {
                data = Buffer.from(data, 'utf8');
            }
        }
        else if ( typeof data == 'boolean' ) {
            return Buffer.from([ data ? 0x01 : 0x80 ]);
        }
        else if ( typeof data == 'undefined' ) {
            return Buffer.from([ 0x80 ]);
        }
        else if ( data instanceof BN ) {
            data = data.toBuffer('be');
        }

        if ( data instanceof Buffer ) {
            if ( data.length == 0 ) {
                // Empty buffer
                return Buffer.from([ 0x80 ]);
            }
            else if ( data.length <= 55 ) {
                // Short buffer
                return Buffer.concat([ Buffer.from([ 0x80 + data.length ]), data ]);
            }
            else {
                // Long buffer
                const lenBuff = (new BN(data.length)).toBuffer('be');
                return Buffer.concat([ Buffer.from([ 0xB7 + lenBuff.length]), lenBuff, data]);
            }
        }
        else if ( data instanceof Array ) {
            const elements = Buffer.concat(data.map((x) => WeiRLP.encode(x)));

            if ( elements.length == 0 ) {
                // Empty list
                return Buffer.from([ 0xC0 ]);
            }
            else if ( elements.length <= 55 ) {
                // Short list
                return Buffer.concat([ Buffer.from([0xC0 + elements.length]), elements]);
            }
            else {
                // Long list
                const lenBuff = (new BN(elements.length)).toBuffer('be');
                return Buffer.concat([ Buffer.from([0xF7 + lenBuff.length]), lenBuff, elements]);
            }
        }
        else {
            throw new Error("Unknown data passed to RLP encoder");
        }
    }

    /**
     * Recursive decode method, not intended for public use.
     *
     * @private
     *
     * @params {Buffer} data - Data to be decoded.
     * @returns {Array|Buffer} Data that has been decoded.
     */
    static _decode(data) {
        // Special byte
        if ( data[0] <= 0x7F ) {
            return [ data.slice(0, 1), data.slice(1) ];
        }

        // Short buffer
        if ( data[0] >= 0x80 && data[0] <= 0xB7 ) {
            const len = data[0] - 0x80;
            return [ data.slice(1, 1 + len), data.slice(1 + len) ];
        }

        // Longer buffer
        if ( data[0] >= 0xB8 && data[0] <= 0xBF ) {
            const metaLen = data[0] - 0xB7;
            const len = (new BN(data.slice(1, 1 + metaLen))).toNumber();

            return [ data.slice(1 + metaLen, 1 + metaLen + len), data.slice(1 + metaLen + len) ];
        }

        // Short List
        if ( data[0] >= 0xC0 && data[0] <= 0xF7 ) {
            const count = data[0] - 0xC0;
            data = data.slice(1);

            const list = [];

            for ( let i = 0; i < count; i++ ) {
                const tmp = WeiRLP._decode(data);

                list.push(tmp[0]);
                data = tmp[1];
            }

            return [ list, data ];
        }
        
        // Long list
        if ( data[0] >= 0xF8 && data[0] <= 0xFF ) {
            const metaLen = data[0] - 0xF7;
            const count = (new BN(data.slice(1, 1 + metaLen))).toNumber();
            data = data.slice(1 + metaLen);

            const list = [];

            for ( let i = 0; i < count; i++ ) {
                const tmp = WeiRLP._decode(data);

                list.push(tmp[0]);
                data = tmp[1];
            }

            return [ list, data ];
        }

        throw new Error(`Failed to decode byte ${data[0]}`);
    }

    /**
     * Decode RLP encoded data. Note that all RLP strings will be decoded as a buffer.
     *
     * @params {Buffer} data - Data to be decoded.
     * @returns {Array|Buffer} Data that has been decoded.
     */
    static decode(data) {
        return WeiRLP._decode(data)[0];
    }
}

module.exports = WeiRLP;