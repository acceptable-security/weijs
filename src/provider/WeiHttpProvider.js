const request = require('request');
const WeiProvider = require("./WeiProvider.js");

/** A {@link WeiProvider} that uses the HTTP RPC. */
class WeiHttpProvider extends WeiProvider {
    /**
     * Create an HTTP provider.
     *
     * @params {string} link - The HTTP address of the RPC.
     */
    constructor(link) {
        super();
        this.link = link;
    }

    /**
     * Send data to the RPC.
     *
     * @params {(string|Object)} payload - Data to be sent to the RPC. Will be JSON encoded.
     * @returns {string} The result from the RPC.
     */
    async send(payload) {
        return new Promise((resolve, reject) => {
            request.post({
                url: this.link,
                body: JSON.stringify(payload),
                headers: {
                    'content-type': 'application/json'
                }
            }, (err, res, body) => {
                if ( err ) {
                    reject(err);
                }
                else {
                    try {
                        const out = JSON.parse(body);

                        if ( out.error ) {
                            reject(new Error(out.error.message));
                        }
                        else if ( !out.result ) {
                            reject(new Error("Failed to get a response"));
                        }
                        else {
                            resolve(out.result);
                        }

                    }
                    catch (err2) {
                        reject(err2);
                    }
                }
            });
        });
    }
}

module.exports = WeiHttpProvider;