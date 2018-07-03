const BN = require('bn.js');
const WeiABI = require('./abi/WeiFunctionABI.js');
const WeiAccount = require('../account/WeiAccount.js');
const WeiTransaction = require('../account/WeiTransaction.js');

function evenPad(hex) {
    if ( hex.length % 2 != 0 ) {
        hex = '0' + hex;
    }

    return hex;
}

function defaultToHex(obj, name, def) {
    obj[name] = obj[name] || new BN(def);

    if ( typeof def != 'object' ) {
        if ( obj.constructor.name != 'BN' ) {
            obj[name] = new BN(obj[name]);
        }

        obj[name] = '0x' + evenPad(obj[name].toString(16));
    }
    else if ( def instanceof Buffer) {
        obj[name] = '0x' + evenPad((obj[name] || def).toString('hex'));
    }
}

function validateTxObj(txObj) {
    if ( typeof txObj != 'object' ) {
        return false;
    }

    if ( typeof txObj['to'] != 'string' ) {
        return false;
    }

    return true;
}

class WeiContractFunction {
    constructor(wei, abi) {
        this._wei = wei;
        this.abi = new WeiABI(abi);
        this.constant = abi.constant;
    }

    async exec(... args) {
        const txObj = args.length > 0 ? args[args.length - 1] : {};
        txObj['to'] = txObj['to'] || this._address;
        txObj['const'] = txObj['const'] == undefined ? this.constant : txObj['const'];

        if ( !validateTxObj(txObj) ) {
            throw new Error("Last argument to a function must be the txobj");
        }

    
        const encode = this.abi.encode(args);
        const res = {};

        defaultToHex(txObj, 'data', encode);

        // Get output of function - this works even on non-constant functions
        // TODO - does this introduce a race condition where the output can be different
        // because of alternative transactions affecting the contract?
        res['rawOutput'] = await this._wei.rpc.eth.call(txObj, 'latest');
        res['output'] = this.abi.decode(Buffer.from(res['rawOutput'].substring(2), 'hex'));

        // If not a constant function, send transaction.
        if ( !txObj['const'] ) {
            const sender = txObj['from'];

            // Execute the transaction and find the receipt
            if ( typeof sender == 'string') {
                res['txHash'] = await this._wei.rpc.eth.sendTransaction(txObj);                
            }
            else if ( sender instanceof WeiAccount ) {
                res['txHash'] = await sender.sendTransaction(WeiTransaction.fromObject(txObj));
            }
            else {
                throw new Error("Unknown item in the 'from' field of transaction");
            }

            res['txReceipt'] = await this._wei.rpc.eth.getTransactionReceipt(res['txHash']);
        }

        return res;
    }
}

module.exports = WeiContractFunction;