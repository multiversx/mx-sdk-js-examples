
// ## Signing objects

// Signing is done using an account’s secret key. To simplify this process, we provide wrappers like [Account](TODO), which streamline signing operations. 
// First, we'll explore how to sign using an Account, followed by signing directly with a secret key.

// ## Signing a Transaction using an Account
// We are going to assume we have an account at this point. If you don't fell free to check out the [creating an account section](TODO).

// ```js
import { Account, Address, Transaction } from "@multiversx/sdk-core";
import path from 'path';
{
    // create the issuer ot the token // md-as-comment
    const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
    const alice = await Account.newFromPem(filePath);

    const transaction = new Transaction({
        chainID: "D",
        sender: alice.address,
        receiver: Address.newFromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
        gasLimit: 50000n,
        nonce: 90n
    });

    transaction.signature = alice.signTransaction(transaction);
    console.log(transaction.toPlainObject());
}
// ```

// Signing a Transaction using a SecretKey

// ```js
import { TransactionComputer, UserSecretKey } from "@multiversx/sdk-core";
{
    const secretKeyHex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
    const secretKey = UserSecretKey.fromString(secretKeyHex);
    const publickKey = secretKey.generatePublicKey()

    const transaction = new Transaction({
        nonce: 90n,
        sender: publickKey.toAddress(),
        receiver: Address.newFromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
        value: 1000000000000000000n,
        gasLimit: 50000n,
        chainID: "D"
    });

    // serialize the transaction // md-as-comment
    const transactionComputer = new TransactionComputer()
    const serializedTransaction = transactionComputer.computeBytesForSigning(transaction);

    // apply the signature on the transaction // md-as-comment
    transaction.signature = await secretKey.sign(serializedTransaction);

    console.log(transaction.toPlainObject());
}
// ```

// Signing a Transaction by hash

// ```js
{
    // create the issuer ot the token // md-as-comment
    const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
    const alice = await Account.newFromPem(filePath);

    const transaction = new Transaction({
        nonce: 90n,
        sender: publickKey.toAddress(),
        receiver: Address.newFromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
        value: 1000000000000000000n,
        gasLimit: 50000n,
        chainID: "D"
    });

    const transactionComputer = new TransactionComputer();

    // sets the least significant bit of the options field to `1` // md-as-comment
    transactionComputer.applyOptionsForHashSigning(transaction);

    // compute a keccak256 hash for signing // md-as-comment
    const hash = transactionComputer.computeHashForSigning(transaction)

    // sign and apply the signature on the transaction // md-as-comment
    transaction.signature = await alice.sign(hash);

    console.log(transaction.toPlainObject());
}
// ```

// Signing a Message using an Account:

// ```js
import { Message } from "@multiversx/sdk-core";
{
    const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
    const alice = await Account.newFromPem(filePath);

    const message = new Message({
        data: new Uint8Array(Buffer.from("hello")),
        address: alice.address
    });

    message.signature = await alice.sign(message);
}
// ```

// Signing a Message using an SecretKey:

// ```js
import { MessageComputer } from "@multiversx/sdk-core";
{
    const secretKeyHex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
    const secretKey = UserSecretKey.fromString(secretKeyHex);
    const publickKey = secretKey.generatePublicKey();

    const messageComputer = new MessageComputer();
    const message = new Message({
        data: new Uint8Array(Buffer.from("hello")),
        address: publickKey.toAddress()
    });
    // serialized the message
    const serialized = messageComputer.computeBytesForSigning(message);

    message.signature = await secretKey.sign(serialized);
}
// ```
