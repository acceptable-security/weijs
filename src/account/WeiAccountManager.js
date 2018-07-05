const WeiAccount = require('./WeiAccount.js');
const WeiKeyAccount = require('./WeiKeyAccount.js');
const WeiRPCAccount = require('./WeiRPCAccount.js');

class WeiAccountManager {
    constructor(wei) {
        this._wei = wei;
        this.accounts = [];
    }

    get length() {
        return this.accounts.length;
    }

    get(query) {
        if ( typeof query == 'number' ) {
            return this.accounts[query];
        }
        else if ( typeof query == 'string' && query.substring(0, 2) == '0x' ) {
            for ( const account of this.accounts ) {
                if ( query == account.address ) {
                    return account;
                }
            }

            return null;
        }
        else {
            throw new Error("Unable to query accounts with unknown type");
        }
    }

    has(address) {
        return this.get(address) != null;
    }

    addAccount(account) {
        if ( !(account instanceof WeiAccount) ) {
            throw new Error("WeiAccountManager.addAccount only takes WeiAccount objects");
        }

        // Skip adding a duplicate
        if ( this.has(account.address) ) {
            return;
        }

        this.accounts.push(account);
    }

    addRPCAccount(address) {
        if ( typeof address != 'string' ) {
            throw new Error("WeiAccountManager.addRPCAddress only takes strings");
        }

        const account = new WeiRPCAccount(this._wei, address);

        this.addAccount(account);
        return account;
    }

    addKeyAccount(privateKey) {
        if ( typeof privateKey != 'string' && !(privateKey instanceof Buffer) ) {
            throw new Error("WeiAccountManager.addKeyAccount only takes strings and buffers");
        }

        const account = new WeiKeyAccount(this._wei, privateKey);

        this.addAccount(account);
        return account;
    }

    newKeyAccount() {
        const account = WeiKeyAccount.create(this._wei);

        this.addAccount(account);

        return account;
    }
}

module.exports = WeiAccountManager;