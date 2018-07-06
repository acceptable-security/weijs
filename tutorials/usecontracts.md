# Using Contracts

Contracts in wei.js are instantiated through the `wei.contract` interface, which takes a contract ABI. It will return a `WeiContract` instance, will internally load the ABI to expose a simple to use interface for using and deploying the contract.

```javascript
const Wei = require('wei')
const wei = new Wei(/* provider */);
const contract = wei.contract(/* abi */);
```

## Deployment

Once the contract has been instantiated from `wei.contract` there are two options for using it: deployment or by location. If the contract already exists on the Ethereum blockchain and you want to use it then loading the location can simply be done by calling the `.at` method. In the example above, you could rpelace the last line with `const contract = wei.contract(/* abi */).at(/* address */);` in order to do so. From there you can use the functions/events provided.

However, if the contract has not yet been deployed, and you have the bytecode/Solidity source code, you can deploy the contract using the `.deploy` function. The first argument is a `Buffer` containing the bytecode of the contract. The remaining arguments are the arguments to the constructor of the contract. The last argument however must be an object that contains a `from` key, which points to which account you want to deploy from. Note that the `deploy` method is an asynchronous function and will return a `Promise`. See the example below for usage.

```
const Wei = require('wei')
const wei = new Wei(/* provider */);
await wei.accountsPromise;

const bytecode = Buffer.from(/* bytecode hex */, 'hex'); // Buffer with bytecode
const account = wei.accounts.get(0); // Deploy from the first account
const contract = await wei.contract(/* abi */).deploy(bytecode, /* arguments */, { from: acount });

console.log("Deployed to", contract.address);
```

## Functions

Contract functions are exposed directly on the contract objects, with the same names that they are given in the Solidity code. For example, to call the `transfer` method on an ERC20 token:

```javascript
const Wei = require('wei')
const wei = new Wei(/* provider */);
await wei.accountsPromise;

const account = wei.accounts.get(0); // Deploy from the first account
const contract = wei.contract(/* token abi */).at(/* token address */);

const destination = '0x12345...';
const value = 0x12345....;

await contract.transfer(destination, value, { from: account });
console.log("Transfer complete");
```

The table below provides information on how Solidity types and JavaScript will match up. Further documentation on this matter can be seen in the `WeiType` subclasses.

Solidity Type | JavaScript Types
--------------|----------------------------------
uint/int      | number, buffer, hex string, BN
ufixed/fixed  | number
bytes1..32    | buffer, hex string, utf8 string
string/bytes  | buffer, hex string, utf8 string
type[]        | array of with correct type
struct        | an object of field names to values of appropriate type

## Events

Events are also exposed directly through the contract interface as well. Contract events expose two important methods, `find` and `listen`. Both of them take a filter object, which allow you to narrow down the events you can hear. If none is passed then all events of that type will be caught, however, for example you may wish to only hear events that reference a certain address. You could accomplish that by specifying an object that has `{ myAddressField: '0x...' }`, and if an event with a field called `myAddressField` is thrown, it will only be seen if the address matches that specified in the filter.

The difference between `find` and `listen` is that `find` will query the RPC once for the events, and get all the historic events, and return them directly. `listen` on the other hand will repeatedly query the RPC (you can specify the interval at which this is done in the `listen` arguments). An example is given below of listening for `Transfer` events from an ERC20 contract from a specific address

```javascript
const Wei = require('wei')
const wei = new Wei(/* provider */);
await wei.accountsPromise;

const account = wei.accounts.get(0); // Deploy from the first account
const contract = wei.contract(/* token abi */).at(/* token address */);

contract.Transfer.listen({ _from: '0x12345...' }).on('event', function (event) {
	console.log(event._from, 'transfered', event._value.toString(), 'tokens to', event._to);
});
```

Further documentation can be seen in the `WeiContractEvent` and `WeiEventABI` class documentation.