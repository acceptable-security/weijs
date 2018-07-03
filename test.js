const SimpleStorage = require('./examples/SimpleStorage.js');
const Wei = require('./src/Wei.js');
const wei = new Wei("http://localhost:8545");

async function main() {
    const contract = wei.contract(SimpleStorage.abi);
    const account = wei.accounts.newKeyAccount();
    await contract.deploy(SimpleStorage.bytecode, '0x1234567890', { from: account });
    console.log(contract.address);

    console.log('Decimals:', (await contract.get()).output);

    await contract.set('0xdeadbeef', { from: account });
    console.log('Decimals:', (await contract.get()).output);

    await contract.setFirst(['0xcafebabe'], {from: account});
    console.log('Decimals:', (await contract.get()).output);
}

// Fuck you too nodejs.
// (Calls main as an async function)
(async () => { await main(); })().then(() => {}).catch(console.error);
