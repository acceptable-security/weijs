const Wei = require('./src/Wei.js');
const wei = new Wei("http://localhost:8545");
const ERC20 = require('./examples/erc20.js');

async function main() {
    const token = new ERC20(wei, '0x8d12a197cb00d4747a1fe03395095ce2a5cc6819');
    const emit = await token.contract.Transfer.listen(1 * 1000);
    emit.on('event', (obj) => {
    	console.log("Transfer", obj['_value'].toString(), "from", '0x' + obj['_from'].toString(16), "to", '0x' + obj['_to'].toString(16));
    });   
}

// Fuck you too nodejs.
// (Calls main as an async function)
(async () => { await main(); })().then(() => {}).catch(console.error);
