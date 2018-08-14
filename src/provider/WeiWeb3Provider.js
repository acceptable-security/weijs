const WeiProvider = require("./WeiProvider.js");

/** A {@link WeiProvider} object that can wrap a Web3 provider. */
class WeiWeb3Provider extends WeiProvider {
    /**
     * Create a provider that wraps a Web3 provider.
     *
     * @param {(Web3.HttpProvider|Web3.IpcProvider)} provider - The Web3 provider.
     */
    constructor(provider) {
        super();
        this.provider = provider;
    }

    /**
     * Send data to the Web3 provider. Will call sendAsync and wrap that with a promise.
     *
     * @param {(string|Object)} payload - Data to be sent to the RPC.
     * @returns {string} The result from the RPC.
     */
    send(payload) {
        return new Promise((resolve, reject) => {
        	this.provider.sendAsync(payload, (err, res) => {
                if ( err ) {
                    reject(err);
                    return;
                }

                if ( res.error ) {
                    reject(new Error(res.error.message));
                }
                else if ( !res.result ) {
                    reject(new Error(`Failed to get a response: ${JSON.stringify(res, 0, 4)}`));
                }
                else {
                    resolve(res.result);
                }
            });
        });
    }
}

module.exports = WeiWeb3Provider;