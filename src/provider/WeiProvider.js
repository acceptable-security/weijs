class WeiProvider {
    constructor() {
        this._id = 0;
    }

    async send(/* payload */) {
        throw new Error("Unimplemented method");
    }

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