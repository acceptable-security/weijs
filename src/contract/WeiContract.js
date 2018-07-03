const WeiAccount = require('../account/WeiAccount.js');
const WeiTransaction = require('../account/WeiTransaction.js');
const WeiContractEvent = require('./WeiContractEvent.js');
const WeiContractFunction = require('./WeiContractFunction.js');
const WeiUtil = require('../WeiUtil.js');

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

        for ( const fn in this.functions ) {
            this.functions[fn]._address = address;
        }

        return this;
    }

    // Deploy the contract
    async deploy(code, ... args) {
        const txObj = WeiUtil.isObj(args[args.length - 1]) ? args.pop() : {};
        txObj.data = code;

        if ( args.length > 0 ) {
            txObj.data = Buffer.concat([ txObj.data, this._constructor.abi.encode(args) ]);
        }

        let hash;

        const sender = txObj['from'];

        // Deploy contract and get transaction hash
        if ( typeof sender == 'string') {
            txObj['from'] = sender;
            hash = await this._wei.rpc.eth.sendTransaction(txObj);                
        }
        else if ( sender instanceof WeiAccount ) {
            txObj['from'] = sender.address;
            hash = await sender.sendTransaction(WeiTransaction.fromObject(txObj));
        }
        else {
            throw new Error("Unknown sender field of transaction");
        }

        // Load our address from receipt
        const receipt = await this._wei.rpc.getTransactionReceipt(hash);
        this.address = receipt['contractAddress'];

        return this;
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
            case "constructor":
                this._constructor = new WeiContractFunction(this._wei, obj);
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
            this[fn] = this.functions[fn].exec;
        }

        // Expose events directly
        for ( const event in this.events ) {
            this[this.events[event].abi.name] = this.events[event];
        }
    }
}

module.exports = WeiContract;