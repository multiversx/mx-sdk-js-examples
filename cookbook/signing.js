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
import { Transaction } from "@multiversx/sdk-core";

const transaction = new Transaction({
    gasLimit: 50000,
    gasPrice: 1000000000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    chainID: "D",
    version: 1
});

const serializedTransaction = transaction.serializeForSigning();
const transactionSignature = await signer.sign(serializedTransaction);
transaction.applySignature(transactionSignature);

console.log("Transaction signature", transaction.getSignature().toString("hex"));
console.log("Transaction hash", transaction.getHash().toString());
// ```

// Signing an arbitrary message:

// ```
import { SignableMessage } from "@multiversx/sdk-core";

let message = new SignableMessage({
    message: Buffer.from("hello")
});

let serializedMessage = message.serializeForSigning();
let messageSignature = await signer.sign(serializedMessage);
message.applySignature(messageSignature);

console.log("Message signature", message.getSignature().toString("hex"));
// ```

// ## Verifying signatures

// Creating a `UserVerifier`:

// ```
import { UserVerifier } from "@multiversx/sdk-wallet";

const aliceVerifier = UserVerifier.fromAddress(addressOfAlice);
const bobVerifier = UserVerifier.fromAddress(addressOfBob);
// ```

// Suppose we have the following transaction:

// ```
const tx = Transaction.fromPlainObject({
    nonce: 42,
    value: "12345",
    sender: addressOfAlice.bech32(),
    receiver: addressOfBob.bech32(),
    gasPrice: 1000000000,
    gasLimit: 50000,
    chainID: "D",
    version: 1,
    signature:
        "3c5eb2d1c9b3ab2f578541e62dcfa5008976d11f85644a48884a8a6c4d2980fa14954ab2924d6e67c051562488096d2e79cd3c0378edf234a52e648e672d1b0a"
});

const serializedTx = tx.serializeForSigning();
const txSignature = tx.getSignature();
// ```

// And / or the following message and signature:

// ```
message = new SignableMessage({ message: Buffer.from("hello") });
serializedMessage = message.serializeForSigning();
messageSignature = Buffer.from(
    "561bc58f1dc6b10de208b2d2c22c9a474ea5e8cabb59c3d3ce06bbda21cc46454aa71a85d5a60442bd7784effa2e062fcb8fb421c521f898abf7f5ec165e5d0f",
    "hex"
);
// ```

// We can verify their signatures as follows:

// ```
console.log("Is signature of Alice?", aliceVerifier.verify(serializedTx, txSignature));
console.log("Is signature of Alice?", aliceVerifier.verify(serializedMessage, messageSignature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedTx, txSignature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedMessage, messageSignature));
// ```
