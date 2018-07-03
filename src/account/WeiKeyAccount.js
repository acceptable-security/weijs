const BN = require('bn.js');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const WeiUtil = require('../WeiUtil.js');
const WeiAccount = require('./WeiAccount.js');

class WeiKeyAccount extends WeiAccount {
    constructor(wei, privateKey) {
        super(wei);

        this.privateKey = Buffer.from(privateKey, 'hex');
    }

    static create(wei) {
        let privateKey;

        do {
            privateKey = crypto.randomBytes(32);
        } while ( !secp256k1.privateKeyVerify(privateKey) );

        return new WeiKeyAccount(wei, privateKey);
    }   

    get publicKey() {
        return secp256k1.publicKeyCreate(this.privateKey, false).slice(1);
    }

    get address() {
        return WeiUtil.hex(WeiUtil.hash(this.publicKey).slice(-20));
    }

    async nonce() {
        const raw = await this._wei.rpc.eth.getTransactionCount(this.address, 'latest');
        return (new BN(raw.substring(2), 16)).toNumber();
    }

    sign(msg) {
        const sig = secp256k1.sign(WeiUtil.hash(msg), this.privateKey);

        return {
            r: sig.signature.slice(0, 32),
            s: sig.signature.slice(32, 64),
            v: sig.recovery + 27
        };
    }

    async sendTransaction(transaction) {
        // Load in the nonce
        transaction.nonce = await this.nonce();

        // Load in the gasPrice if not manually set
        if ( !transaction.gasPrice ) {
            const rawGas = await this._wei.rpc.eth.gasPrice();
            transaction.gasPrice = Buffer.from(rawGas.substring(2), 'hex');
        }

        const encoded = WeiUtil.hex(transaction.sign(this).encode());

        return await this._wei.rpc.eth.sendRawTransaction(encoded);
    }
}

module.exports = WeiKeyAccount;