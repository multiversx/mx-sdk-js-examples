import { Address, Message, Transaction } from "@multiversx/sdk-core";
import { CHAIN_ID } from "./config";
import { WebviewProvider } from "@multiversx/sdk-webview-provider/out/WebviewProvider";

import { displayOutcome } from "./helpers";

export const addressOfAlice = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");

export class Webview {
    constructor() {
        this._provider = WebviewProvider.getInstance({
            resetStateCallback: () => console.log("Reset state callback called"),
        });
    }

    async init() {
        return await this._provider.init();
    }

    async login() {
        const response = await this._provider.login();

        console.log("Login response:" + JSON.stringify(response));
        alert("Login response:" + JSON.stringify(response));

        return response;
    }

    async logout() {
        const response = await this._provider.logout();

        console.log("Logout response:" + JSON.stringify(response));
        alert("Logout response:" + JSON.stringify(response));

        return response;
    }

    async relogin() {
        const accessToken = await this._provider.relogin();

        alert("accessToken = " + JSON.stringify(accessToken));
        console.log("accessToken = " + JSON.stringify(accessToken));

        if (!accessToken) {
            console.error("Unable to re-login. Missing accessToken.");
            alert("Unable to re-login. Missing accessToken.");
            return null;
        }

        return accessToken;
    }

    async signTransaction() {
        const transaction = new Transaction({
            nonce: 42,
            value: "1",
            sender: addressOfAlice,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: Buffer.from("world"),
            chainID: CHAIN_ID,
            version: 1,
        });

        const response = await this._provider.signTransaction(transaction);

        console.log("Sign transaction response:" + JSON.stringify(response));
        alert("Sign transaction response:" + JSON.stringify(response));

        return response;
    }

    async signTransactions() {
        const transaction = new Transaction({
            nonce: 42,
            value: "1",
            sender: addressOfAlice,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: Buffer.from("world"),
            chainID: CHAIN_ID,
            version: 1,
        });

        const response = await this._provider.signTransactions([transaction]);

        if (!response) {
            this._provider.cancelAction();
            return null;
        }

        console.log("Sign transactions response:" + JSON.stringify(response));
        alert("Sign transactions response:" + JSON.stringify(response));

        return response;
    }

    async signMessage() {
        const message = new Message({
            address: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: Buffer.from("hello"),
        });

        const signedMessage = await this._provider.signMessage(message);

        displayOutcome("Message signed. Signature: ", Buffer.from(signedMessage?.signature).toString("hex"));
    }

    async cancelAction() {
        return await this._provider.cancelAction();
    }

    async isInitialized() {
        return this._provider.isInitialized();
    }

    async isConnected() {
        return this._provider.isConnected();
    }
}
