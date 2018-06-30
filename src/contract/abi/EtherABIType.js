const EtherDynamicTypes = ['string', 'bytes'];

class EtherABIType {
	constructor(abiType) {
		this.name = abiType.name;
		this.type = abiType.type;
		this.components = abiType.components.map((x) => new EtherABIType(x));

		this.parseType();
	}

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
		const simpleType = this.type.substring(0, simpleTypeLen);

		if ( EtherDynamicTypes.indexOf(simpleType) > -1 ) {
			// string/bytes types
			this.isDynamicType = true;
			this.isSimpleType = false;
		}
		else if ( simpleType.startsWith('uint') || simpleType.startsWith('int') ) {
			// uint<M>/int<M>/uint/int based types. Defaults to 256 bits
			this.isInt = true;
			this.intSigned = !simpleType.startsWith('u');
			this.intSize = parseInt(simpleType.substring(this.signed ? 3 : 4) || '256');

			assert(this.intSize % 2 == 0);
			assert(this.intSize <= 256);
		}
		else if ( simpleType.startsWith('bytes') ) {
			// bytes<M> types
			this.isStaticBytes = true;
			this.byteCount = parseInt(simpleType.substring(5));

			assert(this.byteCount >= 0 && this.byteCount <= 32);
		}
		else {
			// Other qWirKy TyPeS
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
	
	// Is this a static type
	get isStatic() {
		const staticChildren = this.components.map((x) => x.isStatic)
											  .reduce((x, y) => x && y, true);

		return this.isDynamicArray || this.isDynamicType || staticChildren;
	}

	encodeStatic(arg) {
		if (  )
	}
}

module.exports = EtherABIType;