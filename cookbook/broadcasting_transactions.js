import { ApiNetworkProvider, ProxyNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore
import { addressOfAlice, addressOfBob, completedTransactionsHashes, getReadyToBroadcastTx } from "./framework.js"; // md-ignore

const apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com", { clientName: "multiversx-sdk-js-examples" }); // md-ignore
const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com", { clientName: "multiversx-sdk-js-examples" }); // md-ignore
const readyToBroadcastTx = getReadyToBroadcastTx(); // md-ignore
TransactionWatcher.DefaultPollingInterval = 1; // md-ignore

// ## Broadcasting transactions

// ### Preparing a simple transaction

// md-insert:transactionLegacyVsNext

// ```js
import { Transaction } from "@multiversx/sdk-core";

const tx = new Transaction({
    data: Buffer.from("food for cats"),
    gasLimit: 70000n,
    sender: addressOfAlice.toBech32(),
    receiver: addressOfBob.toBech32(),
    value: 1000000000000000000n,
    chainID: "D"
});

tx.nonce = 42n;
// ```

// ### Signing a transaction

// :::important
// Note that the transactions **must be signed before being broadcasted**.
// On the front-end, signing can be achieved using a signing provider.
// On this purpose, **we recommend using [sdk-dapp](/sdk-and-tools/sdk-dapp)** instead of integrating the signing providers on your own.
// :::

// md-insert:forSimplicityWeUseUserSigner

// ```js
import { TransactionComputer } from "@multiversx/sdk-core";
import { UserSigner } from "@multiversx/sdk-wallet";
import { promises } from "fs";

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(tx);

tx.signature = await signer.sign(serializedTx);
// ```

// ### Broadcast using a network provider

// In order to broadcast a transaction, use a network provider:

// ```js
try { // md-ignore
    const txHash = await apiNetworkProvider.sendTransaction(readyToBroadcastTx); // md-unindent
    console.log("TX hash:", txHash); // md-unindent
} catch { // md-ignore
} // md-ignore
// ```

// ### Wait for transaction completion

// ```js
import { TransactionWatcher } from "@multiversx/sdk-core";

const watcherUsingApi = new TransactionWatcher(apiNetworkProvider);
const txHash = completedTransactionsHashes[0]; // md-ignore
const transactionOnNetworkUsingApi = await watcherUsingApi.awaitCompleted(txHash);
// ```

// If, instead, you use a `ProxyNetworkProvider` to instantiate the `class:TransactionWatcher`, you'll need to patch the `getTransaction` method,
// so that it instructs the network provider to fetch the so-called _processing status_, as well (required by the watcher to detect transaction completion).

// ```js
const watcherUsingProxy = new TransactionWatcher({
    getTransaction: async (hash) => {
        return await proxyNetworkProvider.getTransaction(hash, true);
    }
});

const transactionOnNetworkUsingProxy = await watcherUsingProxy.awaitCompleted(txHash);
// ```

// In order to wait for multiple transactions:

// ```js
const [txHash1, txHash2, txHash3] = completedTransactionsHashes; // md-ignore
await Promise.all([
    watcherUsingApi.awaitCompleted(txHash1),
    watcherUsingApi.awaitCompleted(txHash2),
    watcherUsingApi.awaitCompleted(txHash3)
]);
// ```

// In some circumstances, when awaiting for a transaction completion in order to retrieve its logs and events,
// it's possible that these pieces of information are missing at the very moment the transaction is marked as completed - 
// they may not be immediately available. 

// If that is an issue, you can configure the `class:TransactionWatcher` to have additional **patience**
// before returning the transaction object. Below, we're adding a patience of 8 seconds:

// ```js
const watcherWithPatience = new TransactionWatcher(apiNetworkProvider, { patienceMilliseconds: 8000 });
// ```

// Alternatively, use `func:TransactionWatcher.awaitAnyEvent()` or `func:TransactionWatcher.awaitOnCondition()` to customize the waiting strategy.

// For a different awaiting strategy, also see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).
