const BN = require('bn.js');

class WeiRLP {
    constructor() {

    }

    encode(data) {
        if ( typeof data == 'number' ) {
            // Special byte
            if ( data >= 0x00 && data <= 0x7F ) {
                return Buffer.from([ data ]);
            }

            data = (new BN(data)).toBuffer('be');
        }
        else if ( typeof data == 'string' ) {
            data = Buffer.from(data, 'utf8');
        }
        else if ( typeof data == 'boolean' ) {
            return data ? 0x01 : 0x80;
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
            const elements = Buffer.concat(data.map((x) => this.encode(x)));

            if ( elements.length == 0 ) {
                // Empty list
                return Buffer.from([ 0xC0 ]);
            }
            else if ( elements.length <= 55 ) {
                // Short list
                return Buffer.concat([ Buffer.from(0xC0 + elements.length), elements]);
            }
            else {
                // Long list
                const lenBuff = (new BN(elements.length)).toBuffer('be');
                return Buffer.concat([ Buffer.from([0xF7 + lenBuff.length]), lenBuff, data]);
            }
        }
        else {
            throw new Error("Unknown data passed to RLP encoder");
        }
    }

    _decode(data) {
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
                const tmp = this._decode(data);

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
                const tmp = this._decode(data);

                list.push(tmp[0]);
                data = tmp[1];
            }

            return [ list, data ];
        }

        throw new Error(`Failed to decode byte ${data[0]}`);
    }

    decode(data) {
        return this._decode(data)[0];
    }
}

module.exports = WeiRLP;