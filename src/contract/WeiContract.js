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
        this._initFunctions();
    }

    at(address) {
        this.address = address;
        return this;
    }

    _initABI() {
        for ( const obj of this.abi ) {
            if ( obj.type == "function" ) {
                this.functions[obj.name] = new WeiContractFunction(this._wei, obj);
            }
            else {
                console.warn("Unsupported type", obj.type);
            }
        }
    }

    _initFunctions() {
        for ( const fn in this.functions ) {
            this[fn] = (... args) => this.functions[fn].exec(this.address, ... args);
        }
    }
}

module.exports = WeiContract;