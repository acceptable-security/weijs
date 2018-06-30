const WeiProvider = require("./WeiProvider.js");

class WeiWeb3Provider extends WeiProvider {
	constructor(provider) {
		super();
		this.provider = provider;
	}

	async send(payload) {
		return new Promise((resolve, reject) => {
			payload.sendAsync(payload, (err, res) => {
				if ( err || !res ) {
					reject(err);
				}
				else {
					resolve(res);
				}
			});
		});
	}
}

module.exports = WeiWeb3Provider;