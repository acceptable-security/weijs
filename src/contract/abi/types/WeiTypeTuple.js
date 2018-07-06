const WeiType = require('./WeiType.js');

/**
 * A tuple. This is exposed in solidity as structs.
 */
class WeiTypeTuple extends WeiType {
    /**
     * Create a tuple type instance
     *
     * @param {WeiABIType} abiType - The ABI type that generated this instance.
     * @param {Object} input - The argument being handled. The keys correspond to the
     * name of the fields in the struct.
     */
    constructor(abiType, input) {
    	super();
    	
        this.type = abiType;
        this.inputs = [];

        const components = this.type.components;

        // Parse the component types of the input
        for ( const component of components ) {
            const name = component.name;

            // Grab by name, if not available error out.
            if ( !(name in input) ) {
                throw new Error(`Did not find ${name} in the input passed to WeiTypeTuple`);
            }

            this.inputs.push(component.parse(input[name]));
        }
    }
}

module.exports = WeiTypeTuple;