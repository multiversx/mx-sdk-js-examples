export {
  WindowProviderRequestEnums,
  WindowProviderResponseEnums,
} from "@multiversx/sdk-web-wallet-cross-window-provider/out/enums";
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";

function getEventOrigin(event) {
  return event.origin || event.originalEvent.origin;
}

export class IframeWallet {
  _handshakeEstablished = false;
  _isIframe = window.self !== window.top;

  constructor() {
    this.provider = ExtensionProvider.getInstance();
    window.addEventListener("message", this.messageListener);
    window.addEventListener("beforeunload", this.closeHandshake);
    this.replyToDapp({
      type: WindowProviderResponseEnums.handshakeResponse,
      data: "",
    });
  }

  async login() {
    this.replyToDapp({
      type: WindowProviderResponseEnums.handshakeResponse,
      data: "",
    });
    await this.provider.init();
    const account = await this.provider.login();
    this.replyToDapp({
      type: WindowProviderResponseEnums.loginResponse,
      data: {
        address: account.address,
        // signature: account.signature,
      },
    });
  }

  async logout() {
    await this.provider.init();
    await this.provider.logout();
    this.replyToDapp({
      type: WindowProviderResponseEnums.logoutResponse,
      data: {},
    });
  }

  async signTransaction() {
    console.log("IframeWallet signTransaction");
    return true;
  }

  async loginWithToken() {
    console.log("IframeWallet loginWithToken");
    return true;
  }

  async signMessage() {
    console.log("IframeWallet signMessage");
    return true;
  }

  closeHandshake = () => {
    this._handshakeEstablished = false;
    this.replyWithCancelled();
    this.replyToDapp({
      type: WindowProviderResponseEnums.handshakeResponse,
      data: "",
    });
  };

  replyWithCancelled = () => {
    this.replyToDapp({
      type: WindowProviderResponseEnums.cancelResponse,
      data: { address: "" },
    });
  };

  /**
   * @param {MessageEvent<RequestMessageType>} event
   */
  messageListener = async (event) => {
    const callbackUrl = getEventOrigin(event);
    const isFromSelf = callbackUrl === window.location.origin;

    console.log("messageListener", event);

    if (isFromSelf) {
      return;
    }

    const { type, payload } = event.data;

    const isHandshakeEstablished =
      type === WindowProviderRequestEnums.finalizeHandshakeRequest ||
      // handshake must be established for all other requests
      this._handshakeEstablished;

    if (!isHandshakeEstablished && !this._isIframe) {
      if (window.opener) {
        console.error("Handshake could not be established.");
      }

      return;
    }

    switch (type) {
      case WindowProviderRequestEnums.loginRequest: {
        await this.login();
        break;
      }

      case WindowProviderRequestEnums.signMessageRequest: {
        console.log("signMessageRequest");
        break;
      }

      case WindowProviderRequestEnums.signTransactionsRequest: {
        console.log("signTransactionsRequest");
        break;
      }

      case WindowProviderResponseEnums.cancelResponse:
      case WindowProviderRequestEnums.cancelAction: {
        this.replyWithCancelled();
        break;
      }

      case WindowProviderRequestEnums.finalizeHandshakeRequest: {
        this._handshakeEstablished = true;
        this.replyToDapp({
          type: WindowProviderResponseEnums.finalizeHandshakeResponse,
          data: { handshakeSession: "" },
        });
        break;
      }

      case WindowProviderRequestEnums.logoutRequest: {
        await this.logout();
        break;
      }

      default:
        break;
    }
  };

  /**
   * @param {Object} props
   * @param {WindowProviderResponseEnums} props.type
   * @param {Object} props.data
   */
  async replyToDapp(props) {
    const target = window.opener ?? window.parent;

    target.postMessage(
      {
        type: props.type,
        payload: {
          data: props.data,
        },
      },
      "*"
    );
  }
}
