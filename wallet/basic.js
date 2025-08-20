const { Account, Address, Message, Transaction, MessageComputer, Mnemonic, UserSigner, UserVerifier, UserSecretKey, TransactionComputer } = require("@multiversx/sdk-core");
const axios = require("axios");

// https://github.com/multiversx/mx-sdk-testwallets/blob/main/users/mnemonic.txt
const DummyMnemonic = "moral volcano peasant pass circle pen over picture flat shop clap goat never lyrics gather prepare woman film husband gravity behind test tiger improve";
const APIUrl = "https://devnet-api.multiversx.com";

module.exports.exampleDeriveAccountsFromMnemonic = function () {
    const mnemonic = Mnemonic.fromString(DummyMnemonic);

    // https://github.com/multiversx/mx-sdk-js-wallet/blob/main/src/users.spec.ts
    const addressIndexOfAlice = 0;
    const userSecretKeyOfAlice = mnemonic.deriveKey(addressIndexOfAlice);
    const userPublicKeyOfAlice = userSecretKeyOfAlice.generatePublicKey();
    const addressOfAlice = userPublicKeyOfAlice.toAddress();
    const addressOfAliceAsBech32 = addressOfAlice.toBech32();

    const addressIndexOfBob = 1;
    const userSecretKeyOfBob = mnemonic.deriveKey(addressIndexOfBob);
    const userPublicKeyOfBob = userSecretKeyOfBob.generatePublicKey();
    const addressOfBob = userPublicKeyOfBob.toAddress();
    const addressOfBobAsBech32 = addressOfBob.toBech32();

    console.log("Alice", addressOfAliceAsBech32);
    console.log("Bob", addressOfBobAsBech32);
};

module.exports.exampleSignAndBroadcastTransaction = async function () {
    const mnemonic = Mnemonic.fromString(DummyMnemonic);

    const userSecretKey = mnemonic.deriveKey(0);
    const userPublicKey = userSecretKey.generatePublicKey();
    const address = userPublicKey.toAddress();
    const signer = new UserSigner(userSecretKey);

    // https://docs.multiversx.com/integrators/creating-transactions/#nonce-management
    const nonce = await recallAccountNonce(address);

    // https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook/#preparing-a-simple-transaction
    const data = "for the lunch";
    const transaction = new Transaction({
        nonce: nonce,
        // 0.123456789000000000 EGLD
        value: 123456789000000000n,
        sender: address,
        receiver: new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
        data: Buffer.from(data),
        gasPrice: 1000000000,
        gasLimit: 500000n,
        chainID: "D"
    });


    const transactionComputer = new TransactionComputer();
    const serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
    const signature = await signer.sign(serializedTransaction);
    transaction.signature = signature;

    console.log("Transaction signature", transaction.signature.toString());
    console.log("Transaction hash", transaction.txHash);

    console.log("Data to broadcast:");
    console.log(transaction);

    await broadcastTransaction(transaction);
};

async function recallAccountNonce(address) {
    const url = `${APIUrl}/accounts/${address.toString()}`;
    const response = await axios.get(url);
    return response.data.nonce;
}

async function broadcastTransaction(transaction) {
    const url = `${APIUrl}/transactions`;
    const data = transaction.toSendable();

    const response = await axios.post(url, data, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    console.log(response.data);
}

module.exports.exampleSignMessage = async function () {
    const mnemonic = Mnemonic.fromString(DummyMnemonic);
    const userSecretKey = mnemonic.deriveKey(0);
    const userPublicKey = userSecretKey.generatePublicKey();
    const address = userPublicKey.toAddress().toBech32();
    const signer = new UserSigner(userSecretKey);

    const dataExample = `${address}hello{}`;
    const message = new Message({
        data: Buffer.from(dataExample),
        address: address
    });

    const messageComputer = new MessageComputer();
    const serializedMessage = messageComputer.computeBytesForSigning(message);
    const signature = await signer.sign(serializedMessage);
    message.signature = signature;

    console.log("Message signature", message.signature);

    // In order to validate a message signature, follow:
    // https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers/#verifying-the-signature-of-a-login-token
};

module.exports.exampleVerifyMessage = async function () {
    let signer = new Account(
        UserSecretKey.fromString("1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf"),
    );
    let verifier = new UserVerifier(
        UserSecretKey.fromString(
            "1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf",
        ).generatePublicKey(),
    );
    const messageComputer = new MessageComputer();
    const dataExample = `hello`;
    const message = new Message({
        data: Buffer.from(dataExample),
        address: signer.address,
    });
    message.signature = await signer.signMessage(message);

    const serializedMessage = messageComputer.computeBytesForSigning(message);
    const signature = message.signature;

    console.log("verify() with good signature:", await verifier.verify(serializedMessage, signature));

    message.data = Buffer.from("bye");
    const serializedMessageAltered = messageComputer.computeBytesForSigning(message);
    console.log("verify() with bad signature (message altered):", await verifier.verify(serializedMessageAltered, signature));
};

module.exports.exampleVerifyTransactionSignature = async function () {
    let signer = new Account(
        UserSecretKey.fromString("1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf"),
    );
    let verifier = new UserVerifier(
        UserSecretKey.fromString(
            "1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf",
        ).generatePublicKey(),
    );
    const transactionComputer = new TransactionComputer();
    const transaction = new Transaction({
        nonce: 8n,
        value: 10000000000000000000n,
        sender: Address.newFromBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"),
        receiver: Address.newFromBech32("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"),
        gasPrice: 1000000000n,
        gasLimit: 50000n,
        chainID: "1",
    });

    const serialized = transactionComputer.computeBytesForSigning(transaction);
    const signature = await signer.sign(serialized);
    console.log("verify() with good signature:", await verifier.verify(serialized, signature));

    transaction.nonce = 7n;
    const serializedAlteredTransaction = transactionComputer.computeBytesForSigning(transaction);
    console.log("verify() with bad signature (message altered):", await verifier.verify(serializedAlteredTransaction, signature));
};
