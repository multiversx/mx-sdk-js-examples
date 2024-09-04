import { addressOfAlice, addressOfBob } from "./framework.js"; // md-ignore

// ## Token transfers

// Generally speaking, in order to create transactions that transfer native tokens or ESDT tokens, one should use the `class:TransferTransactionsFactory` class.
//
// :::note
// In `sdk-core v13`, the `class:TransferTransactionsFactory` class was extended with new methods,
// to be aligned with the [SDKs specs](https://github.com/multiversx/mx-sdk-specs/blob/main/core/transactions-factories/transfer_transactions_factory.md).
// The old, legacy methods are still available (see below), thus existing client code isn't affected.
// :::
//
// :::note
// In `sdk-core v13`, the `class:TokenTransfer` class has changed, in a non-breaking manner.
// Though, from now on, it should only be used for prepairing ESDT token transfers, not native EGLD transfers.
//
// A `class:TokenTransfer` object can still be instantiated using the legacy methods, e.g. `fungibleFromAmount`, `nonFungible` (which are still available),
// but we recommend using the new approach instead (which, among others, makes abstraction of the number of decimals a token has).
// :::
//
// :::tip
// For formatting or parsing token amounts, see [formatting and parsing amounts](#formatting-and-parsing-amounts).
// :::

// First, let's create a `class:TransferTransactionsFactory`:

// ```js
import { Token, TokenTransfer, TransactionsFactoryConfig, TransferTransactionsFactory } from "@multiversx/sdk-core";

// The new approach of creating a "TransferTransactionsFactory": // md-as-comment
const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
const factory = new TransferTransactionsFactory({ config: factoryConfig });
// ```

// Now, we can use the factory to create transfer transactions.

// ### **EGLD** transfers (value movements)

// ```js
const tx1 = factory.createTransactionForNativeTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    // 1 EGLD // md-as-comment
    nativeAmount: BigInt("1000000000000000000")
});

tx1.nonce = 42n;
// ```

// ### Single ESDT transfer

// ```js
const tx2 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-8b028f" }),
            amount: 10000n
        })
    ]
});

tx2.nonce = 43n;
// ```

// ### Single NFT transfer

// ```js
const tx3 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-38f249", nonce: 1n }),
            amount: 1n
        })
    ]
});

tx3.nonce = 44n;
// ```

// ### Single SFT transfer

// ```js
const tx4 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "SEMI-9efd0f", nonce: 1n }),
            amount: 5n
        })
    ]
});

tx4.nonce = 45n;
// ```

// ### Multi ESDT / NFT transfer

// ```js
const tx5 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-8b028f" }),
            amount: 10000n
        }),
        new TokenTransfer({
            token: new Token({ identifier: "TEST-38f249", nonce: 1n }),
            amount: 1n
        }),
        new TokenTransfer({
            token: new Token({ identifier: "SEMI-9efd0f", nonce: 1n }),
            amount: 5n
        })
    ]
});

tx5.nonce = 46n;
// ```
