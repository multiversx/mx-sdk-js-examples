// ## Token transfers

// First, let's create a `TransferTransactionsFactory`.

// ```
import { GasEstimator, TransferTransactionsFactory } from "@multiversx/sdk-core";

const factory = new TransferTransactionsFactory(new GasEstimator());
// ```

// ### Single ESDT transfer

// ```
import { Address, TokenTransfer } from "@multiversx/sdk-core";


const transfer1 = TokenTransfer.fungibleFromAmount("TEST-8b028f", "100.00", 2);

const tx1 = factory.createESDTTransfer({
    tokenTransfer: transfer1,
    nonce: 7,
    sender: Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    receiver: Address.fromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    chainID: "D"
});
// ```

// ### Single NFT transfer

// ```
const transfer2 = TokenTransfer.nonFungible("TEST-38f249", 1);

const tx2 = factory.createESDTNFTTransfer({
    tokenTransfer: transfer2,
    nonce: 8,
    sender: Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    destination: Address.fromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    chainID: "D"
});
// ```

// ### Single SFT transfer

// ```
const transfer3 = TokenTransfer.semiFungible("SEMI-9efd0f", 1, 5);

const tx3 = factory.createESDTNFTTransfer({
    tokenTransfer: transfer3,
    nonce: 9,
    sender: Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    destination: Address.fromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    chainID: "D"
});
// ```

// ### Multi ESDT / NFT transfer

// ```
const transfers = [transfer1, transfer2, transfer3];

const tx4 = factory.createMultiESDTNFTTransfer({
    tokenTransfers: transfers,
    nonce: 10,
    sender: Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    destination: Address.fromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    chainID: "D"
});
