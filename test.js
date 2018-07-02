const Wei = require('./src/Wei.js');
const wei = new Wei("http://localhost:8545");

async function main() {
	console.log(await wei.rpc.eth.accounts());
	console.log(await wei.rpc.eth.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1', 'latest'));

	const tokenABI = [{
		"constant": true,
		"inputs": [{"name": "","type": "address"}],
		"name": "balanceOf",
		"outputs":[{"name": "","type": "uint256"}],
		"payable": false,
		"type": "function",
	}];

	const token = wei.contract(tokenABI).at('0x6781a0f84c7e9e846dcb84a9a5bd49333067b104');

	console.log(await token.balanceOf('0x391115232dbd13b1b713e2911461fa0dd28e49eb', { const: true }));
}

// Fuck you too nodejs.
// (Calls main as an async function)
(async () => { await main() })().then(() => {}).catch(console.error);
