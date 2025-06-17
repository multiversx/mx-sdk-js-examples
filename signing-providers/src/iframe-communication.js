import { IframeProvider } from "@multiversx/sdk-web-wallet-iframe-provider/out";
import { IframeLoginTypes } from "@multiversx/sdk-web-wallet-iframe-provider/out/constants";

// IMPORTANT: The iframe wallet must be served over HTTPS on different domain
const IFRAME_WALLET_URL = `https://192.168.50.183:3000/iframe-wallet.html`;

export class IframeCommunication {
    constructor() {
        this._provider = IframeProvider.getInstance();
    }

    async init() {
        this._provider.setLoginType(IframeLoginTypes.metamask);
        this._provider.setWalletUrl(IFRAME_WALLET_URL);
        const isInitialized = await this._provider.init();
        return isInitialized;
    }

    async login() {
        await this.init();
        const account = await this._provider.login();
        alert(`Address: ${account.address}`);
    }

    async logout() {
        throw new Error("Not implemented");
    }

    async signTransaction() {
        throw new Error("Not implemented");
    }

    async loginWithToken() {
        throw new Error("Not implemented");
    }

    async logout() {
        throw new Error("Not implemented");
    }

    async signMessage() {
        throw new Error("Not implemented");
    }
}
