import { addressOfAlice, addressOfBob } from "./framework.js"; // md-ignore

// ## Signing objects and verifying signatures

// :::note
// Skip this section if you're building a **dApp**. 
// This section is destined for developers of **wallet-like applications** or backend (server-side) components that are concerned with signing transactions and messages.
//
// For **dApps**, use the available **[signing providers](/sdk-and-tools/sdk-js/sdk-js-signing-providers)** instead.
// Note that we recommend using **[sdk-dapp](/sdk-and-tools/sdk-dapp)** instead of integrating the signing providers on your own.
// :::

// :::note
// You might also be interested into the language-agnostic overview on [signing transactions](/developers/signing-transactions).
// :::

// ### Signing objects

// Creating a `UserSigner` from a JSON wallet:

// ```js
import { UserSigner } from "@multiversx/sdk-wallet";
import { promises } from "fs";

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
let signer = UserSigner.fromWallet(walletObject, "password");
// ```

// Creating a `UserSigner` from a PEM file:

// ```js
const pemText = await promises.readFile("../testwallets/alice.pem", { encoding: "utf8" });
signer = UserSigner.fromPem(pemText);
// ```

// Signing a transaction, as we've seen [before](#signing-a-transaction):

// ```js
import { Transaction, TransactionComputer } from "@multiversx/sdk-core";

const transaction = new Transaction({
    nonce: 91,
    sender: "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver: "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    value: 1000000000000000000n,
    gasLimit: 50000n,
    chainID: "D"
});

const transactionComputer = new TransactionComputer()
let serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
transaction.signature = await signer.sign(serializedTransaction);

console.log("Signature", Buffer.from(transaction.signature).toString("hex"));
// ```

// Signing an arbitrary message:

// ```js
import { Message, MessageComputer } from "@multiversx/sdk-core";

let message = new Message({
    data: Buffer.from("hello")
});

const messageComputer = new MessageComputer();
let serializedMessage = messageComputer.computeBytesForSigning(message);
message.signature = await signer.sign(serializedMessage);

console.log("Signature", Buffer.from(message.signature).toString("hex"));
// ```

// ### Verifying signatures

// Creating a `UserVerifier`:

// ```js
import { UserVerifier } from "@multiversx/sdk-wallet";

const aliceVerifier = UserVerifier.fromAddress(addressOfAlice);
const bobVerifier = UserVerifier.fromAddress(addressOfBob);
// ```

// Verifying a signature:

// ```js
serializedTransaction = transactionComputer.computeBytesForVerifying(transaction);
serializedMessage = messageComputer.computeBytesForVerifying(message);

console.log("Is signature of Alice?", aliceVerifier.verify(serializedTransaction, transaction.signature));
console.log("Is signature of Alice?", aliceVerifier.verify(serializedMessage, message.signature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedTransaction, transaction.signature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedMessage, message.signature));
// ```

// ### Handling messages over boundaries

// Generally speaking, signed `class:Message` objects are meant to be sent to a remote party (e.g. a service), which can then verify the signature.

// In order to prepare a message for transmission, you can use the `func:MessageComputer.packMessage()` utility method:

// ```js
const packedMessage = messageComputer.packMessage(message);

console.log("Packed message", packedMessage);
// ```

// Then, on the receiving side, you can use `func:MessageComputer.unpackMessage()` to reconstruct the message, prior verification:

// ```js
const unpackedMessage = messageComputer.unpackMessage(packedMessage);
const serializedUnpackedMessage = messageComputer.computeBytesForVerifying(unpackedMessage);

console.log("Unpacked message", unpackedMessage);
console.log("Is signature of Alice?", aliceVerifier.verify(serializedUnpackedMessage, message.signature));
// ```

// ### Signing hashes of objects

// Under the hood, `func:MessageComputer.computeBytesForSigning()` does not compute a plain serialization of the message.
// Instead, it first decorates the message (with a special prefix, plus the message length), and computes a **`keccak256` hash** of this decorated variant.
// Ultimately, the signature is computed over the hash.

// However, for transactions, **by default**, the Network expects the signature to be computed over [the plain serialization](/developers/signing-transactions/#serialization-for-signing) of the transaction.
// The function `func:TransactionComputer.computeBytesForSigning()` adheres to this default policy.
//
// The behavior can be overridden by setting the _sign using hash_ flag of `transaction.options`:

// ```js
transactionComputer.applyOptionsForHashSigning(transaction);
// ```

// Then, the transaction should be serialzed and signed as follows:

// ```js
const bytesToSign = transactionComputer.computeHashForSigning(transaction);
transaction.signature = await signer.sign(bytesToSign);
// ```

// :::note
// If you'd like to learn more about hash signing, please refer to the overview on [signing transactions](/developers/signing-transactions).
// :::
