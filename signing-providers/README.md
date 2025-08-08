# Examples: using the signing providers

This example (a simple, frontend-only web application) depicts the usage of different signing providers for dApps, such as:

- [(Web) Wallet provider](https://github.com/multiversx/mx-sdk-js-web-wallet-provider)
- [(Web) Wallet Cross-Window provider](@multiversx/sdk-web-wallet-cross-window-provider)
- [xAlias](https://github.com/multiversx/mx-sdk-js-web-wallet-provider) - from the perspective of a dApp, this one follows the interface of the Web Wallet provider (above)
- [DeFi Wallet provider](https://github.com/multiversx/mx-sdk-js-extension-provider)
- [Wallet Connect (xPortal) provider](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider)
- [Hardware Wallet (Ledger) provider](https://github.com/multiversx/mx-sdk-js-hw-provider)

## Prerequisites

Make sure you have the package `http-server` installed globally.

```bash
npm install --global http-server
```

Note that some providers (such as `hw-provider`) have to be used in pages served via HTTPS in order to work properly (a dummy certificate is included here).

Furthermore, make sure you install the browser extension `MultiversX DeFi Wallet` in advance.

## Running the examples

When you are ready, build the examples:

```bash
npm run build
```

Start the server (with a HTTPS binding):

```bash
http-server -c-1 -S -C ./dummy-certificate.pem -K ./dummy-certificate-key.pem --port=3006
```

Afterwards, navigate to [https://localhost:8080/index.html](https://localhost:8080/index.html).
