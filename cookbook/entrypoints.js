// ## Overview

// This guide walks you through handling common tasks using the MultiversX Javascript SDK (v1, latest stable version).

// ## Creating an Entrypoint

// An Entrypoint represents a network client that simplifies access to the most common operations. 
// There is a dedicated entrypoint for each network: `MainnetEntrypoint`,  `DevnetEntrypoint`, `TestnetEntrypoint`, `LocalnetEntrypoint`.

// For example, to create a Devnet entrypoint:

// ```js
import { DevnetEntrypoint } from 'multiversx_sdk';

const entrypoint = new DevnetEntrypoint();
// ```

// ## Using a Custom API
// If you'd like to connect to a third-party API, you can specify the url parameter:

// ```js
import { DevnetEntrypoint } from 'multiversx_sdk';
const apiEntrypoint = new DevnetEntrypoint( { url: 'https://custom-multiversx-devnet-api.com' } ); s;
// ```

// ## Using a Proxy

// By default, the DevnetEntrypoint uses the standard API. However, you can create a custom entrypoint that interacts with a proxy by specifying the kind parameter:


// ```js
import { DevnetEntrypoint } from 'multiversx_sdk';

const customEntrypoint = new DevnetEntrypoint( {
  url: 'https://devnet-gateway.multiversx.com',
  kind: 'proxy'
} );
// ```
