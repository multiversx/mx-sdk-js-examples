// ## Creating Accounts

// You can create an account directly from the entrypoint. Keep in mind that the account is network agnostic, meaning it doesn't matter which entrypoint is used.
// Accounts are used for signing transactions and managing the account's nonce. They can also be saved to a PEM or keystore file for future use.

// For example, to create a Devnet entrypoint:

// ```js
import { DevnetEntrypoint } from '@multiversx/sdk-core';

const entrypoint = new DevnetEntrypoint();
const account = entrypoint.createAccount();
// ```

// ## Other Ways to Instantiate an Account

// 1. Using a Secret Key

// ```js
import { Account, UserSecretKey } from '@multiversx/sdk-core';

const secretKeyHex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9";
const secretKey = new UserSecretKey(Buffer.from(secretKeyHex, 'hex'));

const accountFromSecretKey = new Account(secretKey);
// ```

// 2. Using a PEM file

// ```js
import path from 'path';

const pemPath = path.resolve("../multiversx-sdk/testutils/testwallets/alice.pem");
const accountFromPem = Account.newFromPem(pemPath);
// ```

// 3. From a Keystore File

// ```js

const keystorePath = path.resolve("../multiversx-sdk/testutils/testwallets/alice.json");
const accountFromKeystore = Account.newFromKeystore({
  filePath: keystorePath,
  password: "password"
});
// ```

// 4. From a Mnemonic

// ```js
import { Mnemonic } from '@multiversx/sdk-core';

const mnemonic = Mnemonic.generate();
const accountFromMnemonic = Account.newFromMnemonic(mnemonic.getText());
// ```

// 5. From a KeyPair

// ```js
import { KeyPair } from '@multiversx/sdk-core';

const keypair = KeyPair.generate();
const accountFromKeyPairs = Account.newFromKeypair(keypair);
// ```

// ## Managing the Account Nonce

// An account has a `nonce` property that the user is responsible for maintaining. 
// You can fetch the nonce from the network and increment it after each transaction. 
// Each transaction must have the correct nonce, or it will fail to execute.

// ```js

const keyHex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9";
const key = new UserSecretKey(Buffer.from(secretKeyHex, 'hex'));

const accountWithNonce = new Account(secretKey);
const devnetEntrypoint = new DevnetEntrypoint();

// Fetch the current nonce from the network // md-comment
account.nonce = await entrypoint.recallAccountNonce(account.address);

// Create and send a transaction here... // md-comments 

// Increment nonce after each transaction // md-comment
const nonce = account.getNonceThenIncrement();
// ```

// For more details, see the Creating Transactions section.

// ## Saving the Account to a File

// Accounts can be saved to either a PEM file or a keystore file. 
// While PEM wallets are less secure for storing cryptocurrencies, they are convenient for testing purposes. 
// Keystore files offer a higher level of security.

// Saving the Account to a PEM File

// ```js
{
  const secretKeyHex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9";
  const secretKey = new UserSecretKey(Buffer.from(secretKeyHex, 'hex'));

  const account = new Account(secretKey);
  account.saveToPem({ path: path.resolve("wallet.pem") });
}
// ```

// Saving the Account to a Keystore File

// ```js

{
  const secretKeyHex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9";
  const secretKey = new UserSecretKey(Buffer.from(secretKeyHex, 'hex'));

  const account = new Account(secretKey);
  account.saveToKeystore({
    path: path.resolve("keystoreWallet.json"),
    password: "password"
  });
}

// ```

// Saving the Account to a Keystore File

// ```js
{
  const secretKeyHex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9";
  const secretKey = new UserSecretKey(Buffer.from(secretKeyHex, 'hex'));

  const account = new Account(secretKey);
  account.saveToKeystore({
    path: path.resolve("keystoreWallet.json"),
    password: "password"
  });
}

// ```

// ## Using a Ledger Device

// You can manage your account with a Ledger device, allowing you to sign both transactions and messages while keeping your keys secure. 
// The Ledger device also stores the nonce.

// Note: The multiversx-sdk package does not include Ledger support by default. To enable it, install the package with Ledger dependencies:
/* // md-ignore
// ```bash
npm install @multiversx/sdk-ledger
// ```
*/ // md-ignore

// ## Creating a Ledger Account
// When instantiating a LedgerAccount, you can specify the index of the address to use. By default, index 0 is used.

// ```js
import { LedgerAccount } from '@multiversx/sdk-core';

const account = new LedgerAccount();  // Defaults to index 0
// ```

// When signing transactions or messages, the Ledger device will prompt you to confirm the details before proceeding.

// ## Compatibility with IAccount Interface

// Both Account and LedgerAccount implement the IAccount interface, making them compatible with transaction controllers and any other component that expects this interface.

