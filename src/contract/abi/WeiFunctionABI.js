const BN = require('bn.js');

const WeiABIType = require('./WeiABIType.js');
const WeiUtil = require('../../WeiUtil.js');

/**
 * A class that wraps an function's ABI.
 *
 * @see {@link WeiContractFunction} uses this class to wrap it's ABI.
 */
class WeiFunctionABI {
    /**
     * Create a function ABI wrapper.
     *
     * @params {Object} abi - The ABI to be wrapped.
     */

    constructor(abi) {
        this.abi = abi;
        this.inputs = (this.abi.inputs || []).map((x) => new WeiABIType(x));
        this.outputs = (this.abi.outputs || []).map((x) => new WeiABIType(x));

        // Generate the Signature
        // Recursively creating the tuple ones
        const args_map_fn = (obj) => {
            if ( obj.type != 'tuple' ) {
                return obj.type;
            }
            else {
                return "(" + obj.components.map(args_map_fn).join(",") + ")";
            }
        };

        const args = this.abi.inputs.map(args_map_fn).join(",");
        this.signature = `${abi.name || 'constructor'}(${args})`;

        this._flattenInputs();
    }

    /**
     * Flatten the inputs that are tuples
     *
     * @private
     */
    _flattenInputs(inputs = undefined) {
        if ( inputs == undefined ) {
            this.flattenedInputs = [];
            inputs = this.inputs;
        }

        for ( let i = 0; i < inputs.length; i++ ) {
            const input = inputs[i];

            if ( input.components.length > 0 ) {
                this._flattenInputs(input.components);
            }
            else {
                this.flattenedInputs.push(input);
            }
        }
    }

    /**
     * Encode the arguments passed to the function.
     *
     * @params {Array} args - The arguments to be encoded.
     * @returns {Buffer} The encoded arguments.
     */
    encode(args /*, packed = false */) {
        // Start with first 4 bytes of function signature
        let output;

        if ( this.abi.name ) {
            output = WeiUtil.hash(this.signature).slice(0, 4);
        }
        else {
            output = Buffer.from([]);
        }

        if ( args.length != this.inputs.length ) {
            throw new Error(`Found ${args.length} arguments, expected ${this.inputs.length}.`);
        }

        const tmps = args.map((x, i) => [x, this.inputs[i]]);

        for ( let i = 0; i < tmps.length; i++ ) {
            const tmp = tmps[i];
            const input = tmp[1];

            // Skip the non-tuple types
            if ( input.type != 'tuple' ) {
                continue;
            }

            const obj = tmp[0];
            const fields = [];

            // Put component values into fields from obj argument.
            for ( let j = 0; j < input.components.length; j++ ) {
                const component = input.components[j];

                if ( !obj[component.name] ) {
                    throw new Error(`Expected to find ${component.name} in argument.`);
                }

                fields.push([obj[component.name], component]);
            }

            tmps.splice(i, 1, ... fields);
        }

        args = tmps.map(x => x[0]);

        // How many bytes of static section
        const staticSection = this.flattenedInputs.length * 32;

        // Offsets for the dynamic section
        let currOffset = staticSection;

        let dynamic = Buffer.from([]);

        // Encode static section
        for ( let i = 0; i < this.flattenedInputs.length; i++ ) {
            const input = this.flattenedInputs[i];
            const parse = input.parse(args[i]);

            if ( input.isStatic ) {
                output = Buffer.concat([output, parse.encode()]);
            }
            else {
                // Size of the parsed output as a 32 byte big endian number
                const size = (new BN(parse.size())).toBuffer('be', 32);
                
                // Offset of the data in dynamic section
                const offset = (new BN(currOffset)).toBuffer('be', 32);
                output = Buffer.concat([output, offset]);

                // Actual encoded data
                const encode = parse.encode();

                // Past the size and data
                currOffset += encode.length + size.length;

                // Add size/encoded to dynamic section
                dynamic = Buffer.concat([dynamic, size, encode]);
            }
        }

        return Buffer.concat([output, dynamic]);
    }

    /**
     * Decode the result of a function
     *
     * @params {Buffer} bin - The encoded results of a function.
     * @returns {Array} The decoded arguments.
     */
    decode(bin) {
        let tmp = Buffer.from(bin);
        const outputs = [];
        const offsets = [];

        // Static section
        for ( let i = 0; i < this.outputs.length; i++ ) {
            const output = this.outputs[i];
            const data = tmp.slice(0, 32);

            tmp = tmp.slice(32);

            if ( output.isStatic ) {
                // Push the parsed output
                const parsed = output.parse(data).decode();
                outputs.push(parsed);
            }
            else {
                // Make a temporary spcae and put the location of the dynamic
                // object into a offsets array
                outputs.push("tmp");
                offsets.push([i, (new BN(data)).toNumber()]);
            }
        }

        // Dynamic section
        for ( const offpos of offsets ) {
            // Get the position in the outputs and the offset in the output data
            const pos = offpos[0];
            const offset = offpos[1];

            // Get the output type
            const output = this.outputs[pos];

            // Get the actual length of the data
            const len = (new BN(bin.slice(offset, offset + 0x20))).toNumber();

            // Get the data itself
            const data = bin.slice(offset + 0x20, offset + 0x20 + len);

            // Parse and store that data into the position found above
            const parsed = output.parse(data).decode();
            outputs[pos] = parsed;
        }

        return outputs;
    }
}

module.exports = WeiFunctionABI;