# Installing Dependencies

This tutorial will walk you through installing the necessary components to get wei.js to run.

## nodejs

wei.js currently only supports the [nodejs](https://nodejs.org) platform, however in the future may be browserified. However for using the current version, you must install nodejs. For Linux/macOS users, we recommend using the [nvm](https://github.com/creationix/nvm) (node version manager), which is a simple and flexible tool that allows you to install and manage many different versions of nodejs. There is also a [windows version](https://github.com/coreybutler/nvm-windows) of nvm, however this has not been validated to work.

## geth

Currently wei.js has been primarily tested with [geth](https://github.com/ethereum/go-ethereum). While [parity](https://www.parity.io) and other Ethereum clients that expose the standard HTTP RPC are supported, they have not been tested yet, and until then it is recommended that you use geth. For all users, binaries can be acquired from [here](https://geth.ethereum.org/downloads/), or through your package manager.

## wei.js

wei.js can be installed using npm. Specifically you can run `npm install weijs`, which will install the wei.js package from [the npm repository](https://www.npmjs.com/package/weijs). If you want to run the latest version of wei.js, you can do so by executing the following commands (excluding the `$`).

```
$ git clone https://github.com/block8437/weijs
$ cd weijs
$ npm install -g
```