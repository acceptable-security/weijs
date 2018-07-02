const BN = require('bn.js');
const keccack = require('keccak');

const Pad28 = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const WeiABIType = require('./WeiABIType.js');

function keccack256(x) {
    return keccack('keccak256').update(x).digest();
}

function evenPad(hex) {
    if ( hex.length % 2 != 0 ) {
        hex = '0' + hex;
    }

    return hex;
}

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
        const sig = Buffer.concat([Pad28, keccack256(this.signature).slice(0, 4)]);
        return '0x' + evenPad(sig.toString('hex'));
    }

    decode(logs) {
        let data = logs.data;
        const topics = logs.topic;

        if ( topics[0] != this.sig() ) {
            return;
        }

        const args = {};

        for ( let i = 0; i < this.indexInputs.length; i++ ) {
            const input = this.indexInputs[i];
            args[input.name] = input.parse(topics[i + 1]).decode();
        }


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