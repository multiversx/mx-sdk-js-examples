import { ApiNetworkProvider, ProxyNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore
import { addressOfAlice, addressOfBob, completedTransactionsHashes, getReadyToBroadcastTxLegacy, getReadyToBroadcastTxNext } from "./samples.js"; // md-ignore

const apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com"); // md-ignore
const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com"); // md-ignore
TransactionWatcher.DefaultPollingInterval = 1; // md-ignore

// ## Broadcasting transactions

// ### Preparing a simple transaction

// md-insert:transactionLegacyVsNext

// ```
import { Transaction, TransactionNext, TransactionPayload } from "@multiversx/sdk-core";

const txNext = new TransactionNext({
    data: new TextEncoder().encode("food for cats"),
    gasLimit: 70000n,
    sender: addressOfAlice.toBech32(),
    receiver: addressOfBob.toBech32(),
    value: 1000000000000000000n,
    chainID: "D"
});

txNext.nonce = 42n;

const txLegacy = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    value: "1000000000000000000",
    chainID: "D"
});

txLegacy.setNonce(43);
// ```

// ### Broadcast using a network provider

// :::important
// Note that the transactions **must be signed before being broadcasted**. 
// On the front-end, signing can be achieved using a signing provider.
// On this purpose, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
// :::

// In order to broadcast a transaction, use a network provider:

// ```
const readyToBroadcastTxLegacy = getReadyToBroadcastTxLegacy(); // md-ignore
const readyToBroadcastTxNext = getReadyToBroadcastTxNext(); // md-ignore

try { // md-ignore
    const txHashNext = await apiNetworkProvider.sendTransaction(readyToBroadcastTxNext); // md-unindent
    console.log("TX hash:", txHashNext); // md-unindent

    const txHashLegacy = await apiNetworkProvider.sendTransaction(readyToBroadcastTxLegacy); // md-unindent
    console.log("TX hash:", txHashLegacy); // md-unindent
} catch { // md-ignore
} // md-ignore
// ```

// ### Wait for transaction completion

// ```
import { TransactionWatcher } from "@multiversx/sdk-core";

const watcherUsingApi = new TransactionWatcher(apiNetworkProvider);
const txHash = completedTransactionsHashes[0]; // md-ignore
const transactionOnNetworkUsingApi = await watcherUsingApi.awaitCompleted(txHash);
// ```

// If, instead, you use a `ProxyNetworkProvider` to instantiate the `TransactionWatcher`, you'll need to patch the `getTransaction` method,
// so that it instructs the network provider to fetch the so-called _processing status_, as well (required by the watcher to detect transaction completion).

// ```
const watcherUsingProxy = new TransactionWatcher({
    getTransaction: async (hash) => { return await proxyNetworkProvider.getTransaction(hash, true) }
});

const transactionOnNetworkUsingProxy = await watcherUsingProxy.awaitCompleted(txHash);
// ```

// In order to wait for multiple transactions:

// ```
const [tx1, tx2, tx3] = completedTransactionsHashes; // md-ignore
await Promise.all([
    watcherUsingApi.awaitCompleted(tx1), 
    watcherUsingApi.awaitCompleted(tx2), 
    watcherUsingApi.awaitCompleted(tx3)
]);
// ```

// For a different awaiting strategy, also see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).
