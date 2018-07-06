/** An abstract class for the provider of the Ethereum RPC methods. */
class WeiProvider {
    /**
     * Create a provider. Do not call this directly as this is an abstract class.
     */
    constructor() {
        this._id = 0;
    }

    /**
     * Send data to the RPC.
     *
     * @param {string} payload - Data to be sent to the RPC.
     * @returns {string} The result from the RPC.
     * @abstract
     */
    async send(/* payload */) {
        throw new Error("Unimplemented method");
    }

    /** 
     * Send a properly formatted RPC request.
     *
     * @param {string} method - The method to send.
     * @param {*} params - The parameteres of the method.
     * @returns {string} The result of the RPC method. This is sometimes JSON encoded.
     */
    async rpc(method, params = []) {
        return await this.send({
            "jsonrpc": "2.0",
            "method": method,
            "params": params, 
            "id": this._id++
        });
    }
}

module.exports = WeiProvider;