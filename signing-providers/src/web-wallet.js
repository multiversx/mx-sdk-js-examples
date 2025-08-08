import {
  Address,
  AddressComputer,
  ApiNetworkProvider,
  Message,
  Transaction,
} from "@multiversx/sdk-core";
import { WalletProvider } from "@multiversx/sdk-web-wallet-provider";
import qs from "qs";
import {
  createNativeAuthInitialPart,
  packNativeAuthToken,
  verifyNativeAuthToken,
} from "./auth";
import { API_URL, CHAIN_ID, WALLET_PROVIDER_URL } from "./config";
import { displayOutcome } from "./helpers";

export class WebWallet {
  constructor() {
    this.provider = new WalletProvider(WALLET_PROVIDER_URL);
    this.apiNetworkProvider = new ApiNetworkProvider(API_URL, {
      clientName: "multiversx-sdk-js-examples",
    });
    this._address = "";
  }

  async login() {
    const callbackUrl = getCurrentLocation();
    await this.provider.login({ callbackUrl: callbackUrl });
  }

  async loginWithToken() {
    const nativeAuthInitialPart = await createNativeAuthInitialPart();
    // This is just an example of how to store the "nativeAuthInitialPart" in-between page changes & redirects (in "localStorage").
    // In real-life, use the approach that best suits your application.
    localStorage.setItem(
      "web-wallet-example:nativeAuthInitialPart",
      nativeAuthInitialPart
    );
    const callbackUrl = getCurrentLocation();
    await this.provider.login({
      callbackUrl: callbackUrl,
      token: nativeAuthInitialPart,
    });
  }

  async logout() {
    const callbackUrl = getCurrentLocation();
    await this.provider.logout({
      callbackUrl: callbackUrl,
      redirectDelayMilliseconds: 10,
    });
  }

  async showAddress() {
    const address = getUrlParams().address;
    this._address = address;
    displayOutcome(
      address ? "Address: " : "Error: ",
      address ? address : "Try to login first."
    );
  }

  async showTokenSignature() {
    const signature = getUrlParams().signature;
    displayOutcome(
      signature ? "Signature: " : "Error: ",
      signature ? signature : "Try to login (with token) first."
    );
  }

  async validateTokenSignature() {
    const address = getUrlParams().address;
    const nativeAuthInitialPart = await localStorage.getItem(
      "web-wallet-example:nativeAuthInitialPart"
    );
    const signature = getUrlParams().signature;
    const nativeAuthToken = packNativeAuthToken(
      address,
      nativeAuthInitialPart,
      signature
    );

    verifyNativeAuthToken(nativeAuthToken);
  }

  async signTransaction() {
    const sender = getUrlParams().address;
    if (!sender) {
      displayOutcome("Try to login first.");
      return;
    }

    const senderNonce = await this.recallNonce(sender);

    const transaction = new Transaction({
      nonce: senderNonce,
      value: "1000000000000000000",
      sender: new Address(sender),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: Uint8Array.from(Buffer.from("hello world")),
      chainID: CHAIN_ID,
    });

    await this.provider.signTransaction(transaction);
  }

  async signTransactions() {
    const sender = getUrlParams().address;
    if (!sender) {
      displayOutcome("Try to login first.");
      return;
    }

    const senderNonce = await this.recallNonce(sender);

    const firstTransaction = new Transaction({
      nonce: senderNonce,
      value: "1000000000000000000",
      gasLimit: 70000,
      sender: new Address(sender),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      data: Uint8Array.from(Buffer.from("hello")),
      chainID: CHAIN_ID,
    });

    const secondTransaction = new Transaction({
      nonce: senderNonce + 1n,
      value: "3000000000000000000",
      gasLimit: 70000,
      sender: new Address(sender),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      data: Uint8Array.from(Buffer.from("world")),
      chainID: CHAIN_ID,
    });

    await this.provider.signTransactions([firstTransaction, secondTransaction]);
  }

  async signRelayedTransaction() {
    const sender = getUrlParams().address;
    if (!sender) {
      displayOutcome("Try to login first.");
      return;
    }

    const senderShard = new AddressComputer().getShardOfAddress(
      Address.newFromBech32(sender)
    );
    const relayer = {
      // https://github.com/multiversx/mx-sdk-testwallets/blob/main/users/mike.pem
      0: "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa",
      // https://github.com/multiversx/mx-sdk-testwallets/blob/main/users/grace.pem
      1: "erd1r69gk66fmedhhcg24g2c5kn2f2a5k4kvpr6jfw67dn2lyydd8cfswy6ede",
      // https://github.com/multiversx/mx-sdk-testwallets/blob/main/users/carol.pem
      2: "erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8",
    }[senderShard];

    console.log("Relayer shard:", senderShard);
    console.log("Relayer:", relayer);

    const senderNonce = await this.recallNonce(sender);
    const data = Buffer.from("hello");

    const transaction = new Transaction({
      nonce: Number(senderNonce),
      value: "10000000000000000",
      sender: Address.newFromBech32(sender),
      receiver: Address.newFromBech32(
        "erd1testnlersh4z0wsv8kjx39me4rmnvjkwu8dsaea7ukdvvc9z396qykv7z7"
      ),
      relayer: Address.newFromBech32(relayer),
      gasPrice: 1000000000,
      gasLimit: 100000 + 1500 * data.length,
      data: data,
      chainID: CHAIN_ID,
    });

    await this.provider.signTransaction(transaction);
  }

  async showSignedTransactions() {
    const plainSignedTransactions =
      this.provider.getTransactionsFromWalletUrl();
    alert(JSON.stringify(plainSignedTransactions, null, 4));

    // Now let's convert them back to sdk-js' Transaction objects.
    // Note that the Web Wallet provider returns the data field as a plain string.
    // However, sdk-js' Transaction.fromPlainObject expects it to be base64-encoded.
    // Therefore, we need to apply a workaround (an additional conversion).
    for (const plainTransaction of plainSignedTransactions) {
      const plainTransactionClone = structuredClone(plainTransaction);
      plainTransactionClone.data = Buffer.from(
        plainTransactionClone.data
      ).toString("base64");
      const transaction = Transaction.newFromPlainObject(plainTransactionClone);

      console.log(transaction.toSendable());
    }
  }

  async sendSignedTransactions() {
    const plainSignedTransactions =
      this.provider.getTransactionsFromWalletUrl();

    for (const plainTransaction of plainSignedTransactions) {
      const plainTransactionClone = structuredClone(plainTransaction);
      plainTransactionClone.data = Buffer.from(
        plainTransactionClone.data
      ).toString("base64");
      const transaction = Transaction.newFromPlainObject(plainTransactionClone);

      await this.apiNetworkProvider.sendTransaction(transaction);
    }
  }

  async signMessage() {
    if (!this._address) {
      return displayOutcome(
        "Unable to sign.",
        "Login & press Show address first."
      );
    }

    const message = new Message({
      address: new Address(this._address),
      data: Buffer.from("hello"),
    });

    const callbackUrl = getCurrentLocation();
    await this.provider.signMessage(message, { callbackUrl });
  }

  async showMessageSignature() {
    const signature = this.provider.getMessageSignatureFromWalletUrl();
    return displayOutcome("Signature:", signature);
  }

  async recallNonce(address) {
    const accountOnNetwork = await this.apiNetworkProvider.getAccount(
      Address.newFromBech32(address)
    );
    const nonce = BigInt(accountOnNetwork.nonce);

    console.log(`recallNonce(), address = ${address}, nonce = ${nonce}`);

    return nonce;
  }
}

function getUrlParams() {
  const queryString = window.location.search.slice(1);
  const params = qs.parse(queryString);

  console.log("URL params", params);

  return params;
}

function getCurrentLocation() {
  return window.location.href.split("?")[0];
}
