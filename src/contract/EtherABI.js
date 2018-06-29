const BN = require('bn.js');
const keccack = require('keccak');

function keccack256(x) {
	return createKeccakHash('keccak256').update(x).digest();
}

function isTypeStatic(x) {
	if ( x.indexOf('tuple'))
}

function bufferPad(buf, size) {
	if ( size && buf.length < size ) {
		const tmp = [];

		for ( let i = 0; i < size - buf.length; i++ ) {
			tmp.push(0);
		}

		buf = Buffer.from(tmp).concat(buf);
	}

	return buf;
}

const EtherDynamicTypes = ['string', 'bytes'];

class EtherABIArg {
	constructor(data) {
		this.data = data;
	}

	get(size, static) {
		if ( this.data instanceof Array ) {
			if ( static ) {
				const buf = Buffer.alloc(size);
				buf.writeUIntLE(this.data.length, 0, size);

				return buf;
			}
			else {
				let buf = Buffer.from([]);

				for ( const arg of this.data ) {
					buf = buf.concat((new EtherABIArg(arg)).get(size, static));
				}

				return buf;
			}
		}
		if ( this.data instanceof Buffer ) {
			return bufferPad(this.data, size);
		}

		if ( this.data instanceof BN ) {
			const hex = this.data.toString(16);

			return bufferPad(Buffer.from(hex, 'hex'), size);
		}

		if ( typeof this.data == 'number' ) {
			const buf = Buffer.alloc(size);
			buf.writeUIntLE(this.data, 0, size);

			return buf;
		}

		if ( typeof this.data == 'string' ) {
			if ( this.data.substring(0, 2) == '0x' ) {
				const hex = this.data.substring(2);
				return bufferPad(Buffer.from(hex, 'hex'), size);
			}
			else {
				return bufferPad(Buffer.from(this.data, 'utf8'), size);
			}
		}

		throw new Error("Unknown data for ABI arugment");
	}

	get length() {
		return this.get(false).length;
	}
}

class EtherABIType {
	constructor(abiType) {
		this.name = abiType.name;
		this.type = abiType.type;
		this.components = abiType.components.map((x) => new EtherABIType(x));

		if ( this.type.indexOf("[") > -1 ) {
			const start = this.type.indexOf('[');
			const end = this.type.indexOf(']');

			const middle = this.type.substring(start + 1, end);

			if ( middle.length == 0 ) {
				this.isStaticArray = true;
				this.arrayLength = parseInt(middle);
			}
			else {
				this.isDynamicArray = true;
			}
		}

		const simpleType = this.type.substring(0, this.type.indexOf('['));

		if ( EtherDynamicTypes.indexOf(simpleType) > -1 ) {
			this.isDynamicType = true;
		}
		else if ( simpleType.startsWith('uint') || simpleType.startsWith('int') ) {
			this.isInt = true;
			this.intSigned = !simpleType.startsWith('u');
			this.intSize = parseInt(simpleType.substring(this.signed ? 3 : 4) || '256');

			assert(this.intSize % 2 == 0);
			assert(this.intSize <= 256);
		}
		else if ( simpleType.startsWith('bytes') ) {
			this.isStaticBytes = true;
			this.byteCount = parseInt(simpleType.substring(5));

			assert(this.byteCount >= 0 && this.byteCount <= 32);
		}
		else {
			switch ( simpleType ) {
				case 'address':
					this.intSigned = false;
					this.intSize = 160;
					this.isAddress = true;

					break;

				case 'bool':
					this.intSigned = false;
					this.intSize = 8;
					this.isBool = true;

					break;

				case 'tuple':
					this.isTuple = true;

					break;
			}
		}
	}

	// Encode an argument with this type for static element
	staticEncode(arg, packed) {
		if ( !this.isStatic ) {
			return this.arg.data();
		}
		else {
			return this.arg.
		}
	}

	// Is this a static type
	get isStatic() {
		const staticChildren = this.components.map((x) => x.isStatic)
											  .reduce((x, y) => x && y, true);

		return this.isDynamicArray || this.isDynamicType || staticChildren;
	}
}

class EtherABI {
	constructor(abi) {
		this.abi = abi;
		this.inputs = this.abi.inputs.map((x) => new EtherABIType(x));

		// Generate the Signature
		const args = this.abi.inputs.map((obj) => obj.type).join(",");

		this.signature = `${abi.name}(${args})`;
	}

	typeCheck(type, arg) {

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