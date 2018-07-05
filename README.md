# wei.js

[![Build Status](https://travis-ci.org/block8437/weijs.svg?branch=master)](https://travis-ci.org/block8437/weijs)

A simple to use Ethereum API. Intended to be used as a replacement for web3js.

## Documentation

Documentation for the library can be found at [this link](https://block8437.github.io/weijs/). It is currently incomplete, but can serve as a useful reference for the library.

## Examples

Current examples are spread out. The [examples/erc20.js](https://github.com/block8437/weijs/blob/master/examples/erc20.js) is a simple wrapper class around the ERC20 ABI found in [examples/erc20_abi.js](https://github.com/block8437/weijs/blob/master/examples/erc20_abi.js). There is also [test.js](https://github.com/block8437/weijs/blob/master/test.js) which runs a few basic tests that are intended to be integrated into the automated tests suite, however do demonstrate in a few lines a pretty nice range of how to execute the transactions.

### API Example

Below is an archived version of [test.js](https://github.com/block8437/weijs/blob/master/test.js), in the event that it gets moved. It shows how to use a variety of the different classes.

```javascript
const SimpleStorage = require('./examples/SimpleStorage.js');
const Wei = require('./src/Wei.js');
const wei = new Wei("http://localhost:8545");

async function main() {
    const contract = wei.contract(SimpleStorage.abi);
    const account = wei.accounts.newKeyAccount();
    await contract.deploy(SimpleStorage.bytecode, '0x1234567890', { from: account });
    console.log(contract.address);

    console.log('Output 1:', (await contract.get()).output[0].toString(16));

    await contract.set('0xdeadbeef', { from: account });
    console.log('Output 2:', (await contract.get()).output[0].toString(16));

    await contract.setFirst(['0xcafebabe'], {from: account});
    console.log('Output 3:', (await contract.get()).output[0].toString(16));
}

// (Calls main as an async function)
(async () => { await main(); })().then(() => {}).catch(console.error);
```