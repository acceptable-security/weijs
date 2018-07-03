class WeiAccount {
    constructor(wei) {
        this._wei = wei;

        if ( this.constructor.name == 'WeiAccount' ) {
            throw new Error('WeiAccount is a generic class, use a subclass instead');
        }
    }

    async balance() {
        return await this._wei.rpc.eth.getBalance(this.address);
    }

    async sendTransaction() {
        throw new Error('WeiAccount is a generic class, use a subclass instead');
    }
}

module.exports = WeiAccount;