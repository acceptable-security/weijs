const WeiAccount = require('./WeiAccount.js');

class WeiKeyAccount extends WeiAccount {
    constructor(wei, number) {
        super(wei);

        wei.rpc.eth.accounts().then((accounts) => {
            this.address = accounts[number];
        });
    }

    async sendTransaction(transaction) {
        return await this._wei.rpc.eth.sendTransaction(transaction.toObject());
    }
}

module.exports = WeiKeyAccount;