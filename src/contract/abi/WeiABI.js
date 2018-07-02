const BN = require('bn.js');
const keccack = require('keccak');

const WeiABIType = require('./WeiABIType.js');

function keccack256(x) {
	return keccack('keccak256').update(x).digest();
}

class WeiABI {
	constructor(abi) {
		this.abi = abi;
		this.inputs = this.abi.inputs.map((x) => new WeiABIType(x));

		// Generate the Signature
		const args = this.abi.inputs.map((obj) => obj.type).join(",");

		this.signature = `${abi.name}(${args})`;
	}

	encode(args, packed = false) {
		// Start with first 4 bytes of function signature
		let output = keccack256(this.signature).slice(0, 4);

		// How many bytes of static section
		const staticSection = this.abi.inputs.length * 32;

		// Offsets for the dynamic section
		const currOffset = staticSection;

		// Parsed args
		const parsed = [];

		// Encode static section
		for ( let i = 0; i < this.inputs.length; i++ ) {
			const input = this.inputs[i];
			const parse = input.parse(args[i]);

			parsed.push(parse);

			if ( input.isStatic ) {
				console.log()
				output = Buffer.concat([output, parse.encode()]);
			}
			else {
				const offset = (new BN(currOffset)).toBuffer('be', 32);
				output = Buffer.concat([output, offset]);
				currOffset += parse.size();
			}
		}

		return output;
	}

	decode(bin) {

	}
}

module.exports = WeiABI;