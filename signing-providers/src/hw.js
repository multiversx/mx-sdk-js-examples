import { Address, SignableMessage, Transaction, TransactionOptions, TransactionPayload } from "@multiversx/sdk-core";
import { HWProvider } from "@multiversx/sdk-hw-provider";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { WALLET_PROVIDER_TESTNET, WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { createNativeAuthInitialPart, packNativeAuthToken, verifyNativeAuthToken } from "./auth";

export class HW {
    constructor() {
        this.hwProvider = new HWProvider();
        this.walletProvider = new WalletProvider(WALLET_PROVIDER_TESTNET);
        this.apiNetworkProvider = new ApiNetworkProvider("https://testnet-api.multiversx.com");
    }

    async login() {
        await this.hwProvider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        await this.hwProvider.login({ addressIndex: addressIndex });

        const address = await this.hwProvider.getAddress();

        this.displayOutcome("Logged in. Address:", address);
    }

    async loginWithToken() {
        await this.hwProvider.init();

        const addressIndex = parseInt(document.getElementById("addressIndexForLogin").value);
        console.log("AddressIndex", addressIndex);

        const nativeAuthInitialPart = `${createNativeAuthInitialPart()}{}`

        const { address, signature } = await this.hwProvider.tokenLogin({ addressIndex: addressIndex, token: nativeAuthInitialPart });
        const nativeAuthToken = packNativeAuthToken(address, nativeAuthInitialPart, signature);
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

        this.displayOutcome(`Address has been set: ${await this.hwProvider.getAddress()}.`)
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
            data: new TransactionPayload("hello"),
            chainID: "T",
            guardian: guardian,
            options: transactionOptions
        });

        const signedTransaction = await this.hwProvider.signTransaction(transaction);

        if (guardian) {
            await this.walletProvider.guardTransactions([signedTransaction], { callbackUrl: getCurrentLocation() });
        } else {
            this.displayOutcome("Transaction signed.", signedTransaction.toSendable());
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
            data: new TransactionPayload(),
            chainID: "T",
            guardian: guardian,
            options: transactionOptions
        });

        const secondTransaction = new Transaction({
            nonce: 43,
            value: "100000000",
            sender: sender,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            gasPrice: 1000000000,
            gasLimit: 50000,
            data: new TransactionPayload("hello world"),
            chainID: "T",
            guardian: guardian,
            options: transactionOptions
        });

        const transactions = [firstTransaction, secondTransaction];
        const signedTransactions = await this.hwProvider.signTransactions(transactions);

        if (guardian) {
            await this.walletProvider.guardTransactions(signedTransactions, { callbackUrl: getCurrentLocation() });
        } else {
            this.displayOutcome("Transactions signed.", signedTransactions.map((transaction) => transaction.toSendable()));
        }
    }

    async getGuardian(sender) {
        const guardianData = await this.apiNetworkProvider.getGuardianData(sender);
        return guardianData.getCurrentGuardianAddress();
    }

    async showSignedTransactionsWhenGuarded() {
        const plainSignedTransactions = this.walletProvider.getTransactionsFromWalletUrl();
        const signedTransactions = [];

        // Now let's convert them back to sdk-js' Transaction objects.
        // Note that the Web Wallet provider returns the data field as a plain string. 
        // However, sdk-js' Transaction.fromPlainObject expects it to be base64-encoded.
        // Therefore, we need to apply a workaround (an additional conversion).
        for (const plainTransaction of plainSignedTransactions) {
            const plainTransactionClone = structuredClone(plainTransaction);
            plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
            const transaction = Transaction.fromPlainObject(plainTransactionClone);
            signedTransactions.push(transaction);
        }

        this.displayOutcome("Transactions signed.", signedTransactions.map((transaction) => transaction.toSendable()));
    }

    async signMessage() {
        await this.hwProvider.init();

        const message = new SignableMessage({
            message: Buffer.from("hello")
        });

        const signedMessage = await this.hwProvider.signMessage(message);

        this.displayOutcome("Message signed.", signedMessage);
    }

    displayOutcome(message, outcome) {
        if (!outcome) {
            console.log(message);
            alert(message);
            return;
        }

        console.log(message, outcome);
        alert(`${message}\n${JSON.stringify(outcome, null, 4)}`);
    }

    displayError(error) {
        console.error(error);
        alert(`Error: ${error}`);
    }
}

function getCurrentLocation() {
    return window.location.href.split("?")[0];
}
