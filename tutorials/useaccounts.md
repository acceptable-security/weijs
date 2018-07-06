# Accounts

Accounts in wei.js are used to represent key/address pairs in a way that is abstract from how they are used internally.

## Account Types

There are two types of accounts that can be utilized in the wei.js ecosystem.

### WeiRPCAccount

Once type of accounts are Ethereum RPC accounts. These are automatically loaded using the [eth_accounts](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_accounts) RPC call and will internally use the [eth_sendTransaction](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sendtransaction) RPC call in order to send transactions. Please note that if you do intend on using the automatically loaded `WeiRPCAccount`s, you must wait until the `wei.accountsPromise` promise is fulfilled. Because all RPC accesses in wei.js are asynchronous, the accounts aren't loaded directly in the constructor, rather a promise is created in the constructor that they will be loaded in. If you try to access the accounts immediately after the constructor without awaiting that promise, it is likely you will find that no accounts had been loaded yet. See the example below for how to accomplish this.

```javascript
const Wei = require('weijs');
const wei = new Wei(/* provider */);
await wei.accountsPromise;
```

### WeiKeyAccount

The other type of account currently supported of account is one that is based off of a secp256k1 private key. These are handled by the [secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node) library, and will manually construct and sign transactions which are sent via [eth_sendRawTransaction](https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sendrawtransaction). Key accounts are not stored by wei.js, so one must take care to store the private key if they wish it to be persistent.

## Accounts Usage

Accounts can be accessed through the `WeiAccountManager` exposed through `wei.accounts`. It provides many facilities for safely accessing accounts. It will automatically be populated with the `WeiRPCAccount` objects on construction of the `Wei` class. This can be iterated through like the following:

```javascript
const Wei = require('weijs');
const wei = new Wei(/* provider */);
await wei.accountsPromise;

for ( let i = 0; i < wei.accounts.length; i++ ) {
	const account = wei.accounts.get(0);
	console.log(i, account.address);
}
```

The `WeiAccountManager#get` method can also take an address as a string, and it will return the corresponding account object if it is found in it it's internal storage. All accounts also expose the `sendTransaction` object, which provides an interface for sending an Ethereum transaction wrapped in a `WeiTransaction`.

### Accounts Creation

Right now the only new accounts that can be created are through `WeiAccountManager#newKeyAccount`, which will generate a new private key and create a new `WeiKeyAccount` from it.