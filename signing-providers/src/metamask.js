import {
  Address,
  Message,
  Transaction,
  TransactionPayload,
} from "@multiversx/sdk-core";
import { CHAIN_ID } from "./config";
import { MetamaskProvider } from "@multiversx/sdk-metamask-provider/out/metamaskProvider";
import {
  createNativeAuthInitialPart,
  packNativeAuthToken,
  verifyNativeAuthToken,
} from "./auth";

const callbackUrl = window.location.href;

export class Metamask {
  constructor() {
    this._provider = MetamaskProvider.getInstance();
    this._address = "";
  }

  async init() {
    await this._provider.init();
  }

  async login() {
    await this.init();

    await this._provider.login({});

    const { address } = this._provider.account;
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

    console.log("Logout response:" + JSON.stringify(response));

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
      gasLimit: 150000,
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
      gasLimit: 150000,
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

  async signMessage() {
    await this._provider.init();

    const message = new Message({
      address: new Address(this._address),
      data: Buffer.from("hello"),
    });

    const response = await this._provider.signMessage(message);

    console.log("Message, upon signing:", message.toJSON());
    console.log("Response:", response.toJSON());

    alert(JSON.stringify(response, null, 4));
  }
}
