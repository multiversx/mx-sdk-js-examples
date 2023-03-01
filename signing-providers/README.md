# Examples: using the signing providers

This example (a simple, frontend-only web application) depicts the usage of different signing providers for dApps, such as:

 - [(Web) Wallet provider](https://github.com/multiversx/mx-sdk-erdjs-web-wallet-provider)
 - [DeFi Wallet provider](https://github.com/multiversx/mx-sdk-erdjs-extension-provider)
 - [Wallet Connect (xPortal) provider](https://github.com/multiversx/mx-sdk-erdjs-wallet-connect-provider)
 - [Hardware Wallet (Ledger) provider](https://github.com/multiversx/mx-sdk-erdjs-hw-provider)

## Prerequisites

Make sure you have the package `http-server` installed globally.

```
npm install --global http-server
```

Note that some providers (such as `hw-provider`) have to be used in pages served via HTTPS in order to work properly (a dummy certificate is included here).

Furthermore, make sure you install the browser extension `Maiar DeFi Wallet` in advance.

## Running the examples

When you are ready, build the examples:

```
npm run build
```

Start the server (with a HTTPS binding):

```
http-server -S -C ./dummy-certificate.pem -K ./dummy-certificate-key.pem --port=8080
```

Afterwards, navigate to https://localhost:8080/index.html.
