const WeiType = require('./WeiType.js');

class WeiTypeTuple extends WeiType {
    constructor(abiType, input) {
    	super();
    	
        this.type = abiType;
        this.input = input;
    }

    encode() {

    }

    decode() {

    }
}

module.exports = WeiTypeTuple;