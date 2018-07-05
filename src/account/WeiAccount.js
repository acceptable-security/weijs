/** Abstract class that is used for wrapping account related functionalities. */
class WeiAccount {
    /**
     * Create a Wei class. Don't directly call this, instead use one of it's subclasses
     *
     * @param {Wei} wei - The wei object to use
     */
    constructor(wei) {
        this._wei = wei;

        if ( this.constructor.name == 'WeiAccount' ) {
            throw new Error('WeiAccount is a generic class, use a subclass instead');
        }
    }

    /**
     * Get the balance of this account
     *
     * @returns {string} Hex encoded balance of this account
     */
    async balance() {
        return await this._wei.rpc.eth.getBalance(this.address);
    }

    /**
     * Send a transaction using the account.
     *
     * @abstract
     * @param {WeiTransaction} transaction - The transaction to send.
     * @returns {string} The transaction hash of the sent transaction.
     */
    async sendTransaction() {
        throw new Error('WeiAccount is a generic class, use a subclass instead');
    }
}

module.exports = WeiAccount;