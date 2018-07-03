const WeiRLP = require('./WeiRLP.js');
const BN = require('bn.js');
const WeiUtil = require('../WeiUtil.js');

class WeiTransaction {
    constructor(from, to, data = '', gas = 9000000, value = 0, nonce = 0, gasPrice = undefined) {
        this.from = from;
        this.nonce = nonce;
        this.gasPrice = gasPrice;
        this.gas = gas;
        this.to = to;
        this.value = value;
        this.data = data;
    }

    // Encode the unsigned version
    encodeUnsigned() {
        return WeiRLP.encode([
            this.nonce,
            this.gasPrice,
            this.gas,
            this.to,
            this.value,
            this.data
        ]);
    }

    // Sign the transaction
    sign(account) {
        const sig = account.sign(this.encodeUnsigned());
        this.r = sig.r;
        this.s = sig.s;
        this.v = sig.v;

        return this;
    }

    // Encode the full transaction
    encode() {
        return WeiRLP.encode([
            this.nonce,
            this.gasPrice,
            this.gas,
            this.to,
            this.value,
            this.data,
            this.r,
            this.s,
            this.v
        ]);
    }

    // Serialize to Object
    toObject() {
        const tx = {
            from: this.from
        };

        if ( this.gas ) tx.gas = WeiUtil.hex(this.gas);
        if ( this.value ) tx.value = WeiUtil.hex(this.value);
        if ( this.to ) tx.to = this.to;
        if ( this.data ) tx.data = WeiUtil.hex(this.data);

        return tx;
    }

    static fromObject(obj) {
        return new WeiTransaction(
            obj.from,
            obj.to,
            obj.data || '',
            obj.gas || 9000000,
            obj.value || 0,
            obj.nonce || 0,
            obj.gasPrice || undefined
        );
    }
}

module.exports = WeiTransaction;