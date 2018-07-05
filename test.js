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
