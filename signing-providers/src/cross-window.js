import {
  Address,
  Message,
  Transaction,
  TransactionPayload,
} from "@multiversx/sdk-core";
import { CHAIN_ID } from "./config";
import { CrossWindowProvider } from "@multiversx/sdk-web-wallet-cross-window-provider";
import {
  createNativeAuthInitialPart,
  packNativeAuthToken,
  verifyNativeAuthToken,
} from "./auth";
import { displayOutcome } from "./helpers";

const walletAddress = "https://testnet-wallet.multiversx.com";
const explorerAddress = "https://testnet-api.multiversx.com";
const callbackUrl = window.location.href;

export class CrossWindowWallet {
  constructor() {
    this._provider = CrossWindowProvider.getInstance();
    this._address = "";
  }

  async init() {
    await CrossWindowProvider.getInstance().init();
    this._provider =
      CrossWindowProvider.getInstance().setWalletUrl(walletAddress);
  }

  async login() {
    await this.init();

    const { address } = await this._provider.login({ callbackUrl });
    this._address = address;
    console.log("Login response:" + JSON.stringify(address));

    return address;
  }

  async loginWithToken() {
    await this.init();

    const nativeAuthInitialPart = await createNativeAuthInitialPart();
    await this._provider.login({ token: nativeAuthInitialPart, callbackUrl });

    const address = this._provider.account.address;
    const signature = this._provider.account.signature;
    const nativeAuthToken = packNativeAuthToken(
      address,
      nativeAuthInitialPart,
      signature
    );
    this._address = address;

    verifyNativeAuthToken(nativeAuthToken);
  }

  async logout() {
    const response = await this._provider.logout();

    displayOutcome("Logout response:", response);

    return response;
  }

  async signTransaction() {
    const transaction = new Transaction({
      nonce: 42,
      value: "1",
      sender: new Address(this._address),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload(),
      chainID: CHAIN_ID,
      version: 1,
    });

    await this._provider.signTransaction(transaction, {
      callbackUrl: encodeURIComponent(callbackUrl),
    });

    alert(JSON.stringify(transaction.toSendable(), null, 4));
  }

  async signTransactions() {
    const sender = this._address;
    const firstTransaction = new Transaction({
      nonce: 42,
      value: "1",
      sender: new Address(sender),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload("hello once"),
      chainID: CHAIN_ID,
      version: 1,
    });

    const secondTransaction = new Transaction({
      nonce: 43,
      value: "100000000",
      sender: new Address(sender),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload("hello twice"),
      chainID: CHAIN_ID,
      version: 1,
    });

    const response = await this._provider.signTransactions(
      [firstTransaction, secondTransaction],
      {
        callbackUrl: encodeURIComponent(callbackUrl),
      }
    );
    console.log("First transaction, upon signing:", firstTransaction);
    console.log("Second transaction, upon signing:", secondTransaction);
    console.log(
      "Response:",
      response.map((r) => r.toPlainObject())
    );

    alert(JSON.stringify(response, null, 4));
  }

  async signRelayedTransaction() {
    const address = this._provider.account.address;
    const nonceResponse = await fetch(`${explorerAddress}/accounts/${address}`);
    const { nonce } = await nonceResponse.json();

    const transactionSignedByRelayer = sessionStorage.getItem("relayerTx");

    const firstTransaction = new Transaction({
      value: "0",
      data: new TransactionPayload(""),
      receiver: address,
      sender: address,
      relayer: new Address(address),
      gasLimit: 50000,
      gasPrice: 1000000000,
      nonce,
      chainID: CHAIN_ID,
      version: 1,
    });

    const transaction = transactionSignedByRelayer
      ? Transaction.fromPlainObject(JSON.parse(transactionSignedByRelayer))
      : firstTransaction;

    const response = await this._provider.signTransactions([transaction], {
      callbackUrl: encodeURIComponent(callbackUrl),
    });

    const signedTransaction = response[0].toPlainObject();

    if (!signedTransaction) {
      return;
    }

    if (transactionSignedByRelayer) {
      sessionStorage.removeItem("relayerTx");
      document.getElementById("relayed-tx-id").innerHTML = "1<sup>st</sup>";
      console.log("Relayed Transaction, upon signing:", transaction);
    } else {
      const { signature: relayerSignature, ...rest } = signedTransaction;
      const plainObjectTransaction = {
        ...rest,
        relayerSignature,
      };

      sessionStorage.setItem(
        "relayerTx",
        JSON.stringify(plainObjectTransaction)
      );
      document.getElementById("relayed-tx-id").innerHTML = "2<sup>nd</sup>";
      console.log("First Transaction, upon signing:", transaction);
    }

    console.log(
      "Response:",
      response.map((r) => r.toPlainObject())
    );
  }

  async signMessage() {
    await this._provider.init();
    const address = this._address;

    const message = new Message({
      address: new Address(address),
      data: Buffer.from("hello"),
    });

    const signedMessage = await this._provider.signMessage(message);

    displayOutcome(
      "Message signed. Signature: ",
      Buffer.from(signedMessage?.signature).toString("hex")
    );
  }
}
