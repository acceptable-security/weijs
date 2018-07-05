const WeiAccount = require('./WeiAccount.js');
const WeiKeyAccount = require('./WeiKeyAccount.js');
const WeiRPCAccount = require('./WeiRPCAccount.js');

/**
 * A helper class to aid in the management and creation of the various WeiAccount subclasses.
 */
class WeiAccountManager {
    /**
     * Create an account manager
     *
     * @param {Wei} wei - The wei object to use
     */
    constructor(wei) {
        this._wei = wei;
        this.accounts = [];
    }

    /**
     * Get the amount of accounts loaded
     *
     * @returns {number} Amount of accounts loaded
     */
    get length() {
        return this.accounts.length;
    }

    /**
     * Get an account stored. Either by index or by address.
     *
     * @param {number|string} query - Either the index of the account or the address of the associated account
     * @returns {WeiAccount} Returns the result of the query, or null if not found.
     */
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

    /**
     * Determines if the account manager has an account with the given address
     *
     * @param {string} address - The address to query.
     * @returns {boolean} Whether or not the account was found.
     */
    has(address) {
        return this.get(address) != null;
    }

    /**
     * Add an {@link WeiAccount} to the account manager. Will ignore duplicates (checked by address).
     *
     * @param {WeiAccount} account - The account being added.
     */
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

    /**
     * Add an RPC account by the address. This will initiate a WeiRPCAccount object and add it
     * to the account manager.
     *
     * @param {string} address - The address of the account.
     * @returns {WeiRPCAccount} The created account.
     */
    addRPCAccount(address) {
        if ( typeof address != 'string' ) {
            throw new Error("WeiAccountManager.addRPCAddress only takes strings");
        }

        const account = new WeiRPCAccount(this._wei, address);

        this.addAccount(account);
        return account;
    }

    /** 
     * Add an account by private key. This will initiate a {@link WeiKeyAccount} object and add it
     * to the account manager.
     *
     * @param {string|Buffer} privateKey - The private key of the account
     * @returns {WeiKeyAccount} The created account.
     */
    addKeyAccount(privateKey) {
        if ( typeof privateKey != 'string' && !(privateKey instanceof Buffer) ) {
            throw new Error("WeiAccountManager.addKeyAccount only takes strings and buffers");
        }

        const account = new WeiKeyAccount(this._wei, privateKey);

        this.addAccount(account);
        return account;
    }

    /**
     * Use the {@link WeiKeyAccount#create} method to create a new {@link WeiKeyAccount} and add it
     * to the account manager.
     *
     * @returns {WeiKeyAccount} The created account.
     */
    newKeyAccount() {
        const account = WeiKeyAccount.create(this._wei);

        this.addAccount(account);

        return account;
    }
}

module.exports = WeiAccountManager;