// ### Wallets

// **Generationg a mnemonic**
// Mnemonic generation is based on [bip39](https://www.npmjs.com/package/bip39) and can be achieved as follows:

// ``` js
import { Mnemonic } from "@multiversx/sdk-core";

const mnemonic = Mnemonic.generate();
const words = mnemonic.getWords()
console.log({ words });
// ```

// **Saving the mnemonic to a keystore file**
// The mnemonic can be saved to a keystore file:

// ``` js
import { UserWallet } from "@multiversx/sdk-core";
import path from 'path';

{ // md-ignore
    const mnemonic = Mnemonic.generate();

    // saves the mnemonic to a keystore file with kind=mnemonic // md-as-comment
    const wallet = UserWallet.fromMnemonic({ mnemonic: mnemonic.getText(), password: "password" });

    const filePath = path.join("src", "testdata", "testwallets", "walletWithMnemonic.json");
    wallet.save(filePath)
} // md-ignore
// ```

// **Deriving secret keys from a mnemonic**
// Given a mnemonic, we can derive keypairs:

// ``` js
{ // md-ignore
    const mnemonic = Mnemonic.generate();

    const secretKey = mnemonic.deriveKey(0);
    const publickKey = secretKey.generatePublicKey();

    console.log("Secret key: ", secretKey.hex());
    console.log("Public key: ", publickKey.hex());
} // md-ignore
// ```

// **Saving a secret key to a keystore file**
// The secret key can also be saved to a keystore file:

// ``` js
{ // md-ignore
    const mnemonic = Mnemonic.generate();

    const secretKey = mnemonic.deriveKey();

    // saves the mnemonic to a keystore file with kind=mnemonic // md-as-comment
    const wallet = UserWallet.fromSecretKey({ secretKey: aliceSecretKey, password: password });

    const filePath = path.join("src", "testdata", "testwallets", "walletWithSecretKey.json");
    wallet.save(filePath)
} // md-ignore
// ```

// **Saving a secrey key to a PEM file**
// We can save a secret key to a pem file. *This is not recommended as it is not secure, but it's very convenient for testing purposes.*

// ``` js
import { UserPem } from "@multiversx/sdk-core";
{ // md-ignore
    const mnemonic = Mnemonic.generate();

    // by default, derives using the index = 0 // md-as-comment
    const secretKey = mnemonic.deriveKey();
    const publicKey = secretKey.generatePublicKey();

    const label = publicKey.toAddress().toBech32()
    const pem = new UserPem(label, secretKey)

    const filePath = path.join("src", "testdata", "testwallets", "wallet.pem");
    pem.save(filePath)
} // md-ignore
// ```

// **Generating a KeyPair**
// A `KeyPair` is a wrapper over a secret key and a public key. We can create a keypair and use it for signing or verifying.

// ``` js
import { KeyPair } from "@multiversx/sdk-core";

{ // md-ignore
    const keypair = KeyPair.generate();

    // by default, derives using the index = 0 // md-as-comment
    const secretKey = keypair.getSecretKey();
    const publicKey = keypair.getPublicKey();
} // md-ignore
// ```

// **Loading a wallets from keystore mnemonic file**
// Load a keystore that holds an encrypted mnemonic (and perform wallet derivation at the same time):

// ``` js

{ // md-ignore
    const filePath = path.join("src", "testdata", "testwallets", "walletWithMnemonic.json");

    // loads the mnemonic and derives the a secret key; default index = 0 // md-as-comment
    let secretKey = UserWallet.loadSecretKey(path, "password");
    let address = secretKey.generatePublicKey().toAddress('erd')

    console.log("Secret key: ", secretKey.hex())
    console.log("Address: ", address.toBech32())

    // derive secret key with index = 7 // md-as-comment
    secretKey = UserWallet.loadSecretKey(path, "password", 7);
    address = secretKey.generatePublicKey().toAddress()

    console.log("Secret key: ", secretKey.hex())
    console.log("Address: ", address.toBech32())
} // md-ignore
// ```

// **Generating a KeyPair**
// A `KeyPair` is a wrapper over a secret key and a public key. We can create a keypair and use it for signing or verifying.

// ``` js

{ // md-ignore
    const keypair = KeyPair.generate();

    // by default, derives using the index = 0 // md-as-comment
    const secretKey = keypair.getSecretKey();
    const publicKey = keypair.getPublicKey();
} // md-ignore
// ```

// **Loading a wallet from a keystore secret key file**

// ``` js

{// md-ignore
    const filePath = path.join("src", "testdata", "testwallets", "walletWithSecretKey.json");

    let secretKey = UserWallet.loadSecretKey(path, "password");
    let address = secretKey.generatePublicKey().toAddress('erd');

    console.log("Secret key: ", secretKey.hex());
    console.log("Address: ", address.toBech32());
}// md-ignore
// ```

// **Loading a wallet from a PEM file**

// ``` js
{ // md-ignore
    const filePath = path.join("src", "testdata", "testwallets", "wallet.pem");

    let pem = UserPem.fromFile(path);

    console.log("Secret key: ", pem.secretKey.hex());
    console.log("Public key: ", pem.publicKey.hex());
} // md-ignore
// ```