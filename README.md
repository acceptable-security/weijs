# ether.js

A simple to use Ethereum APi

## API Example

```javascript
import { Ether } from "etheres";

const ether = new Ether(web3.currentProvider || "http://localhost:4545");

const accounts = await ether.accounts;
const balance = await ether.balance(accounts[0]);

// Ripped from Ethjs
const abi = [{
	"constant": true,
	"inputs": [],
	"name": "totalSupply",
	"outputs":[{"name": "","type": "uint256"}],
	"payable": false,
	"type": "function",
}];

const address = 0x6e0E0e02377Bc1d90E8a7c21f12BA385C2C35f78;

const contract = ether.contract(address, abi);
const totalSupply = await contract.totalSupply();

```