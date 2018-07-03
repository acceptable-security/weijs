const BN = require('bn.js');

const WeiABIType = require('./WeiABIType.js');
const WeiUtil = require('../../WeiUtil.js');

class WeiEventABI {
    constructor(abi) {
        this.abi = abi;
        this.name = this.anonymous ? "<anonymous>" : this.abi.name;
        this.inputs = this.abi.inputs.map((x) => new WeiABIType(x));
        this.indexInputs = this.inputs.filter((x) => x.indexed);
        this.unindexInputs = this.inputs.filter((x) => !x.indexed);

        // Generate the Signature
        const args = this.abi.inputs.map((obj) => obj.type).join(",");

        this.signature = `${abi.name}(${args})`;
    }

    sig() {
        return WeiUtil.hex(WeiUtil.hash(this.signature));
    }

    decode(logs) {
        // Decode data and topics to buffers
        let data = Buffer.from(logs.data.substring(2), 'hex');
        const topics = logs.topics.map((x) => Buffer.from(x.substring(2), 'hex'));

        // Make sure this is the right event
        if ( logs.topics[0] != this.sig() ) {
            throw new Error(`Can't decode ${topics[0]} with ${this.sig()}`);
        }

        const args = {};

        // Decode indexed parts
        for ( let i = 0; i < this.indexInputs.length; i++ ) {
            const input = this.indexInputs[i];
            args[input.name] = input.parse(topics[i + 1]).decode();
        }

        // Decode unindexed parts
        for ( let i = 0; i < this.unindexInputs.length; i++ ) {
            const input = this.unindexInputs[i];

            if ( input.isStatic ) {
                args[input.name] = input.parse(data.slice(0, 32)).decode();
                data = data.slice(32);
            }
            else {
                const length = (new BN(data.slice(0, 32))).toNumber();
                args[input.name] = input.parse(data.slice(32, 32 + length));
                data = data.slice(32 + length);
            }
        }

        return args;
    }
}

module.exports = WeiEventABI;