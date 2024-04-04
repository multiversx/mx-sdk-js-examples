import { addressOfAlice, addressOfBob } from "./framework.js"; // md-ignore

// ## Signing objects

// :::note
// For **dApps**, use the available **[signing providers](/sdk-and-tools/sdk-js/sdk-js-signing-providers)** instead.
// :::

// Creating a `UserSigner` from a JSON wallet:

// ```
import { UserSigner } from "@multiversx/sdk-wallet";
import { promises } from "fs";

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
let signer = UserSigner.fromWallet(walletObject, "password");
// ```

// Creating a `UserSigner` from a PEM file:

// ```
const pemText = await promises.readFile("../testwallets/alice.pem", { encoding: "utf8" });
signer = UserSigner.fromPem(pemText);
// ```

// Signing a transaction:

// ```
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

// ```
import { Message, MessageComputer } from "@multiversx/sdk-core";

let message = new Message({
    data: Buffer.from("hello")
});

const messageComputer = new MessageComputer();
let serializedMessage = messageComputer.computeBytesForSigning(message);
message.signature = await signer.sign(serializedMessage);

console.log("Signature", Buffer.from(message.signature).toString("hex"));
// ```

// ## Verifying signatures

// Creating a `UserVerifier`:

// ```
import { UserVerifier } from "@multiversx/sdk-wallet";

const aliceVerifier = UserVerifier.fromAddress(addressOfAlice);
const bobVerifier = UserVerifier.fromAddress(addressOfBob);
// ```

// Verifying a signature:

// ```
serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
serializedMessage = messageComputer.computeBytesForSigning(message);

console.log("Is signature of Alice?", aliceVerifier.verify(serializedTransaction, transaction.signature));
console.log("Is signature of Alice?", aliceVerifier.verify(serializedMessage, message.signature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedTransaction, transaction.signature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedMessage, message.signature));
// ```

// ### Handling messages over boundaries

// Generally speaking, signed `class:Message` objects are meant to be sent to a remote party (e.g. a service), which can then verify the signature.

// In order to prepare a message for transmission, you can use the `func:MessageComputer.packMessage()` utility method:

// ```
const packedMessage = messageComputer.packMessage(message);

console.log("Packed message", packedMessage);
// ```

// Then, on the receiving side, you can use `func:MessageComputer.unpackMessage()` to reconstruct the message, prior verification:

// ```
const unpackedMessage = messageComputer.unpackMessage(packedMessage);

console.log("Unpacked message", unpackedMessage);
console.log("Is signature of Alice?", aliceVerifier.verify(messageComputer.computeBytesForVerifying(message), message.signature));
// ```
