const BN = require('bn.js');

const WeiABIType = require('./WeiABIType.js');
const WeiUtil = require('../../WeiUtil.js');

/**
 * A class that wraps an event's ABI.
 *
 * @see {@link WeiContractEvent} uses this class to wrap it's ABI.
 */
class WeiEventABI {
    /**
     * Create an event ABI wrapper.
     *
     * @param {Object} abi - The ABI to be wrapped.
     */
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

    /**
     * Get the signature of event as it will appear in topic[0]
     *
     * @returns {string} The hashed signature.
     */
    sig() {
        return WeiUtil.hex(WeiUtil.hash(this.signature));
    }

    /**
     * Decode a transaction logs from a transaction
     *
     * @param {Object} The logs from the transaction.
     * @returns {Object} The decoded arguments in a key/value pair corresponding to the name/value of the event field.
     */
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
                const pos = (new BN(data.slice(0, 32))).toNumber();
                const length = (new BN(data.slice(pos, pos + 32))).toNumber();
                args[input.name] = input.parse(data.slice(pos + 32, pos + 32 + length)).decode();
                data = data.slice(32);
            }
        }

        return args;
    }
}

module.exports = WeiEventABI;