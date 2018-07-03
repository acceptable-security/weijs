const WeiAccount = require('./WeiAccount.js');

class WeiRPCAccount extends WeiAccount {
    constructor(wei, address = undefined, number = undefined) {
        super(wei);

        if ( address ) {
        	this.address = address;
        }
        else {
	        wei.rpc.eth.accounts().then((accounts) => {
	            this.address = accounts[number || 0];
	        });
        }
    }

    async sendTransaction(transaction) {
        console.log(transaction.toObject());
        return await this._wei.rpc.eth.sendTransaction(transaction.toObject());
    }
}

module.exports = WeiRPCAccount;