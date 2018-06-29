

class EtherContract {
	constructor(ether, abi = {}) {
		this.abi = abi;
		this._ether = ether;

		this.functions = {};
		this.events = {};
		this.construct = undefined;
	
		this._initABI();
	}

	_initABI() {
		for ( const obj of this.abi ) {
			switch ( obj.type ) {
				case 'function':    this.functions[obj.name] = new EtherContractFunction(this._ether, obj);
				case 'event':       this._initEvent(obj);
				case 'constructor': this._initConstructor(obj);
				case 'fallback':    this._initFallback(obj);
			}
		}
	}
}

module.exports = EtherContract;