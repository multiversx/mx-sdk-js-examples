const { Mnemonic, UserSigner, UserVerifier } = require("@elrondnetwork/erdjs-walletcore");
const { Address, GasEstimator, SignableMessage, Transaction, TokenPayment, TransactionPayload } = require("@multiversx/sdk-core");
const axios = require("axios");

// https://github.com/multiversx/mx-sdk-testwallets/blob/main/users/mnemonic.txt
const DummyMnemonic = "moral volcano peasant pass circle pen over picture flat shop clap goat never lyrics gather prepare woman film husband gravity behind test tiger improve";
const APIUrl = "https://devnet-api.multiversx.com";

module.exports.exampleDeriveAccountsFromMnemonic = function () {
    const mnemonic = Mnemonic.fromString(DummyMnemonic);

    // https://github.com/multiversx/mx-sdk-erdjs-walletcore/blob/main/src/users.spec.ts
    const addressIndexOfAlice = 0;
    const userSecretKeyOfAlice = mnemonic.deriveKey(addressIndexOfAlice);
    const userPublicKeyOfAlice = userSecretKeyOfAlice.generatePublicKey();
    const addressOfAlice = userPublicKeyOfAlice.toAddress();
    const addressOfAliceAsBech32 = addressOfAlice.bech32();

    const addressIndexOfBob = 1;
    const userSecretKeyOfBob = mnemonic.deriveKey(addressIndexOfBob);
    const userPublicKeyOfBob = userSecretKeyOfBob.generatePublicKey();
    const addressOfBob = userPublicKeyOfBob.toAddress();
    const addressOfBobAsBech32 = addressOfBob.bech32();

    console.log("Alice", addressOfAliceAsBech32);
    console.log("Bob", addressOfBobAsBech32);
}

module.exports.exampleSignAndBroadcastTransaction = async function () {
    const mnemonic = Mnemonic.fromString(DummyMnemonic);

    const userSecretKey = mnemonic.deriveKey(0);
    const userPublicKey = userSecretKey.generatePublicKey();
    const address = userPublicKey.toAddress();
    const signer = new UserSigner(userSecretKey);

    // https://docs.multiversx.com/integrators/creating-transactions/#nonce-management
    const nonce = await recallAccountNonce(address);

    // https://docs.multiversx.com/sdk-and-tools/erdjs/erdjs-cookbook/#preparing-a-simple-transaction
    const data = "for the lunch"
    const gasLimit = new GasEstimator().forEGLDTransfer(data.length);
    const transaction = new Transaction({
        nonce: nonce,
        // 0.123456789000000000 EGLD
        value: TokenPayment.egldFromBigInteger("123456789000000000"),
        sender: address,
        receiver: new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
        data: new TransactionPayload(data),
        gasPrice: 1000000000,
        gasLimit: gasLimit,
        chainID: "D"
    });

    await signer.sign(transaction);
    console.log("Transaction signature", transaction.getSignature().hex());
    console.log("Transaction hash", transaction.getHash().hex());

    console.log("Data to broadcast:");
    console.log(transaction.toSendable());

    await broadcastTransaction(transaction);
}

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
    const address = userPublicKey.toAddress().bech32();
    const signer = new UserSigner(userSecretKey);

    const dataExample = `${address}hello{}`;
    const message = new SignableMessage({
        message: Buffer.from(dataExample)
    });

    await signer.sign(message);
    const signature = message.getSignature().hex();
    console.log("Message signature", signature);

    // In order to validate a message signature, follow:
    // https://docs.multiversx.com/sdk-and-tools/erdjs/erdjs-signing-providers/#verifying-the-signature-of-a-login-token
}

module.exports.exampleVerifyMessage = async function () {
    const addressBech32 = "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th";
    const dataExample = `${addressBech32}hello{}`;
    const message = new SignableMessage({
        message: Buffer.from(dataExample),
        signature: { hex: () => "5a7de64fb45bb11fc540839bff9de5276e1b17de542e7750b002e4663aea327b9834d4ac46b2c9531653113b7eb3eb000aef89943bd03fd96353fbcf03512809" }
    });

    const verifier = UserVerifier.fromAddress(Address.fromBech32(addressBech32));

    console.log("verify() with good signature:", verifier.verify(message));

    message.message = Buffer.from("bye");
    console.log("verify() with bad signature (message altered):", verifier.verify(message));
}

module.exports.exampleVerifyTransactionSignature = async function () {
    const addressBech32 = "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th";
    const transaction = Transaction.fromPlainObject({
        nonce: 42,
        value: "12345",
        sender: addressBech32,
        receiver: "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
        gasPrice: 1000000000,
        gasLimit: 50000,
        chainID: "D",
        version: 1,
        signature: "3c5eb2d1c9b3ab2f578541e62dcfa5008976d11f85644a48884a8a6c4d2980fa14954ab2924d6e67c051562488096d2e79cd3c0378edf234a52e648e672d1b0a"
    });

    const verifier = UserVerifier.fromAddress(Address.fromBech32(addressBech32));

    console.log("verify() with good signature:", verifier.verify(transaction));

    transaction.setNonce(7);
    console.log("verify() with bad signature (message altered):", verifier.verify(transaction));
}
