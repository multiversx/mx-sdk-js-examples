import { Address, SignableMessage, Transaction, TransactionPayload } from "@multiversx/sdk-core";
import { WalletProvider } from "@multiversx/sdk-web-wallet-provider";
import qs from "qs";
import { createNativeAuthInitialPart, packNativeAuthToken, verifyNativeAuthToken } from "./auth";
import { CHAIN_ID, XALIAS_URL } from "./config";

export class XAlias {
    constructor() {
        this.provider = new WalletProvider(XALIAS_URL);
    }

    async login() {
        const callbackUrl = getCurrentLocation();
        await this.provider.login({ callbackUrl: callbackUrl });
    }

    async loginWithToken() {
        const nativeAuthInitialPart = await createNativeAuthInitialPart();
        // This is just an example of how to store the "nativeAuthInitialPart" in-between page changes & redirects (in "localStorage"). 
        // In real-life, use the approach that best suits your application.
        await localStorage.setItem("x-alias-example:nativeAuthInitialPart", nativeAuthInitialPart);
        const callbackUrl = getCurrentLocation();
        await this.provider.login({ callbackUrl: callbackUrl, token: nativeAuthInitialPart });
    }

    async logout() {
        const callbackUrl = getCurrentLocation();
        await this.provider.logout({ callbackUrl: callbackUrl, redirectDelayMilliseconds: 10 });
    }

    async showAddress() {
        alert(getUrlParams().address || "Try to login first.");
    }

    async showTokenSignature() {
        alert(getUrlParams().signature || "Try to login (with token) first.");
    }

    async validateTokenSignature() {
        const address = getUrlParams().address;
        const nativeAuthInitialPart = await localStorage.getItem("x-alias-example:nativeAuthInitialPart");
        const signature = getUrlParams().signature;
        const nativeAuthToken = packNativeAuthToken(address, nativeAuthInitialPart, signature);

        verifyNativeAuthToken(nativeAuthToken);
    }

    async signTransaction() {
        const sender = getUrlParams().address;
        if (!sender) {
            alert("Try to login first.");
            return;
        }

        const transaction = new Transaction({
            nonce: 42,
            value: "1000000000000000000",
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: new TransactionPayload(),
            chainID: CHAIN_ID
        });

        await this.provider.signTransaction(transaction);
    }

    async signTransactions() {
        const sender = getUrlParams().address;
        if (!sender) {
            alert("Try to login first.");
            return;
        }

        const firstTransaction = new Transaction({
            nonce: 42,
            value: "1000000000000000000",
            gasLimit: 70000,
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: new TransactionPayload("hello"),
            chainID: CHAIN_ID
        });

        const secondTransaction = new Transaction({
            nonce: 43,
            value: "3000000000000000000",
            gasLimit: 70000,
            sender: new Address(sender),
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: new TransactionPayload("world"),
            chainID: CHAIN_ID
        });

        await this.provider.signTransactions([firstTransaction, secondTransaction]);
    }

    async showSignedTransactions() {
        const plainSignedTransactions = this.provider.getTransactionsFromWalletUrl();
        alert(JSON.stringify(plainSignedTransactions, null, 4));

        // Now let's convert them back to sdk-js' Transaction objects.
        // Note that the Web Wallet provider returns the data field as a plain string. 
        // However, sdk-js' Transaction.fromPlainObject expects it to be base64-encoded.
        // Therefore, we need to apply a workaround (an additional conversion).
        for (const plainTransaction of plainSignedTransactions) {
            const plainTransactionClone = structuredClone(plainTransaction);
            plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
            const transaction = Transaction.fromPlainObject(plainTransactionClone);

            console.log(transaction.toSendable());
        }
    }

    async signMessage() {
        const message = new SignableMessage({ message: "hello" });
        const callbackUrl = getCurrentLocation();
        await this.provider.signMessage(message, { callbackUrl });
    }

    async showMessageSignature() {
        const signature = this.provider.getMessageSignatureFromWalletUrl();
        alert(`Signature: ${signature}`);
    }
}

function getUrlParams() {
    const queryString = window.location.search.slice(1);
    const params = qs.parse(queryString);
    return params;
}

function getCurrentLocation() {
    return window.location.href.split("?")[0];
}
