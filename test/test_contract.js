const SimpleStorage = require('../examples/SimpleStorage.js');
const Wei = require('../src/Wei.js');

const assert = require('assert');
const secp256k1 = require('secp256k1');

describe('Wei', function() {
    describe('#accounts', function() {
        it('should correctly load accounts API', async function() {
            const wei = new Wei("http://localhost:8545");
            await wei.accountsPromise;

            const accounts = wei.accounts;

            assert.equal(accounts.length, 1);
        });

        it('should be able to create a new key account', async function() {
            const wei = new Wei("http://localhost:8545");
            await wei.accountsPromise;

            const accounts = wei.accounts;
            const account = wei.accounts.newKeyAccount();

            assert.equal(accounts.length, 2);
            assert.deepStrictEqual(accounts.get(1), account);
            assert(secp256k1.privateKeyVerify(account.privateKey));
        });

        it('should be able to load a key account', async function() {
            const wei = new Wei("http://localhost:8545");
            await wei.accountsPromise;

            const privateKey = Buffer.from('1a0b24d3b90c12de0e14e28aeb0e05d95ab4d0699dbbcea877c046dd8a7715a1', 'hex');
            const publicKey = Buffer.from('19222e95793ae57b18c3fb866bcf52fc4ffb51174464d6eb3156279d29e4672f8867d43f2ac7f20c42d7694119f00d6c57900f02726cee28170f9022b5a84d77', 'hex');                
            const address = '0x1cdb6d68f8682d4999db4483e5507a3db6ac2c78';

            const accounts = wei.accounts;
            const account = wei.accounts.addKeyAccount(privateKey);
    
            assert.equal(accounts.length, 2);
            assert.deepStrictEqual(account.privateKey, privateKey);
            assert.deepStrictEqual(account.publicKey, publicKey);
            assert.equal(account.address, address);
        });
    });
});

describe('SimpleStorage', function () {
    it('should correctly deploy', async function () {
        const wei = new Wei("http://localhost:8545");

        const contract = wei.contract(SimpleStorage.abi);
        const account = wei.accounts.newKeyAccount();
        await contract.deploy(SimpleStorage.bytecode, '0x1234567890', { from: account });

        assert(contract.address.length > 2);
    });

    it('should correctly get data', async function () {
        const wei = new Wei("http://localhost:8545");

        const contract = wei.contract(SimpleStorage.abi);
        const account = wei.accounts.newKeyAccount();
        await contract.deploy(SimpleStorage.bytecode, '0x1234567890', { from: account });

        assert.equal((await contract.get()).output[0].toString(16), '1234567890');
    });

    it('should correctly get/set from a uint256', async function () {
        const wei = new Wei("http://localhost:8545");

        const contract = wei.contract(SimpleStorage.abi);
        const account = wei.accounts.newKeyAccount();
        await contract.deploy(SimpleStorage.bytecode, '0x1234567890', { from: account });

        await contract.set('0xdeadbeef', { from: account });

        assert.equal((await contract.get()).output[0].toString(16), 'deadbeef');
    });

    it('should correctly get/set from a uint256 array', async function () {
        const wei = new Wei("http://localhost:8545");

        const contract = wei.contract(SimpleStorage.abi);
        const account = wei.accounts.newKeyAccount();
        await contract.deploy(SimpleStorage.bytecode, '0x1234567890', { from: account });

        await contract.setFirst(['0xcafebabe'], {from: account});

        assert.equal((await contract.get()).output[0].toString(16), 'cafebabe');
    })
});