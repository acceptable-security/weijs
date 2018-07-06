# Usage

The main usage of the wei.js library comes from the `Wei` class. This class is instantiated with a provider, and providers a series of functions that allow users to interact with the Ethereum Blockchain. **Note: This is not a primer on Ethereum/smart contracts, and assumes a proficiency with Ethereum, Solidity, and related topic matter.**

```javascript
const Wei = require('weijs');
const wei = new Wei(/* provider */);
```

See the links above on how to use specific features in the wei.js library. A quick note on the use of `async`/`await` in nodejs, I recommend using this little wrapper because `await` can't be called from the global context in nodejs:

```javascript
const Wei = require('weijs');
const wei = new Wei(/* provider */);

async function main() {
    // Code goes here
}

// (Calls main as an async function)
(async () => { await main(); })().then(() => {}).catch(console.error);
```