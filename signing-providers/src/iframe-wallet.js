import {
    WindowProviderRequestEnums,
    WindowProviderResponseEnums,
    SignMessageStatusEnum,
} from "@multiversx/sdk-web-wallet-cross-window-provider/out/enums";
import { Address, Message, Transaction } from "@multiversx/sdk-core";
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";

function getEventOrigin(event) {
    return event.origin || event.originalEvent.origin;
}

export class IframeWallet {
    constructor() {
        this._handshakeEstablished = false;
        this._isIframe = window.self !== window.top;
        this.provider = ExtensionProvider.getInstance();
        window.addEventListener("message", this.messageListener.bind(this));
        window.addEventListener("beforeunload", this.closeHandshake.bind(this));
        this.replyToDapp({
            type: WindowProviderResponseEnums.handshakeResponse,
            data: "",
        });
    }

    async login() {
        await this.provider.init();
        this.replyToDapp({
            type: WindowProviderResponseEnums.handshakeResponse,
            data: "",
        });
        const account = await this.provider.login();

        this.replyToDapp({
            type: WindowProviderResponseEnums.loginResponse,
            data: {
                address: account.address,
                signature: account.signature,
            },
        });
    }

    async logout() {
        await this.provider.init();
        await this.provider.logout();
        this.replyToDapp({
            type: WindowProviderResponseEnums.disconnectResponse,
            data: {},
        });
    }

    async signMessage(payload) {
        const address = await this.provider.getAddress();

        const message = new Message({
            address: new Address(address),
            data: Buffer.from(payload.message),
        });

        const signedMessage = await this.provider.signMessage(message);

        this.replyToDapp({
            type: WindowProviderResponseEnums.signMessageResponse,
            data: {
                signature: Buffer.from(signedMessage?.signature).toString("hex"),
                status: SignMessageStatusEnum.signed,
            },
        });
    }

    closeHandshake() {
        this._handshakeEstablished = false;
        this.replyWithCancelled();
        this.replyToDapp({
            type: WindowProviderResponseEnums.handshakeResponse,
            data: "",
        });
    }

    replyWithCancelled() {
        this.replyToDapp({
            type: WindowProviderResponseEnums.cancelResponse,
            data: { address: "" },
        });
    }

    /**
     * @param {MessageEvent<RequestMessageType>} event
     */
    async messageListener(event) {
        const callbackUrl = getEventOrigin(event);
        const isFromSelf = callbackUrl === window.location.origin;

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
                await this.signMessage(payload);
                break;
            }

            case WindowProviderRequestEnums.signTransactionsRequest: {
                const transactions = payload.map((plainTransactionObject) =>
                    Transaction.newFromPlainObject(plainTransactionObject),
                );

                const signedTransactions = await this.provider.signTransactions(transactions);

                this.replyToDapp({
                    type: WindowProviderResponseEnums.signTransactionsResponse,
                    data: signedTransactions.map((transaction) => transaction.toPlainObject()),
                });
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
    }

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
            "*",
        );
    }
}
