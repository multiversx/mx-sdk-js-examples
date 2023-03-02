import { Address, Transaction, TransactionPayload } from "@multiversx/sdk-core";
import { WalletConnectProvider } from "@multiversx/sdk-wallet-connect-provider";

const bridgeUrl = "https://bridge.walletconnect.org";

export class WalletConnect {
    constructor() {
        this.provider = new WalletConnectProvider(bridgeUrl, this.prepareCallbacks());
    }

    prepareCallbacks() {
        const self = this;

        return {
            onClientLogin: async function () {
                closeModal();
                const address = await self.provider.getAddress();
                alert(`onClientLogin(), address: ${address}`);
            },
            onClientLogout: async function () {
                alert("onClientLogout()");
            }
        };
    }

    async login() {
        await this.provider.init();
        const connectorUri = await this.provider.login();
        await openModal(connectorUri);
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
            nonce: 43,
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
            nonce: 44,
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

        alert(JSON.stringify([firstTransaction.toSendable(), secondTransaction.toSendable()], null, 4));
    }

    async signMessage() {
        console.error("Not yet supported by the provider.");
    }
}

async function openModal(connectorUri) {
    const svg = await QRCode.toString(connectorUri, { type: "svg" });

    $("#MyWalletConnectQRContainer").html(svg);
    $("#MyWalletConnectModal").modal("show");
}

function closeModal() {
    $("#MyWalletConnectModal").modal("hide");
}
