class WeiType {
	constructor() {

	}

	encode() {
		throw new Error("This is an abstract type. Do not use directly");
	}

	decode() {
		throw new Error("This is an abstract type. Do not use directly");
	}
}

module.exports = WeiType;