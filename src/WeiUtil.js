const keccack = require('keccak');

module.exports = {
    isObj: (data) => data instanceof Object && !(data instanceof Array);

    hash: (data) => {
        return keccack('keccak256').update(data).digest();
    },
    hexBuff: (data) => {
        data = data.toString('hex');

        if ( data.length % 2 != 0 ) {
            data = '0' + data;
        }

        return '0x' + data;
    }
};