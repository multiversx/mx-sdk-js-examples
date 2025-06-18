import { IframeProvider } from "@multiversx/sdk-web-wallet-iframe-provider/out";
import { IframeLoginTypes } from "@multiversx/sdk-web-wallet-iframe-provider/out/constants";
import { displayOutcome } from "./helpers";
import { Address, Message } from "@multiversx/sdk-core";

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
        throw new Error("Not implemented");
    }

    async signTransaction() {
        throw new Error("Not implemented");
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
