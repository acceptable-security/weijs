const BN = require('bn.js');
const keccack = require('keccak');

module.exports = {
    isObj: (data) => data instanceof Object && !(data instanceof Array),

    DefaultGas: 900000,

    hash: (data) => {
        return keccack('keccak256').update(data).digest();
    },
    hex: (data) => {
        if ( typeof data == 'number' ) {
            data = new BN(data);
        }

        if ( data instanceof BN ) {
            data = data.toBuffer('be');
        }

        data = data.toString('hex');

        if ( data.length % 2 != 0 ) {
            data = '0' + data;
        }

        return '0x' + data;
    }
};