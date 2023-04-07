
## Token transfers

First, let's create a `TransferTransactionsFactory`.

```
import { GasEstimator, TransferTransactionsFactory } from "@multiversx/sdk-core";

const factory = new TransferTransactionsFactory(new GasEstimator());
```

### Single ESDT transfer

```
import { TokenTransfer } from "@multiversx/sdk-core";


const transfer1 = TokenTransfer.fungibleFromAmount("TEST-8b028f", "100.00", 2);

const tx1 = factory.createESDTTransfer({
    tokenTransfer: transfer1,
    nonce: 7,
    sender: addressOfAlice,
    receiver: addressOfBob,
    chainID: "D"
});
```

### Single NFT transfer

```
const transfer2 = TokenTransfer.nonFungible("TEST-38f249", 1);

const tx2 = factory.createESDTNFTTransfer({
    tokenTransfer: transfer2,
    nonce: 8,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});
```

### Single SFT transfer

```
const transfer3 = TokenTransfer.semiFungible("SEMI-9efd0f", 1, 5);

const tx3 = factory.createESDTNFTTransfer({
    tokenTransfer: transfer3,
    nonce: 9,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});
```

### Multi ESDT / NFT transfer

```
const transfers = [transfer1, transfer2, transfer3];

const tx4 = factory.createMultiESDTNFTTransfer({
    tokenTransfers: transfers,
    nonce: 10,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});