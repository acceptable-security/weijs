const BN = require('bn.js');
const WeiABI = require('./abi/WeiABI.js');

function defaultToHex(obj, name, def) {
	obj[name] = obj[name] || new BN(def);

	if ( typeof def != 'object' ) {
		if ( obj.constructor.name != 'BN' ) {
			obj[name] = new BN(obj[name]);
		}

		obj[name] = '0x' + obj[name].toString(16);		
	}
	else if ( def instanceof Buffer) {
		obj[name] = '0x' + (obj[name] || def).toString('hex');
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
	}

	async exec(address, ... args) {
		const txObj = args[args.length - 1];
		txObj['to'] = txObj['to'] || address;

		if ( !validateTxObj(txObj) ) {
			throw new Error("Last argument to a function must be the txobj");
		}

	
		const encode = this.abi.encode(args);
		const res = {};

		defaultToHex(txObj, 'data', encode);

		res['rawOutput'] = await this._wei.rpc.eth.call(txObj, 'latest');
		res['output'] = this.abi.decode(Buffer.from(res['rawOutput'].substring(2), 'hex'));

		if ( !txObj['const'] ) {
			res['txHash'] = await this._wei.rpc.sendTransaction(txObj);
			res['txReceipt'] = await this._wei.rpc.getTransactionReceipt(res['txHash']);
		}

		return res;
	}
}

module.exports = WeiContractFunction;