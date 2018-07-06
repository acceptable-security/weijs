const WeiType = require('./WeiType.js');

class WeiTypeTuple extends WeiType {
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