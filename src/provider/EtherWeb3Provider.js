const EtherProvider = require("./EtherProvider.js");

class EtherWeb3Provider extends EtherProvider {
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

module.exports = EtherWeb3Provider;