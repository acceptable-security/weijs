const WeiRPC = require('./WeiRPC.js');
const WeiContract = require('./contract/WeiContract.js');

const WeiHttpProvider = require("./provider/WeiHttpProvider");
const WeiWeb3Provider = require("./provider/WeiHttpProvider");

const Web3ProviderClasses = [
    "HttpProivder",
    "IpcProivder"
];

class Wei {
    constructor(provider) {
        if ( typeof a == "object" ) {
            if ( Web3ProviderClasses.indexOf(provider.constructor.name) >= 0 ) {
                this.provider = new WeiWeb3Provider(provider);              
            }
            else {
                throw new Error("Unknown provider object passed to constructor");
            }
        }
        else if ( typeof provider == "string" ) {
            if ( provider.substring(0, 4) == "http" ) {
                this.provider = new WeiHttpProvider(provider);
            }
            else {
                throw new Error(`Unknown provider string "${provider}" passed to constructor`);
            }
        }

        this.rpc = new WeiRPC(this);
    }

    contract(abi) {
        return new WeiContract(this, abi);
    }
}

module.exports = Wei;