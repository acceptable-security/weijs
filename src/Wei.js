const WeiAccountManager = require('./account/WeiAccountManager');

const WeiRPC = require('./WeiRPC.js');
const WeiContract = require('./contract/WeiContract.js');

const WeiHttpProvider = require("./provider/WeiHttpProvider");
const WeiWeb3Provider = require("./provider/WeiWeb3Provider");

const Web3ProviderClasses = [
    "HttpProivder",
    "IpcProivder",
    "HDWalletProvider"
];

/** Global class for the WeiJS library. */
class Wei {
    /**
     * Create a weijs instance.
     *
     * @param {(Web3.HttpProvider|Web3.IpcProvider|string)} provider - The provider being used for RPC requests. Either a web3 provider that can be wrapper or a string that can be parsed into a provider.
     */
    constructor(provider) {
        // Load provider
        if ( typeof provider == "object" ) {
            // Handle web3 wrapper
            if ( Web3ProviderClasses.indexOf(provider.constructor.name) >= 0 ) {
                this.provider = new WeiWeb3Provider(provider);              
            }
            else {
                throw new Error("Unknown provider object passed to constructor");
            }
        }
        else if ( typeof provider == "string" ) {
            // Load string based providers
            if ( provider.substring(0, 4) == "http" ) {
                this.provider = new WeiHttpProvider(provider);
            }
            else {
                throw new Error(`Unknown provider string "${provider}" passed to constructor`);
            }
        }

        // Create helper classes
        this.rpc = new WeiRPC(this);
        this.accounts = new WeiAccountManager(this);

        // Promise to load accounts.
        this.accountsPromise = new Promise((resolve, reject) => {
            // Add the RPC accounts
            this.rpc.eth.accounts().then((addresses) => {
                for ( const address of addresses ) {
                    this.accounts.addRPCAccount(address);
                }

                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Instantiate a contract class.
     *
     * @param {Object} abi - The abi of the class you wish to use.
     */
    contract(abi) {
        return new WeiContract(this, abi);
    }
}

module.exports = Wei;