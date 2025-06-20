import { IframeProvider } from "@multiversx/sdk-web-wallet-iframe-provider/out";
import { IframeLoginTypes } from "@multiversx/sdk-web-wallet-iframe-provider/out/constants";
import { CHAIN_ID } from "./config";
import { displayOutcome } from "./helpers";
import { Address, Message, Transaction } from "@multiversx/sdk-core";

// IMPORTANT: The iframe wallet must be served over HTTPS on different domain
// example: http-server -c-1 -S -C ./dummy-certificate.pem -K ./dummy-certificate-key.pem --port=3000
const IFRAME_WALLET_URL = `https://192.168.50.183:3000/iframe-wallet.html`;

export class IframeCommunication {
    constructor() {
        this.provider = IframeProvider.getInstance();
        this.address = "";
    }

    async init() {
        // TODO: change to iframe login type
        this.provider.setLoginType(IframeLoginTypes.metamask);
        this.provider.setWalletUrl(IFRAME_WALLET_URL);
        const isInitialized = await this.provider.init();
        return isInitialized;
    }

    async login() {
        await this.init();
        const account = await this.provider.login();
        this.address = account.address;
        alert(`Address: ${account.address}`);
    }

    async logout() {
        await this.provider.logout();
        this.address = "";
    }

    async signTransactions() {
        const sender = this.address;
        const firstTransaction = new Transaction({
            nonce: 42,
            value: "1",
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: Buffer.from(""),
            chainID: CHAIN_ID,
            version: 1,
        });

        const secondTransaction = new Transaction({
            nonce: 43,
            value: "100000000",
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: Buffer.from("hello world"),
            chainID: CHAIN_ID,
            version: 1,
        });

        await this.provider.signTransactions([firstTransaction, secondTransaction]);
        console.log("First transaction, upon signing:", firstTransaction);
        console.log("Second transaction, upon signing:", secondTransaction);

        alert(JSON.stringify([firstTransaction.toSendable(), secondTransaction.toSendable()], null, 4));
    }

    async signMessage() {
        const message = new Message({
            address: new Address(this.address),
            data: Buffer.from("hello"),
        });
        const signedMessage = await this.provider.signMessage(message);
        displayOutcome("Message signed. Signature: ", signedMessage);
    }
}
