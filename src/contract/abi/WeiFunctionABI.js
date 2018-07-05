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
        const args = this.abi.inputs.map((obj) => obj.type).join(",");

        this.signature = `${abi.name || 'constructor'}(${args})`;
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

        // How many bytes of static section
        const staticSection = this.abi.inputs.length * 32;

        // Offsets for the dynamic section
        let currOffset = staticSection;

        let dynamic = Buffer.from([]);

        // Encode static section
        for ( let i = 0; i < this.inputs.length; i++ ) {
            const input = this.inputs[i];
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