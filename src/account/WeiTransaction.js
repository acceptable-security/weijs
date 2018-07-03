const WeiRLP = require('./WeiRLP.js');
const WeiUtil = require('../WeiUtil.js');

class WeiTransaction {
    constructor(from, to, data = '', gas = WeiUtil.DefaultGas, value = 0, nonce = 0, gasPrice = 0) {
        this.from = from;
        this.nonce = nonce;
        this.gasPrice = gasPrice;
        this.gas = gas;
        this.to = to;
        this.value = value;
        this.data = data;

        this.rlp = new WeiRLP();
    }

    // Encode the unsigned version
    encodeUnsigned() {
        return this.rlp.encode([
            this.nonce || 0,
            this.gasPrice || 0,
            this.gas || 0,
            this.to || '',
            this.value || 0,
            this.data || ''
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
        return this.rlp.encode([
            this.nonce || 0,
            this.gasPrice || 0,
            this.gas || 0,
            this.to || '',
            this.value || 0,
            this.data,
            this.v,
            this.r,
            this.s
        ]);
    }

    // Serialize to Object
    toObject() {
        const tx = {
            from: this.from
        };

        if ( this.gas )   tx.gas   = WeiUtil.hex(this.gas);
        if ( this.value ) tx.value = WeiUtil.hex(this.value);
        if ( this.to )    tx.to    = this.to;
        if ( this.data )  tx.data  = WeiUtil.hex(this.data);

        return tx;
    }

    static fromObject(obj) {
        return new WeiTransaction(
            obj.from,
            obj.to,
            obj.data || '',
            obj.gas || WeiUtil.DefaultGas,
            obj.value || 0,
            obj.nonce || 0,
            obj.gasPrice || undefined
        );
    }
}

module.exports = WeiTransaction;