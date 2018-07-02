const Wei = require('./src/Wei.js');
const wei = new Wei("http://localhost:8545");
const ERC20 = require('./examples/erc20.js');

async function main() {
	const zapToken = new ERC20(wei, '0x6781a0f84c7e9e846dcb84a9a5bd49333067b104');

	console.log(await zapToken.name());
	console.log(await zapToken.symbol());
}

// Fuck you too nodejs.
// (Calls main as an async function)
(async () => { await main() })().then(() => {}).catch(console.error);
