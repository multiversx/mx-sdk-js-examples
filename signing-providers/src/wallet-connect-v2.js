import QRCode from "qrcode";
import { WalletConnectProviderV2 } from "@elrondnetwork/erdjs-wallet-connect-provider";
import { Address, SignableMessage, Transaction, TransactionPayload } from "@elrondnetwork/erdjs";

const relayUrl = "wss://relay.walletconnect.com";
const projectId = "9b1a9564f91cb659ffe21b73d5c4e2d8";



export class WalletConnectV2 {
    constructor() {
        this.provider = new WalletConnectProviderV2(this.prepareCallbacks(), "T", relayUrl, projectId);
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
        const { uri, approval } = await this.provider.connect();        

        await openModal(uri);        
        await this.provider.login({ approval });
    }

    async logout() {
        await this.provider.init();
        await this.provider.logout();
    }

    async signTransaction() {
        const transaction = new Transaction({
            nonce: 42,
            value: "1",
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
        const firstTransaction = new Transaction({
            nonce: 43,
            value: "1",
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
      alert(JSON.stringify(message.toJSON(), null, 4));
    }
}

async function openModal(connectorUri) {
    const svg = await QRCode.toString(connectorUri, { type: "svg" });

    $("#MyWalletConnectV2QRContainer").html(svg);
    $("#MyWalletConnectV2Modal").modal("show");
}

function closeModal() {
    $("#MyWalletConnectV2Modal").modal("hide");
}
