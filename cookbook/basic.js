import { addressOfAlice, addressOfBob, getNotYetSignedTxLegacy, getNotYetSignedTxNext, getReadyToBroadcastTxLegacy, getReadyToBroadcastTxNext } from "./samples.js"; // md-ignore

const notYetSignedTxLegacy = getNotYetSignedTxLegacy(); // md-ignore
const notYetSignedTxNext = getNotYetSignedTxNext(); // md-ignore
const readyToBroadcastTx = getReadyToBroadcastTxLegacy(); // md-ignore
const readyToBroadcastTxNext = getReadyToBroadcastTxNext(); // md-ignore

// ## Creating network providers

// Creating an API provider:

// ```
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

const apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com");
// ```

// Creating a Proxy provider:

// ```
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";

const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
// ```

// Use the classes from `@multiversx/sdk-network-providers` **only as a starting point**. 
// As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements 
// (whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

// On this topic, please see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).

// ## Fetching network parameters

// ```
const networkConfig = await apiNetworkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
// ```

// ## Working with accounts

// ### Synchronizing an account object

// The following snippet fetches (from the Network) the **nonce** and the **balance** of an account, and updates the local representation of the account.

// ```
import { Account } from "@multiversx/sdk-core";

const alice = new Account(addressOfAlice);
const aliceOnNetwork = await apiNetworkProvider.getAccount(addressOfAlice);
alice.update(aliceOnNetwork);

console.log("Nonce:", alice.nonce);
console.log("Balance:", alice.balance.toString());
// ```

// ### Managing the sender nonce locally

// When sending a bunch of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

// ```
alice.incrementNonce();
console.log("Nonce:", alice.nonce);
// ```

// md-insert:transactionLegacyVsNext

// If you are using `sdk-core v13` or later, use `tx.nonce = ` to apply the nonce to a transaction. 
// For `sdk-core v12` or earlier, use the legacy `tx.setNonce()` to apply the nonce to a transaction.

// ```
notYetSignedTxNext.nonce = alice.getNonceThenIncrement();
notYetSignedTxLegacy.setNonce(alice.getNonceThenIncrement());
// ```

// For further reference, please see [nonce management](https://docs.multiversx.com/integrators/creating-transactions/#nonce-management).

// ## Preparing `TokenTransfer` objects (legacy)

// :::note
// Since `sdk-core v13`, the `TokenTransfer` class is considered legacy.
//
// For the alternative, see [token transfers](#token-transfers).
//
// For formatting or parsing token amounts, see [formatting and parsing amounts](#formatting-and-parsing-amounts).
// :::

// A `TokenTransfer` object for **EGLD transfers** (value movements):

// ```
import { TokenTransfer } from "@multiversx/sdk-core";

let firstTransfer = TokenTransfer.egldFromAmount("1.5");
let secondTransfer = TokenTransfer.egldFromBigInteger("1500000000000000000");

console.log(firstTransfer.valueOf(), secondTransfer.valueOf());
console.log(firstTransfer.toPrettyString(), secondTransfer.toPrettyString());
// ```

// A `TokenTransfer` object for transferring **fungible** tokens:

// ```
const identifier = "FOO-123456";
const numDecimals = 2;
firstTransfer = TokenTransfer.fungibleFromAmount(identifier, "1.5", numDecimals);
secondTransfer = TokenTransfer.fungibleFromBigInteger(identifier, "4000", numDecimals);

console.log(firstTransfer.toString()); // Will output: 150.
console.log(firstTransfer.toPrettyString()); // Will output: 1.50 FOO-123456.
console.log(secondTransfer.toString()); // Will output: 4000.
console.log(secondTransfer.toPrettyString()); // Will output: 40.00 FOO-123456.
// ```

// A `TokenTransfer` object for transferring **semi-fungible** tokens:

// ```
let nonce = 3;
let quantity = 50;
let transfer = TokenTransfer.semiFungible(identifier, nonce, quantity);
// ```

// A `TokenTransfer` object for transferring **non-fungible** tokens (the quantity doesn't need to be specified for NFTs, as the token is only one of its kind):

// ```
nonce = 7;
transfer = TokenTransfer.nonFungible(identifier, nonce);
// ```

// A `TokenTransfer` object for transferring **meta-esdt** tokens:

// ```
transfer = TokenTransfer.metaEsdtFromAmount(identifier, nonce, "0.1", numDecimals);
// ```

// ## Broadcasting transactions

// ### Preparing a simple transaction

// md-insert:transactionLegacyVsNext

// If you are using `sdk-core v13` or later, use `TransactionNext` class to prepare a transaction. 
// For `sdk-core v12` or earlier, use the legacy `Transaction` class to prepare a transaction.

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

txNext.nonce = alice.getNonceThenIncrement();

const txLegacy = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    value: TokenTransfer.egldFromAmount(1),
    chainID: "D"
});

txLegacy.setNonce(alice.getNonceThenIncrement());
// ```

// ### Broadcast using a network provider

// In order to broadcast a transaction, use a network provider:

// ```
try { // md-ignore
    const txHashNext = await apiNetworkProvider.sendTransaction(readyToBroadcastTxNext); // md-unindent
    console.log("TX hash:", txHashNext); // md-unindent

    const txHashLegacy = await apiNetworkProvider.sendTransaction(readyToBroadcastTxLegacy); // md-unindent
    console.log("TX hash:", txHashLegacy); // md-unindent
} catch { // md-ignore
} // md-ignore
// ```

// Note that the transactions **must be signed before being broadcasted**. Signing can be achieved using a signing provider.

// :::important
// Note that, for all purposes, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
// :::

// ### Wait for transaction completion

// ```
import { TransactionWatcher } from "@multiversx/sdk-core";

const watcher = new TransactionWatcher(apiNetworkProvider);
// const transactionOnNetwork = await watcher.awaitCompleted(tx);
// ```

// If only the `txHash` is available, then:

// ```
// const transactionOnNetwork = await watcher.awaitCompleted({ getHash: () => txHash });
// console.log(transactionOnNetwork);
// ```

// In order to wait for multiple transactions:

// ```
// await Promise.all([watcher.awaitCompleted(tx1), watcher.awaitCompleted(tx2), watcher.awaitCompleted(tx3)]);
// ```

// For a different awaiting strategy, also see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).
