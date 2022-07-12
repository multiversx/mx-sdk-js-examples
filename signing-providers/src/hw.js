import { HWProvider } from "@elrondnetwork/erdjs-hw-provider";
import { Address, SignableMessage, Transaction, TransactionPayload } from "@elrondnetwork/erdjs";
import { acquireThirdPartyAuthToken } from "./backendFacade";

export class HW {
    constructor() {
        this.provider = new HWProvider();
    }

    async login() {
        await this.provider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        await this.provider.login({ addressIndex: addressIndex });

        alert(`Logged in. Address: ${await this.provider.getAddress()}`);
    }

    async loginWithToken() {
        await this.provider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        const authToken = acquireThirdPartyAuthToken();
        const { address, signature } = await this.provider.tokenLogin({ addressIndex: addressIndex, token: Buffer.from(authToken) });

        alert(`Logged in.\nAddress: ${address}\nSignature: ${signature.hex()}`);
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

        alert(`Address has been set: ${await this.provider.getAddress()}.`);
    }

    async signTransaction() {
        await this.provider.init();

        const transaction = new Transaction({
            nonce: 42,
            value: "1",
            gasLimit: 70000,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: new TransactionPayload("hello"),
            chainID: "T"
        });

        await this.provider.signTransaction(transaction);

        alert(JSON.stringify(transaction.toSendable(), null, 4));
    }

    async signTransactions() {
        await this.provider.init();

        const firstTransaction = new Transaction({
            nonce: 42,
            value: "1",
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
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: new TransactionPayload("hello world"),
            chainID: "T",
            version: 1
        });

        const transactions = [firstTransaction, secondTransaction];
        await this.provider.signTransactions(transactions);

        alert(JSON.stringify([firstTransaction.toSendable(), secondTransaction.toSendable()], null, 4));
    }

    async signMessage() {
        await this.provider.init();

        const message = new SignableMessage({
            message: Buffer.from("hello")
        });

        await this.provider.signMessage(message);
        alert(JSON.stringify(message, null, 4));
    }
}
