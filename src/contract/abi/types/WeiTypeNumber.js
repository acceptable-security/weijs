const assert = require('assert');
const BN = require('bn.js');

class WeiTypeNumber {
	constructor(abiType, input) {
		this.type = abiType;
		assert(this.type.isInt || this.type.isAddress || this.type.isBool);

		if ( input instanceof Buffer ) {
			// Take raw buffer
			assert(input.length <= 32);
			this.data = input;
		}
		else {
			// Convert to bignum and convert to buffer
			if ( typeof input == 'number' ) {
				input = new BN(input);
			}

			if ( typeof input == 'boolean' ) {
				input = new BN(input ? 1 : 0);
			}

			if ( typeof input == 'string' ) {
				if ( input.substring(0, 2) == '0x' ) {
					input = new BN(input.substring(2), 16);
				}
				else {
					throw new Error("Unable to decode number " + input);
				}
			}

			if ( input.constructor.name == 'BN' ) {
				if ( abiType.isIntSigned ) {
					input = input.toTwos(this.type.intSize);
				}

				this.data = input.toBuffer('be', 32);
			}
			else {
				throw new Error("Unknown type");
			}
		}
	}

	encode() {
		return this.data;
	}

	decode() {
		if ( this.type.isIntSigned ) {
			return new BN(this.data).fromTwos(this.type.intSize);
		}
		else {
			return new BN(this.data);
		}
	}
}

module.exports = WeiTypeNumber;