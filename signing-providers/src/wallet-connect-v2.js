import { Address, Message, Transaction, TransactionPayload } from "@multiversx/sdk-core";
import { WalletConnectV2Provider } from "@multiversx/sdk-wallet-connect-provider";
import QRCode from "qrcode";

import { createNativeAuthInitialPart, packNativeAuthToken, verifyNativeAuthToken } from "./auth";
import { CHAIN_ID, WALLET_CONNECT_PROJECT_ID, WALLET_CONNECT_RELAY_URL } from "./config";
import { displayOutcome } from "./helpers";

export class WalletConnectV2 {
  constructor() {
    this.provider = new WalletConnectV2Provider(
      this.prepareCallbacks(),
      CHAIN_ID,
      WALLET_CONNECT_RELAY_URL,
      WALLET_CONNECT_PROJECT_ID,
    );
  }

  prepareCallbacks() {
    const self = this;

    return {
      onClientLogin: async function () {
        closeModal();
        const address = self.provider.getAddress();
        alert(`onClientLogin(), address: ${address}`);
      },
      onClientLogout: function () {
        alert("onClientLogout()");
      },
      onClientEvent: function (event) {
        alert("onClientEvent()", event);
      },
    };
  }

  async login() {
    await this.provider.init();
    const { uri, approval } = await this.provider.connect();

    await openModal(uri);

    try {
      await this.provider.login({ approval });
    } catch (err) {
      console.log(err);
      alert("Connection Proposal Refused");
    }
  }

  async loginWithToken() {
    await this.provider.init();
    const nativeAuthInitialPart = await createNativeAuthInitialPart();
    const { uri, approval } = await this.provider.connect();

    await openModal(uri);

    try {
      const account = await this.provider.login({
        approval,
        token: nativeAuthInitialPart,
      });

      const address = account.address;
      const signature = account.signature;
      const nativeAuthToken = packNativeAuthToken(address, nativeAuthInitialPart, signature);

      verifyNativeAuthToken(nativeAuthToken);
    } catch (err) {
      console.log(err);
      alert("Rejected by user");
    }
  }

  async logout() {
    await this.provider.init();
    await this.provider.logout();
  }

  async signTransaction() {
    await this.provider.init();

    const sender = this.provider.getAddress();
    const transaction = new Transaction({
      nonce: 42,
      value: "1",
      sender: new Address(sender),
      receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload(),
      chainID: CHAIN_ID,
      version: 1,
    });

    await this.provider.signTransaction(transaction);

    alert(JSON.stringify(transaction.toSendable(), null, 4));
  }

  async signTransactions() {
    await this.provider.init();

    const sender = this.provider.getAddress();
    const firstTransaction = new Transaction({
      nonce: 43,
      value: "1",
      sender: new Address(sender),
      receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload(),
      chainID: CHAIN_ID,
      version: 1,
    });

    const secondTransaction = new Transaction({
      nonce: 44,
      value: "100000000",
      sender: new Address(sender),
      receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload("hello world"),
      chainID: CHAIN_ID,
      version: 1,
    });

    const transactions = [firstTransaction, secondTransaction];
    await this.provider.signTransactions(transactions);

    alert(JSON.stringify([firstTransaction.toSendable(), secondTransaction.toSendable()], null, 4));
  }

  async signMessage() {
    await this.provider.init();
    const address = this.provider.getAddress();

    const message = new Message({
      address: new Address(address),
      data: Buffer.from("hello"),
    });

    const signedMessage = await this.provider.signMessage(message);

    displayOutcome(
      "Message signed. Signature: ",
      Buffer.from(signedMessage?.signature).toString("hex"),
    );
  }
}

async function openModal(connectorUri) {
  const svg = await QRCode.toString(connectorUri, { type: "svg" });

  window.$("#MyWalletConnectV2QRContainer").html(svg);
  window.$("#MyWalletConnectV2Modal").modal("show");
}

function closeModal() {
  window.$("#MyWalletConnectV2Modal").modal("hide");
}
