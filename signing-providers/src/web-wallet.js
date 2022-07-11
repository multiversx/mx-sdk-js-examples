import qs from "qs";
import { WalletProvider } from "@elrondnetwork/erdjs-web-wallet-provider";
import { WALLET_PROVIDER_TESTNET } from "@elrondnetwork/erdjs-web-wallet-provider";
import { Address, Transaction, TransactionPayload } from "@elrondnetwork/erdjs"

export class WebWallet {
    constructor() {
        this.provider = new WalletProvider(WALLET_PROVIDER_TESTNET);
    }

    async login() {
        await this.provider.login();
    }

    async showAddress() {
        alert(this.getAddress() || "Try to login first.");
    }

    getAddress() {
        let params = qs.parse(getQueryString());
        return params.address;
    }

    async signTransactions() {
        const firstTransaction = new Transaction({
            nonce: 42,
            value: "1",
            gasLimit: 70000,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: new TransactionPayload("hello"),
            chainID: "T"
        });

        const secondTransaction = new Transaction({
            nonce: 43,
            value: "1",
            gasLimit: 70000,
            receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
            data: new TransactionPayload("world"),
            chainID: "T"
        });
        
        await this.provider.signTransactions([firstTransaction, secondTransaction]);
    }

    async showSignedTransactions() {
        const plainSignedTransactions = this.provider.getTransactionsFromWalletUrl();
        alert(JSON.stringify(plainSignedTransactions, null, 4));

        // Now let's convert them back to erdjs' Transaction objects.
        // Note that the Web Wallet provider returns the data field as a plain string. 
        // However, erdjs' Transaction.fromPlainObject expects it to be base64-encoded.
        // Therefore, we need to apply a workaround (an additional conversion).
        for (const plainTransaction of plainSignedTransactions) {
            const plainTransactionClone = structuredClone(plainTransaction);
            plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
            const transaction = Transaction.fromPlainObject(plainTransactionClone);

            console.log(transaction.toSendable());
        } 
    }

    async logout() {
        await this.provider.logout({ callbackUrl: window.location.href, redirectDelayMilliseconds: 10 });
    }
}

function getQueryString() {
    return window.location.search.slice(1);
}
