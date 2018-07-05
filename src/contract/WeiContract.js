const WeiAccount = require('../account/WeiAccount.js');
const WeiTransaction = require('../account/WeiTransaction.js');
const WeiContractEvent = require('./WeiContractEvent.js');
const WeiContractFunction = require('./WeiContractFunction.js');
const WeiUtil = require('../WeiUtil.js');

const EventEmitter = require('events');

/**
 * A class that wraps a contract and provides useful methods
 *
 * @see {@link WeiContractEvent} for how to use contract events.
 * @see {@link WeiContractFunction} for how to use contract functions.s
 */
class WeiContract extends EventEmitter {
    /**
     * Create a contract. This by default has no specified address, just an ABI
     *
     * @params {Wei} wei - The wei instance to use.
     * @params {Object} abi - The ABI of the contract.
     */
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

    /**
     * Specify the address of the {@link WeiContract}
     *
     * @params {string} address - Address of the contract.
     * @returns {WeiContract} Returns itself for chaining.
     */
    at(address) {
        if ( !address) {
            return this;
        }

        this.address = address;

        for ( const event in this.events ) {
            this.events[event]._address = address;
        }

        for ( const fn in this.functions ) {
            this.functions[fn]._address = address;
        }

        return this;
    }

    /**
     * Deploy the contract.
     * 
     * @params {Buffer} code - Buffer of the code to be deployed.
     * @params {... *} args - The arguments of the constructor. These are optional
     * @params {Object} txObj - The last argument must be an object that specifies a transaction object
     * that can either be parsed by the RPC or by {@link WeiTransaction.fromObject}. The from member can
     * be either a string of the address or a {@link WeiAccount}.
     */
    async deploy(code, ... args) {
        const txObj = WeiUtil.isObj(args[args.length - 1]) ? args.pop() : {};

        txObj.data = code;

        // Add the arguments to the end of the code
        if ( args.length > 0 ) {
            if ( !this._constructor ) {
                throw new Error("Passed args for a constructor that doesn't exist");
            }

            const encodedArgs = this._constructor.abi.encode(args);

            txObj.data = Buffer.concat([ txObj.data,  encodedArgs]);
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
        const receipt = await this._wei.rpc.eth.getTransactionReceipt(hash);
        this.at(receipt['contractAddress']);

        return this;
    }

    /**
     * Load helper classes from the ABI.
     *
     * @private
     */
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
                break;
            case "fallback":
                this._payableFallback = obj.payable;
                // TODO - use this information somewhere
                break;
            default:
                console.warn("Unsupported type", obj.type, obj);
                break;
            }
        }
    }

    /**
     * Create helper functions on the contract object to make life easier.
     *
     * @private
     */
    _initShims() {
        // Expose functions directly and inject address
        for ( const fn in this.functions ) {
            this[fn] = (... args) => this.functions[fn].exec(... args);
        }

        // Expose events directly
        for ( const event in this.events ) {
            this[this.events[event].abi.name] = this.events[event];
        }
    }
}

module.exports = WeiContract;