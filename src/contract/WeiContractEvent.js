const EventEmitter = require('events');
const WeiEventABI = require('./abi/WeiEventABI.js');

class WeiContractEventListener extends EventEmitter {
    constructor(event, filterID, interval = 1 * 1000) {
        super();

        this._event = event;
        this._filterID = filterID;

        if ( interval > 0 ) {
            // Async query function
            let queryFn = async () => {
                const events = await this.query();

                for ( const event of events ) {
                    this.emit('event', event);
                }
            };

            // Wrap the async query function in an interval
            let wrapperFn = () => {
                queryFn().then(() => {
                    setTimeout(wrapperFn, interval);
                }).catch((err) => {
                    throw err;
                });
            };

            // Call the interval
            setTimeout(wrapperFn, interval);
        }
    }

    // Query to see if any filter changes have occurred
    async query() {
        const filter = await this._event._wei.rpc.eth.getFilterChanges(this._filterID);
        const parsed = [];

        for ( const log of filter ) {
            parsed.push(this._event.abi.decode(log));
        }

        return parsed;
    }
}

class WeiContractEvent {
    constructor(wei, abi, address = undefined) {
        this._address = address;
        this._wei = wei;
        this.abi = new WeiEventABI(abi);
    }

    // Create a filter and return the ID for a dict with key val pairs
    async createFilter(filterObj) {
        const filter = [this.abi.sig()];

        for ( let i = 0; i < this.abi.indexInputs.length; i++ ) {
            const input = this.abi.indexInputs[i];
            const value = filterObj[input.name];

            if ( value ) {
                filter.push(input.parse(value).encode());
            }
            else {
                filter.push(null);
            }
        }

        return await this._wei.rpc.eth.newFilter({ topics: filter, address: this._address });
    }

    // Create a filter and get all matching events
    async find(filter) {
        return await new WeiContractEventListener(this, await this.createFilter(filter), 0).query();
    }

    // Listen for a filter
    async listen(filter, interval) {
        return new WeiContractEventListener(this, await this.createFilter(filter), interval);
    }
}

module.exports = WeiContractEvent;