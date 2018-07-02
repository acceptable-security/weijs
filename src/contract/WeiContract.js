const WeiContractEvent = require('./WeiContractEvent.js');
const WeiContractFunction = require('./WeiContractFunction.js');

const EventEmitter = require('events');

class WeiContract extends EventEmitter {
    constructor(wei, abi) {
        super();

        this.abi = abi;
        this.address = null;
        this._wei = wei;

        this.functions = {};
        this.events = {};
        this.construct = undefined;
    
        this._initABI();
        this._initShims();
    }

    // Load the address
    at(address) {
        this.address = address;

        for ( const event in this.events ) {
            this.events[event]._address = address;
        }

        return this;
    }

    // Deploy the contract
    deploy(/* code */) {
        throw new Error("Function not yet implemented");
    }

    // Initialize the ABI objects
    _initABI() {
        let eventObj;

        for ( const obj of this.abi ) {
            switch ( obj.type ) {
            case "function":
                this.functions[obj.name] = new WeiContractFunction(this._wei, obj, this.address);
                break;
            case "event":
                eventObj = new WeiContractEvent(this._wei, obj);
                this.events[eventObj.abi.sig()] = eventObj;
                break;
            default:
                console.warn("Unsupported type", obj.type, obj);
                break;
            }
        }
    }

    // Create the function/events shims
    _initShims() {
        // Expose functions directly and inject address
        for ( const fn in this.functions ) {
            this[fn] = (... args) => this.functions[fn].exec(this.address, ... args);
        }

        // Expose events directly
        for ( const event in this.events ) {
            this[this.events[event].abi.name] = this.events[event];
        }
    }
}

module.exports = WeiContract;