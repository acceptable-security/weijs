const WeiEventABI = require('./abi/WeiEventABI.js');

class WeiContractEvent {
    constructor(wei, abi) {
        this._wei = wei;
        this.abi = new WeiEventABI(abi);
    }
}

module.exports = WeiContractEvent;