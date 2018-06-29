const Ether = require('./src/Ether.js');
const ether = new Ether("http://localhost:8545");

async function main() {
	console.log(await ether.eth.accounts());
	console.log(await ether.eth.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1', 'latest'));
}

// Fuck you too nodejs.
(async () => { await main() })().then(() => {}).catch(console.error);
