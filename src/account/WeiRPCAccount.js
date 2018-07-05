const WeiAccount = require('./WeiAccount.js');

/** A {@link WeiAccount} that wraps an account loaded in the RPC */
class WeiRPCAccount extends WeiAccount {
    /**
     * Create a WeiRPCAccount. This can be created either by address or by index
     *
     * @param {string} address - Address to create the account from.
     * @param {number] index - The index of the account (in eth_accounts) to use.
     */
    constructor(wei, address = undefined, index = undefined) {
        super(wei);

        if ( typeof address == 'string' ) {
        	this.address = address;
        }
        else if ( typeof index == 'number' ) {
	        wei.rpc.eth.accounts().then((accounts) => {
	            this.address = accounts[index || 0];
	        });
        }
        else {
            throw new Error("RPC information wasn't passed to construct of WeiRPCAccount");
        }
    }

    /**
     * Send a transaction using the account.
     *
     * @param {WeiTransaction} transaction - The transaction to send.
     * @returns {string} The transaction hash of the sent transaction.
     *
     * @description This take the {@link WeiTransaction}, put itself in as
     * the from field, parse it to an object, and use eth_sendTransaction
     * to send it.
     */
    async sendTransaction(transaction) {
        transaction['from'] = transaction['from'] || this.address;
        return await this._wei.rpc.eth.sendTransaction(transaction.toObject());
    }
}

module.exports = WeiRPCAccount;