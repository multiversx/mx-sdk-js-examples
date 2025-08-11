import {
    Address,
    ApiNetworkProvider,
    Message,
    ProxyNetworkProvider,
    Transaction,
    TransactionOptions,
} from "@multiversx/sdk-core";
import { HWProvider } from "@multiversx/sdk-hw-provider";
import { CrossWindowProvider } from "@multiversx/sdk-web-wallet-cross-window-provider";
import { WalletProvider } from "@multiversx/sdk-web-wallet-provider";
import { createNativeAuthInitialPart, packNativeAuthToken, verifyNativeAuthToken } from "./auth";
import { API_URL, WALLET_PROVIDER_URL, CHAIN_ID, PROXY_URL } from "./config";
import { displayOutcome } from "./helpers";

export class HW {
    constructor() {
        this.hwProvider = new HWProvider();
        this.walletProvider = new WalletProvider(WALLET_PROVIDER_URL);
        this.apiNetworkProvider = new ApiNetworkProvider(API_URL, {
            clientName: "multiversx-sdk-js-examples",
        });

        this.proxyNetworkProvider = new ProxyNetworkProvider(PROXY_URL, {
            clientName: "multiversx-sdk-js-examples",
        });
    }

    async login() {
        await this.hwProvider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        await this.hwProvider.login({ addressIndex: addressIndex });

        const address = await this.hwProvider.getAddress();

        displayOutcome("Logged in. Address:", address);
    }

    async loginWithToken() {
        await this.hwProvider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        const nativeAuthInitialPart = await createNativeAuthInitialPart();

        const { address, signature } = await this.hwProvider.tokenLogin({
            addressIndex: addressIndex,
            token: Buffer.from(nativeAuthInitialPart),
        });

        const nativeAuthToken = packNativeAuthToken(address, nativeAuthInitialPart, signature.toString("hex"));
        verifyNativeAuthToken(nativeAuthToken);
    }

    async displayAddresses() {
        await this.hwProvider.init();

        const addresses = await this.hwProvider.getAccounts();
        alert(addresses.join(",\n"));
    }

    async setAddressIndex() {
        await this.hwProvider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForSetAddress").value);
        console.log("Set addressIndex", addressIndex);

        await this.hwProvider.setAddressIndex(addressIndex);

        displayOutcome(`Address has been set: ${await this.hwProvider.getAddress()}.`);
    }

    async signTransaction() {
        await this.hwProvider.init();

        const senderBech32 = await this.hwProvider.getAddress();
        const sender = new Address(senderBech32);
        const guardian = await this.getGuardian(sender);

        const transactionOptions = guardian ? TransactionOptions.withOptions({ guarded: true }) : undefined;

        const transaction = new Transaction({
            nonce: 42,
            value: "1",
            gasLimit: 70000,
            sender: sender,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: Buffer.from("hello"),
            chainID: CHAIN_ID,
            guardian: guardian,
            options: transactionOptions,
        });

        const signedTransaction = await this.hwProvider.signTransaction(transaction);

        if (guardian) {
            const guardedTransactions = await this.guardTransactions([signedTransaction]);
            displayOutcome(
                "Transaction signed & guarded.",
                JSON.stringify(guardedTransactions.map((tx) => tx.toSendable())),
            );
        } else {
            displayOutcome("Transaction signed.", signedTransaction.toSendable());
        }
    }

    async signTransactions() {
        await this.hwProvider.init();

        const senderBech32 = await this.hwProvider.getAddress();
        const sender = new Address(senderBech32);
        const guardian = await this.getGuardian(sender);
        const transactionOptions = guardian ? TransactionOptions.withOptions({ guarded: true }) : undefined;

        const firstTransaction = new Transaction({
            nonce: 42,
            value: "1",
            sender: sender,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: Buffer.from("hello"),
            chainID: CHAIN_ID,
            guardian: guardian,
            options: transactionOptions,
        });

        const secondTransaction = new Transaction({
            nonce: 43,
            value: "100000000",
            sender: sender,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: Buffer.from("hello world"),
            chainID: CHAIN_ID,
            guardian: guardian,
            options: transactionOptions,
        });

        const transactions = [firstTransaction, secondTransaction];
        const signedTransactions = await this.hwProvider.signTransactions(transactions);

        if (guardian) {
            const guardedTransactions = await this.guardTransactions(signedTransactions);
            displayOutcome(
                "Transactions signed & guarded.",
                JSON.stringify(guardedTransactions.map((tx) => tx.toSendable())),
            );
        } else {
            displayOutcome(
                "Transactions signed.",
                signedTransactions.map((transaction) => transaction.toSendable()),
            );
        }
    }

    async getGuardian(sender) {
        const guardianData = await this.proxyNetworkProvider.getGuardianData(sender);
        return guardianData.getCurrentGuardianAddress();
    }

    async showSignedTransactionsWhenGuarded() {
        const plainSignedTransactions = this.walletProvider.getTransactionsFromWalletUrl();
        const signedTransactions = [];

        // Now let's convert them back to sdk-js' Transaction objects.
        // Note that the Web Wallet provider returns the data field as a plain string.
        // However, sdk-js' Transaction.newFromPlainObject expects it to be base64-encoded.
        // Therefore, we need to apply a workaround (an additional conversion).
        for (const plainTransaction of plainSignedTransactions) {
            const plainTransactionClone = structuredClone(plainTransaction);
            plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
            const transaction = Transaction.newFromPlainObject(plainTransactionClone);
            signedTransactions.push(transaction);
        }

        displayOutcome(
            "Transactions signed.",
            signedTransactions.map((transaction) => transaction.toSendable()),
        );
    }

    async signMessage() {
        await this.hwProvider.init();
        const address = await this.hwProvider.getAddress();

        const message = new Message({
            address: new Address(address),
            data: Buffer.from("hello"),
        });

        const signedMessage = await this.hwProvider.signMessage(message);

        displayOutcome("Message signed. Signature: ", Buffer.from(signedMessage?.signature).toString("hex"));
    }

    async guardTransactions(transactions) {
        // instantiate wallet cross-window provider
        await CrossWindowProvider.getInstance().init();
        const crossWindowProvider = CrossWindowProvider.getInstance();
        crossWindowProvider.setWalletUrl(WALLET_PROVIDER_URL);

        // set sender
        const senderBech32 = await this.hwProvider.getAddress();
        const sender = new Address(senderBech32);
        crossWindowProvider.setAddress(sender);

        // the user signs transactions on ledger so we need to perform an extra
        // user action so the popup is opened
        crossWindowProvider.setShouldShowConsentPopup(true);

        const guardedTransactions = await crossWindowProvider.guardTransactions(transactions);

        return guardedTransactions;
    }
}
