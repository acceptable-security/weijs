const BN = require('bn.js');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const WeiUtil = require('../WeiUtil.js');
const WeiAccount = require('./WeiAccount.js');

/** A {@link WeiAccount} generated from a raw private key. */
class WeiKeyAccount extends WeiAccount {
    constructor(wei, privateKey) {
        super(wei);

        if ( typeof privateKey == 'string' ) {
            this.privateKey = Buffer.from(privateKey, 'hex');        
        }
        else if ( privateKey instanceof Buffer ) {
            this.privateKey = privateKey;
        }
        else {
            throw new Error("Unknown data passed to WeiKeyAccount for private key. Must be string or Buffer.");
        }
    }

    /**
     * Generate a new private key and instantiate a @{link WeiKeyAccount}.
     *
     * @param {Wei} wei - The wei object to use.
     * @returns {WeiKeyAccount} The created key account.
     */
    static create(wei) {
        let privateKey;

        do {
            privateKey = crypto.randomBytes(32);
        } while ( !secp256k1.privateKeyVerify(privateKey) );

        return new WeiKeyAccount(wei, privateKey);
    }   

    /**
     * Get the public key of the account.
     *
     * @returns {Buffer} The public key of the account.
     */
    get publicKey() {
        return secp256k1.publicKeyCreate(this.privateKey, false).slice(1);
    }

    /**
     * Get the address of the account.
     *
     * @returns {string} The address of the account.
     */
    get address() {
        return WeiUtil.hex(WeiUtil.hash(this.publicKey).slice(-20));
    }

    /**
     * Get the nonce to be used in the transaction of this account.
     * This is given as the amount of transactions sent by this account as of the
     * latest block.
     * 
     * @returns {number} The nonce of the account.
     */
    async nonce() {
        const raw = await this._wei.rpc.eth.getTransactionCount(this.address, 'latest');
        return (new BN(raw.substring(2), 16)).toNumber();
    }

    /**
     * Sign a given message with the loaded private key. This will hash the data using {@link WeiUtil#hash}
     * and then sign it.
     *
     * @param {*} msg - The message to be signed.
     * @returns {Object} signature - The r, s, and v components of the signature, formatted
     * in the way that ecsign/ecrrecover would want.
     */
    sign(msg) {
        const sig = secp256k1.sign(WeiUtil.hash(msg), this.privateKey);

        return {
            r: sig.signature.slice(0, 32),
            s: sig.signature.slice(32, 64),
            v: sig.recovery + 27
        };
    }

    /**
     * Send a transaction using the account.
     *
     * @param {WeiTransaction} transaction - The transaction to send.
     * @returns {string} The transaction hash of the sent transaction.
     *
     * @description This will take the given {@link WeiTransaction}, generate the necessary nonce,
     * load the gas price from the RPC if necessary, RLP encode the unsigned transaction, sign that,
     * then store the r/s/v values of the transaction, and then encode that into the RLP signature.
     * After this it will send the transaction using sendRawTransaction.
     */
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