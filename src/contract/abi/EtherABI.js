const BN = require('bn.js');
const keccack = require('keccak');

const EtherABIArg = require('./EtherABIArg.js');
const EtherABIType = require('./EtherABIType.js');

function keccack256(x) {
	return createKeccakHash('keccak256').update(x).digest();
}

class EtherABI {
	constructor(abi) {
		this.abi = abi;
		this.inputs = this.abi.inputs.map((x) => new EtherABIType(x));

		// Generate the Signature
		const args = this.abi.inputs.map((obj) => obj.type).join(",");

		this.signature = `${abi.name}(${args})`;
	}

	encode(args, packed = false) {
		// Start with first 4 bytes of function signature
		const output = keccack256(this.signature).slice(0, 4);

		// How many bytes of static section
		const staticSection = this.abi.inputs.length * 32;

		// Encode static section
		for ( let i = 0; i < this.inputs.length; i++ ) {
			const input = this.inputs[i];

			if ( input.isStatic ) {
				output = output.concat(input.encode(args, packed));
			}
		}

		return output.toString('hex');
	}

	decode(bin) {

	}
}