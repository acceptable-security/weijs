const WeiRLP = require('./WeiRLP.js');
const WeiUtil = require('../WeiUtil.js');

/** A wrapper class for transaction information */
class WeiTransaction {
    /**
     * Create a transaction object
     *
     * @param {string} from - The sending address.
     * @param {string} to - The receiver address.
     * @param {buffer} data - The data part of the transaction.
     * @param {(number|BN)} gas - Amount of gas for the transaction.
     * @param {(number|BN)} value - Value of the transaction.
     * @param {(number|BN)} gasPrice - The price of gas for the transaction.
     */
    constructor(from, to, data = '', gas = WeiUtil.DefaultGas, value = 0, nonce = 0, gasPrice = 0) {
        this.from = from;
        this.nonce = nonce;
        this.gasPrice = gasPrice;
        this.gas = gas;
        this.to = to;
        this.value = value;
        this.data = data;
    }

    /**
     * Encode an unsigned verison of the transaction
     *
     * @private
     * @returns {Buffer} The encoded unsigned transaction.
     */
    encodeUnsigned() {
        return WeiRLP.encode([
            this.nonce || 0,
            this.gasPrice || 0,
            this.gas || 0,
            this.to || '',
            this.value || 0,
            this.data || ''
        ]);
    }

    /**
     * Sign the current transaction and load the signature.
     * 
     * @param {WeiKeyAccount} account - The account to sign with.
     * @returns {WeiTransaction}
     */
    sign(account) {
        const sig = account.sign(this.encodeUnsigned());
        this.r = sig.r;
        this.s = sig.s;
        this.v = sig.v;

        return this;
    }

    /**
     * Encode the full signed transaction in RLP.
     *
     * @returns {Buffer} The encoded transaction.
     */
    encode() {
        return WeiRLP.encode([
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

    /**
     * Encode the transaction as a JSON object for the RPC.
     *
     * @returns {Object} The encoded transaction.
     */
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

    /**
     * Create a transaction from a JSON object.
     *
     * @returns {WeiTransaction} The transaction object.
     */
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