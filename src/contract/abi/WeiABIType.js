const assert = require('assert');

const WeiTypeBytes   = require('./types/WeiTypeBytes.js');
const WeiTypeDynamic = require('./types/WeiTypeDynamic.js');
const WeiTypeFixed   = require('./types/WeiTypeFixed.js');
const WeiTypeNumber  = require('./types/WeiTypeNumber.js');
const WeiTypeTuple   = require('./types/WeiTypeTuple.js');

const WeiDynamicTypes = ['string', 'bytes'];

class WeiABIType {
	constructor(abiType) {
		this.name = abiType.name;
		this.type = abiType.type;
		this.components = (abiType.components || []).map((x) => new WeiABIType(x));

		this.parseType();
	}

	// Parse the type string into valuable data used later on in encoding/decoding
	parseType() {
		// Parse the array component
		if ( this.type.indexOf("[") > -1 ) {
			// Get the positions of the brackets
			const start = this.type.indexOf('[');
			const end = this.type.indexOf(']');

			// Get the middle of that
			const middle = this.type.substring(start + 1, end);

			if ( middle.length > 0 ) {
				// Something inside is a static array
				this.isStaticArray = true;
				this.arrayLength = parseInt(middle);
			}
			else {
				// Nothing inside is a dynamic array
				this.isDynamicArray = true;
			}
		}
		else {
			this.isSimpleType = true;
		}

		// Basic type is the thing the array would be
		const simpleTypeLen = Math.max(this.type.length, this.type.indexOf('['));
		this.simpleType = this.type.substring(0, simpleTypeLen);

		if ( WeiDynamicTypes.indexOf(this.simpleType) > -1 ) {
			// string/bytes types
			this.isDynamicType = true;
			this.isSimpleType = false;
		}
		else if ( this.simpleType.startsWith('uint') || this.simpleType.startsWith('int') ) {
			// uint<M>/int<M>/uint/int based types. Defaults to 256 bits
			this.isInt = true;
			this.intSigned = !this.simpleType.startsWith('u');
			this.intSize = parseInt(this.simpleType.substring(this.signed ? 3 : 4) || '256');

			assert(this.intSize % 2 == 0);
			assert(this.intSize <= 256);
		}
		else if ( this.simpleType.startsWith('bytes') ) {
			// bytes<M> types
			this.isStaticBytes = true;
			this.byteCount = parseInt(this.simpleType.substring(5));

			assert(this.byteCount >= 0 && this.byteCount <= 32);
		}
		else if ( this.simpleType.startsWith('fixed') || this.simpleType.startsWith('ufixed') ) {
			// ufixed<M>x<N> and fixed<M>x<N> types
			this.isFixed = true;
			this.fixedSigned = this.simpleType.startsWith('u');
			const sizePart = this.simpleType.substring(this.fixedSigned ? 6 : 5) || '128x18';
			const sizes = sizePart.split('x');

			this.fixedUpper = parseInt(sizes[0]);
			this.fixedLower = parseInt(sizes[1]);
		}
		else {
			// Other qWirKy TyPeS
			switch ( this.simpleType ) {
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
	
	// Is this a static type
	get isStatic() {
		const staticChildren = this.components.map((x) => x.isStatic)
											  .reduce((x, y) => x && y, true);

		return !this.isDynamicArray && !this.isDynamicType && staticChildren;
	}

	parse(arg, forceSimple = false) {
		if ( !forceSimple && (this.isDynamicType || this.isDynamicArray) ) {
			return new WeiTypeDynamic(this, arg);
		}
		else if ( this.isTuple ) {
			return new WeiTypeTuple(this, arg);
		}
		else if ( this.isInt || this.isAddress || this.isBool ) {
			return new WeiTypeNumber(this, arg);
		}
		else if ( this.isStaticBytes ) {
			return new WeiTypeBytes(this, arg);
		}
		else if ( this.isFixed ) {
			return new WeiTypeFixed(this, arg);
		}

		throw new Error("Failed to figure out type.");
	}
}

module.exports = WeiABIType;