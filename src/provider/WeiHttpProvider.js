const request = require('request');
const WeiProvider = require("./WeiProvider.js");

class WeiHttpProvider extends WeiProvider {
    constructor(link) {
        super();
        this.link = link;
    }

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