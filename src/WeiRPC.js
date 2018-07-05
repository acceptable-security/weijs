/** The list of RPC methods that can be used */
const WeiRPCMethods = [
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

class WeiRPC {
    /**
     * Create an RPC helper class
     *
     * @param {Wei} - The global wei class to be used for requests
     */
    constructor(wei) {
        this.wei = wei;
        this._loadRPCGetters();
    }

    /**
     * Request the modules loaded in the RPC
     *
     * @returns {Object} A key value pair, where keys are the modules and values are their version
     */
    async modules() {
        return await this.wei.provider.rpc('rpc_modules', []);
    }

    /**
     * Initiate RPC shims
     *
     * @private
     */
    _loadRPCGetters() {
        // Create a series of getters 
        for ( const name of WeiRPCMethods ) {       
            const parts = name.split('_');

            if ( this[parts[0]] == undefined ) {
                this[parts[0]] = {};
            }

            this[parts[0]][parts[1]] = async (... args) => this.wei.provider.rpc(name, args);
        }
    }
}

module.exports = WeiRPC;