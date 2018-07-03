const BN = require('bn.js');

const WeiABIType = require('./WeiABIType.js');
const WeiUtil = require('../../WeiUtil.js');

class WeiFunctionABI {
    constructor(abi) {
        this.abi = abi;
        this.inputs = (this.abi.inputs || []).map((x) => new WeiABIType(x));
        this.outputs = (this.abi.outputs || []).map((x) => new WeiABIType(x));

        // Generate the Signature
        const args = this.abi.inputs.map((obj) => obj.type).join(",");

        this.signature = `${abi.name || 'constructor'}(${args})`;
    }

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