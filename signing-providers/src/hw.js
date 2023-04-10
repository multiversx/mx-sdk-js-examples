import { Address, SignableMessage, Transaction, TransactionOptions, TransactionPayload, TransactionVersion } from "@multiversx/sdk-core";
import { HWProvider } from "@multiversx/sdk-hw-provider";
import { acquireThirdPartyAuthToken, verifyAuthTokenSignature } from "./backendFacade";

export class HW {
    constructor() {
        this.provider = new HWProvider();
    }

    async login() {
        await this.provider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        await this.provider.login({ addressIndex: addressIndex });

        const address = await this.provider.getAddress();

        this.displayOutcome("Logged in. Address:", address);
    }

    async loginWithToken() {
        await this.provider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        const authToken = acquireThirdPartyAuthToken();
        const payloadToSign = Buffer.from(`${authToken}{}`);
        const { address, signature } = await this.provider.tokenLogin({ addressIndex: addressIndex, token: payloadToSign });
        const verifyResult = verifyAuthTokenSignature(address, authToken, signature.hex());

        this.displayOutcome(`Logged in.\nAddress: ${address}\nSignature: ${signature.hex()}`);
        this.displayOutcome(`Verification result: ${verifyResult}`);
    }

    async displayAddresses() {
        await this.provider.init();

        const addresses = await this.provider.getAccounts();
        alert(addresses.join(",\n"));
    }

    async setAddressIndex() {
        await this.provider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForSetAddress").value);
        console.log("Set addressIndex", addressIndex);

        await this.provider.setAddressIndex(addressIndex);

        this.displayOutcome(`Address has been set: ${await this.provider.getAddress()}.`)
    }

    async signTransaction() {
        await this.provider.init();

        const sender = await this.provider.getAddress();
        const transaction = new Transaction({
            nonce: 42,
            value: "1",
            gasLimit: 70000,
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: new TransactionPayload("hello"),
            chainID: "T"
        });

        await this.provider.signTransaction(transaction);

        this.displayOutcome("Transaction signed.", transaction.toSendable());
    }

    async signTransactions() {
        await this.provider.init();

        const sender = await this.provider.getAddress();
        const firstTransaction = new Transaction({
            nonce: 42,
            value: "1",
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: new TransactionPayload(),
            chainID: "T",
            version: 1
        });

        const secondTransaction = new Transaction({
            nonce: 43,
            value: "100000000",
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: new TransactionPayload("hello world"),
            chainID: "T",
            version: 1
        });

        const transactions = [firstTransaction, secondTransaction];
        await this.provider.signTransactions(transactions);

        this.displayOutcome("Transactions signed.", transactions.map((transaction) => transaction.toSendable()));
    }

    async signGuardedTransaction() {
        try {
            await this.doSignGuardedTransaction();
        } catch (error) {
            this.displayError(error);
        }
    }

    async doSignGuardedTransaction() {
        await this.provider.init();

        const sender = await this.provider.getAddress();
        const transaction = new Transaction({
            nonce: 42,
            value: "1",
            gasLimit: 200000,
            sender: Address.fromBech32(sender),
            receiver: Address.fromBech32("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            guardian: Address.fromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
            data: new TransactionPayload("hello"),
            chainID: "T",
            version: TransactionVersion.withTxOptions(),
            options: TransactionOptions.withOptions({
                guarded: true
            })
        });

        await this.provider.signTransaction(transaction);

        this.displayOutcome("Transaction signed.", transaction.toSendable());
    }

    async signMessage() {
        await this.provider.init();

        const message = new SignableMessage({
            message: Buffer.from("hello")
        });

        await this.provider.signMessage(message);

        this.displayOutcome("Message signed.", message);
    }

    displayOutcome(message, outcome) {
        if (!outcome) {
            console.log(message);
            alert(message);
            return;
        }

        console.log(message, outcome);
        alert(`${message}\n${JSON.stringify(outcome, null, 4)}`);
    }

    displayError(error) {
        console.error(error);
        alert(`Error: ${error}`);
    }
}
