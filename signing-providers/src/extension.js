import { Address, SignableMessage, Transaction, TransactionPayload } from "@multiversx/sdk-core";
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";
import { acquireThirdPartyAuthToken, verifyAuthTokenSignature } from "./backendFacade";

export class Extension {
    constructor() {
        this.provider = ExtensionProvider.getInstance();
    }

    async login() {
        await this.provider.init();
        const address = await this.provider.login();

        alert(`Address: ${address}`);
    }

    async loginWithToken() {
        await this.provider.init();

        const authToken = acquireThirdPartyAuthToken();
        await this.provider.login({ token: authToken });

        const address = this.provider.account.address;
        const signature = this.provider.account.signature;
        alert(`Address: ${address};\nsignature of token = ${signature}`);

        alert(verifyAuthTokenSignature(address, authToken, signature));
    }

    async logout() {
        await this.provider.init();
        await this.provider.logout();
    }

    async signTransaction() {
        await this.provider.init();

        const sender = await this.provider.getAddress();
        const transaction = new Transaction({
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

        await this.provider.signTransaction(transaction);

        alert(JSON.stringify(transaction.toSendable(), null, 4));
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

        await this.provider.signTransactions([firstTransaction, secondTransaction]);
        console.log("First transaction, upon signing:", firstTransaction);
        console.log("Second transaction, upon signing:", secondTransaction);

        alert(JSON.stringify([firstTransaction.toSendable(), secondTransaction.toSendable()], null, 4));
    }

    async signMessage() {
        await this.provider.init();

        const message = new SignableMessage({
            message: Buffer.from("hello")
        });

        await this.provider.signMessage(message);
        alert(JSON.stringify(message.toJSON(), null, 4));
    }
}

