const Wei = require('./src/Wei.js');
const wei = new Wei("http://localhost:8545");

async function main() {
	console.log(await wei.eth.accounts());
	console.log(await wei.eth.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1', 'latest'));
}

// Fuck you too nodejs.
(async () => { await main() })().then(() => {}).catch(console.error);
