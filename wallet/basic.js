const { Mnemonic, UserSigner } = require("@elrondnetwork/erdjs-walletcore");
const { Address, GasEstimator, SignableMessage, Transaction, TokenPayment, TransactionPayload } = require("@elrondnetwork/erdjs");
const axios = require("axios");

// https://github.com/ElrondNetwork/elrond-sdk-testwallets/blob/main/users/mnemonic.txt
const DummyMnemonic = "moral volcano peasant pass circle pen over picture flat shop clap goat never lyrics gather prepare woman film husband gravity behind test tiger improve";
const APIUrl = "https://devnet-api.elrond.com";

module.exports.exampleDeriveAccountsFromMnemonic = function () {
    const mnemonic = Mnemonic.fromString(DummyMnemonic);

    // https://github.com/ElrondNetwork/elrond-sdk-erdjs-walletcore/blob/main/src/users.spec.ts
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

    // https://docs.elrond.com/sdk-and-tools/erdjs/erdjs-cookbook/#preparing-a-simple-transaction
    const data = "for the lunch"
    const gasLimit = new GasEstimator().forEGLDTransfer(data.length);
    const transaction = new Transaction({
        nonce: 10500,
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
    // https://docs.elrond.com/sdk-and-tools/erdjs/erdjs-signing-providers/#verifying-the-signature-of-a-login-token
}

