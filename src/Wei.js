const WeiHttpProvider = require("./provider/WeiHttpProvider");
const WeiWeb3Provider = require("./provider/WeiHttpProvider");

const Web3ProviderClasses = [
	"HttpProivder",
	"IpcProivder"
];

const WeiRPC = [
	"web3_clientVersion",
	"web3_sha3",
	"net_version",
	"net_peerCount",
	"net_listening",
	"eth_protocolVersion",
	"eth_syncing",
	"eth_coinbase",
	"eth_mining",
	"eth_hashrate",
	"eth_gasPrice",
	"eth_accounts",
	"eth_blockNumber",
	"eth_getBalance",
	"eth_getStorageAt",
	"eth_getTransactionCount",
	"eth_getBlockTransactionCountByHash",
	"eth_getBlockTransactionCountByNumber",
	"eth_getUncleCountByBlockHash",
	"eth_getUncleCountByBlockNumber",
	"eth_getCode",
	"eth_sign",
	"eth_sendTransaction",
	"eth_sendRawTransaction",
	"eth_call",
	"eth_estimateGas",
	"eth_getBlockByHash",
	"eth_getBlockByNumber",
	"eth_getTransactionByHash",
	"eth_getTransactionByBlockHashAndIndex",
	"eth_getTransactionByBlockNumberAndIndex",
	"eth_getTransactionReceipt",
	"eth_getUncleByBlockHashAndIndex",
	"eth_getUncleByBlockNumberAndIndex",
	"eth_getCompilers",
	"eth_compileLLL",
	"eth_compileSolidity",
	"eth_compileSerpent",
	"eth_newFilter",
	"eth_newBlockFilter",
	"eth_newPendingTransactionFilter",
	"eth_uninstallFilter",
	"eth_getFilterChanges",
	"eth_getFilterLogs",
	"eth_getLogs",
	"eth_getWork",
	"eth_submitWork",
	"eth_submitHashrate",
	"db_putString",
	"db_getString",
	"db_putHex",
	"db_getHex",
	"shh_post",
	"shh_version",
	"shh_newIdentity",
	"shh_hasIdentity",
	"shh_newGroup",
	"shh_addToGroup",
	"shh_newFilter",
	"shh_uninstallFilter",
	"shh_getFilterChanges",
	"shh_getMessages"
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

		this._loadRPCGetters();
	}

	_loadRPCGetters() {
		// Create a series of getters 
		for ( const name of WeiRPC ) {		
			const parts = name.split('_');

			if ( this[parts[0]] == undefined ) {
				this[parts[0]] = {};
			}

			this[parts[0]][parts[1]] = async (... args) => this.provider.rpc(name, args);
		}
	}
}

module.exports = Wei;