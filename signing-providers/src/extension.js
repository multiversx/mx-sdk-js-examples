import {
  Address,
  Message,
  Transaction,
  TransactionPayload,
} from "@multiversx/sdk-core";
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";
import {
  createNativeAuthInitialPart,
  packNativeAuthToken,
  verifyNativeAuthToken,
} from "./auth";
import { CHAIN_ID } from "./config";
import { displayOutcome } from "./helpers";

export class Extension {
  constructor() {
    this.provider = ExtensionProvider.getInstance();
  }

  async login() {
    await this.provider.init();
    const account = await this.provider.login();

    alert(`Address: ${account.address}`);
  }

  async loginWithToken() {
    await this.provider.init();

    const nativeAuthInitialPart = await createNativeAuthInitialPart();
    const account = await this.provider.login({ token: nativeAuthInitialPart });

    const address = account.address;
    const signature = account.signature;
    const nativeAuthToken = packNativeAuthToken(
      address,
      nativeAuthInitialPart,
      signature
    );

    verifyNativeAuthToken(nativeAuthToken);
  }

  async logout() {
    await this.provider.init();
    await this.provider.logout();
  }

  async signTransaction() {
    await this.provider.init();

    const sender = await this.provider.getAddress();
    const transaction = new Transaction({
      nonce: 42,
      value: "1",
      sender: new Address(sender),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: Buffer.from("hello"),
      chainID: CHAIN_ID,
      version: 1,
    });

    await this.provider.signTransaction(transaction);

    alert(JSON.stringify(transaction.toSendable(), null, 4));
  }

  async signTransactions() {
    await this.provider.init();

    const sender = await this.provider.getAddress();
    const firstTransaction = new Transaction({
      nonce: 42,
      value: "1",
      sender: new Address(sender),
      receiver: new Address(
        "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: Buffer.from("hello"),
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
      data: Buffer.from("hello world"),
      chainID: CHAIN_ID,
      version: 1,
    });

    await this.provider.signTransactions([firstTransaction, secondTransaction]);
    console.log("First transaction, upon signing:", firstTransaction);
    console.log("Second transaction, upon signing:", secondTransaction);

    alert(
      JSON.stringify(
        [firstTransaction.toSendable(), secondTransaction.toSendable()],
        null,
        4
      )
    );
  }

  async signMessage() {
    await this.provider.init();

    const address = await this.provider.getAddress();

    const message = new Message({
      address: new Address(address),
      data: Buffer.from("hello"),
    });

    const signedMessage = await this.provider.signMessage(message);

    displayOutcome(
      "Message signed. Signature: ",
      Buffer.from(signedMessage?.signature).toString("hex")
    );
  }
}
