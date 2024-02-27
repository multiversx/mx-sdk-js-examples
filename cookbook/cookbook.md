## Creating network providers

Creating an API provider:

```
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

const apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com");
```

Creating a Proxy provider:

```
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";

const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
```

Use the classes from `@multiversx/sdk-network-providers` **only as a starting point**. 
As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements 
(whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

On this topic, please see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).

## Fetching network parameters

```
const networkConfig = await apiNetworkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
```

## Working with accounts

### Synchronizing an account object

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account, and updates the local representation of the account.

```
import { Account } from "@multiversx/sdk-core";

const alice = new Account(addressOfAlice);
const aliceOnNetwork = await apiNetworkProvider.getAccount(addressOfAlice);
alice.update(aliceOnNetwork);

console.log("Nonce:", alice.nonce);
console.log("Balance:", alice.balance.toString());
```

### Managing the sender nonce locally

When sending a bunch of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```
alice.incrementNonce();
console.log("Nonce:", alice.nonce);
```

:::note
Since `sdk-core v13`, the `Transaction` class is considered legacy. The alternative is `TransactionNext`. 
In a future major release (e.g. end of 2024), the legacy `Transaction` class will be dropped, and replaced by `TransactionNext`, 
which will also receive the short name, `Transaction`.
:::

If you are using `sdk-core v13` or later, use `tx.nonce = ` to apply the nonce to a transaction. 
For `sdk-core v12` or earlier, use the legacy `tx.setNonce()` to apply the nonce to a transaction.

```

notYetSignedTxNext.nonce = alice.getNonceThenIncrement();
notYetSignedTxLegacy.setNonce(alice.getNonceThenIncrement());
```

For further reference, please see [nonce management](https://docs.multiversx.com/integrators/creating-transactions/#nonce-management).

## Preparing `TokenTransfer` objects (legacy)

:::note
Since `sdk-core v13`, the `TokenTransfer` class is considered legacy.

For the alternative, see [token transfers](#token-transfers).

For formatting or parsing token amounts, see [formatting and parsing amounts](#formatting-and-parsing-amounts).
:::

A `TokenTransfer` object for **EGLD transfers** (value movements):

```
import { TokenTransfer } from "@multiversx/sdk-core";

let firstTransfer = TokenTransfer.egldFromAmount("1.5");
let secondTransfer = TokenTransfer.egldFromBigInteger("1500000000000000000");

console.log(firstTransfer.valueOf(), secondTransfer.valueOf());
console.log(firstTransfer.toPrettyString(), secondTransfer.toPrettyString());
```

A `TokenTransfer` object for transferring **fungible** tokens:

```
const identifier = "FOO-123456";
const numDecimals = 2;
firstTransfer = TokenTransfer.fungibleFromAmount(identifier, "1.5", numDecimals);
secondTransfer = TokenTransfer.fungibleFromBigInteger(identifier, "4000", numDecimals);

console.log(firstTransfer.toString()); // Will output: 150.
console.log(firstTransfer.toPrettyString()); // Will output: 1.50 FOO-123456.
console.log(secondTransfer.toString()); // Will output: 4000.
console.log(secondTransfer.toPrettyString()); // Will output: 40.00 FOO-123456.
```

A `TokenTransfer` object for transferring **semi-fungible** tokens:

```
let nonce = 3;
let quantity = 50;
let transfer = TokenTransfer.semiFungible(identifier, nonce, quantity);
```

A `TokenTransfer` object for transferring **non-fungible** tokens (the quantity doesn't need to be specified for NFTs, as the token is only one of its kind):

```
nonce = 7;
transfer = TokenTransfer.nonFungible(identifier, nonce);
```

A `TokenTransfer` object for transferring **meta-esdt** tokens:

```
transfer = TokenTransfer.metaEsdtFromAmount(identifier, nonce, "0.1", numDecimals);
```
## Broadcasting transactions

### Preparing a simple transaction

:::note
Since `sdk-core v13`, the `Transaction` class is considered legacy. The alternative is `TransactionNext`. 
In a future major release (e.g. end of 2024), the legacy `Transaction` class will be dropped, and replaced by `TransactionNext`, 
which will also receive the short name, `Transaction`.
:::

If you are using `sdk-core v13` or later, use `TransactionNext` class to prepare a transaction. 
For `sdk-core v12` or earlier, use the legacy `Transaction` class to prepare a transaction.

```
import { Transaction, TransactionNext, TransactionPayload } from "@multiversx/sdk-core";

const txNext = new TransactionNext({
    data: new TextEncoder().encode("food for cats"),
    gasLimit: 70000n,
    sender: addressOfAlice.toBech32(),
    receiver: addressOfBob.toBech32(),
    value: 1000000000000000000n,
    chainID: "D"
});

txNext.nonce = 42n;

const txLegacy = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    value: "1000000000000000000",
    chainID: "D"
});

txLegacy.setNonce(43);
```

### Broadcast using a network provider

:::important
Note that the transactions **must be signed before being broadcasted**. 
On the front-end, signing can be achieved using a signing provider.
On this purpose, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
:::

In order to broadcast a transaction, use a network provider:

```

const txHashNext = await apiNetworkProvider.sendTransaction(readyToBroadcastTxNext); 
console.log("TX hash:", txHashNext); 

const txHashLegacy = await apiNetworkProvider.sendTransaction(readyToBroadcastTxLegacy); 
console.log("TX hash:", txHashLegacy); 
```

### Wait for transaction completion

```
import { TransactionWatcher } from "@multiversx/sdk-core";

const watcherUsingApi = new TransactionWatcher(apiNetworkProvider);
const transactionOnNetworkUsingApi = await watcherUsingApi.awaitCompleted(txHash);
```

If, instead, you use a `ProxyNetworkProvider` to instantiate the `TransactionWatcher`, you'll need to patch the `getTransaction` method,
so that it instructs the network provider to fetch the so-called _processing status_, as well (required by the watcher to detect transaction completion).

```
const watcherUsingProxy = new TransactionWatcher({
    getTransaction: async (hash) => { return await proxyNetworkProvider.getTransaction(hash, true) }
});

const transactionOnNetworkUsingProxy = await watcherUsingProxy.awaitCompleted(txHash);
```

In order to wait for multiple transactions:

```
await Promise.all([
    watcherUsingApi.awaitCompleted(tx1), 
    watcherUsingApi.awaitCompleted(tx2), 
    watcherUsingApi.awaitCompleted(tx3)
]);
```

For a different awaiting strategy, also see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).
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
```
## Formatting and parsing amounts

:::note
For formatting or parsing token amounts as numbers (with fixed number of decimals), please do not rely on `sdk-core`. Instead, use `sdk-dapp` (higher level) or `bignumber.js` (lower level).
:::

You can format amounts using `formatAmount` from `sdk-dapp`:

```
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Format using sdk-dapp:", formatAmount({
    input: "1500000000000000000",
    decimals: 18,
    digits: 4
}));
```

Or directly using `bignumber.js`:

```
import BigNumber from "bignumber.js";

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

console.log("Format using bignumber.js:",new BigNumber("1500000000000000000").shiftedBy(-18).toFixed(4));
```

You can parse amounts using `parseAmount` from `sdk-dapp`:

```
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Parse using sdk-dapp:", parseAmount("1.5", 18));
```

Or directly using `bignumber.js`:

```
console.log("Parse using bignumber.js:", new BigNumber("1.5").shiftedBy(18).decimalPlaces(0).toFixed(0));
```
## Contract deployments

### Load the bytecode from a file

```
import { Code } from "@multiversx/sdk-core";
import { promises } from "fs";

let buffer = await promises.readFile("../contracts/counter.wasm");
let code = Code.fromBuffer(buffer);
```

### Load the bytecode from an URL

```
import axios from "axios";

let response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.wasm", {
    responseType: "arraybuffer",
    transformResponse: [],
    headers: {
        "Accept": "application/wasm"
    }
});

buffer = Buffer.from(response.data);
code = Code.fromBuffer(buffer);
```

### Perform a contract deployment

Create a `SmartContract` object:

```
import { SmartContract } from "@multiversx/sdk-core";

let contract = new SmartContract();
```

Prepare the deploy transaction:

```
import { CodeMetadata } from "@multiversx/sdk-core";

const deployerAddress = addressOfAlice;

const deployTransaction = contract.deploy({
    deployer: deployerAddress,
    code: code,
    codeMetadata: new CodeMetadata(/* set the parameters accordingly */),
    initArguments: [/* set the initial arguments, if any */],
    gasLimit: 20000000,
    chainID: "D"
});
```

Then, set the transaction nonce.

Note that the account nonce must be synchronized beforehand. 
Also, locally increment the nonce of the deployer (optional).

```
import { Account } from "@multiversx/sdk-core";

const deployer = new Account(deployerAddress);
const deployerOnNetwork = await networkProvider.getAccount(deployerAddress);
deployer.update(deployerOnNetwork);

deployTransaction.setNonce(deployer.getNonceThenIncrement());
```

Then **sign the transaction** using a wallet / signing provider of your choice (not shown here).



Upon signing, you would usually compute the contract address (deterministically computable), as follows:

```
let contractAddress = SmartContract.computeAddress(deployTransaction.getSender(), deployTransaction.getNonce());
console.log("Contract address:", contractAddress.bech32());
```

In order to broadcast the transaction and await its completion, use a network provider and a transaction watcher:

```
import { TransactionWatcher } from "@multiversx/sdk-core";

await networkProvider.sendTransaction(deployTransaction);
let transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(deployTransaction);
```

In the end, parse the results:

```
import { ResultsParser } from "@multiversx/sdk-core";

let { returnCode } = new ResultsParser().parseUntypedOutcome(transactionOnNetwork);
console.log("Return code:", returnCode);
```
## ABI

### Load the ABI from a file

```
import { AbiRegistry, Address, SmartContract } from "@multiversx/sdk-core";
import { promises } from "fs";

let abiJson = await promises.readFile("../contracts/counter.abi.json", { encoding: "utf8" });
let abiObj = JSON.parse(abiJson);
let abiRegistry = AbiRegistry.create(abiObj);
let existingContractAddress = Address.fromBech32("erd1qqqqqqqqqqqqqpgq5sup58y38q3pwyqklagxmuraetshrqwpd8ssh0ssph");
let existingContract = new SmartContract({ address: existingContractAddress, abi: abiRegistry });
```

### Load the ABI from an URL

```
import axios from "axios";

const response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.abi.json");
abiRegistry = AbiRegistry.create(response.data);
existingContract = new SmartContract({ address: existingContractAddress, abi: abiRegistry });
```
## Contract queries

### When the ABI is not available

```
import { AddressValue, BigUIntType, BinaryCodec, ResultsParser, SmartContract } from "@multiversx/sdk-core";

let legacyDelegationContract = new SmartContract({
    address: legacyDelegationContractAddress
});

let query = legacyDelegationContract.createQuery({
    func: "getClaimableRewards",
    args: [new AddressValue(addressOfFirstDevnetDelegator)]
});

let queryResponse = await networkProvider.queryContract(query);
let bundle = new ResultsParser().parseUntypedQueryResponse(queryResponse);
let firstValue = bundle.values[0];
let decodedValue = new BinaryCodec().decodeTopLevel(firstValue, new BigUIntType());

console.log(bundle.returnCode);
console.log(bundle.returnMessage);
console.log(bundle.values);
console.log(decodedValue.valueOf().toFixed(0));
```

### Using `Interaction`, when the ABI is not available

```
import { Interaction } from "@multiversx/sdk-core";

let args = [new AddressValue(addressOfFirstDevnetDelegator)];
query = new Interaction(legacyDelegationContract, "getClaimableRewards", args)
    .buildQuery();

let queryResponseFromInteraction = await networkProvider.queryContract(query);

console.assert(JSON.stringify(queryResponseFromInteraction) === JSON.stringify(queryResponse));
```

Then, parse the response as above.

### When the ABI is available

```
import { AbiRegistry } from "@multiversx/sdk-core";

const legacyDelegationAbi = AbiRegistry.create({
    "endpoints": [
        {
            "name": "getClaimableRewards",
            "inputs": [{
                "type": "Address"
            }],
            "outputs": [{
                "type": "BigUint"
            }]
        }
    ]
});

const getClaimableRewardsEndpoint = legacyDelegationAbi.getEndpoint("getClaimableRewards");

query = legacyDelegationContract.createQuery({
    func: "getClaimableRewards",
    args: [new AddressValue(addressOfFirstDevnetDelegator)]
});

queryResponse = await networkProvider.queryContract(query);
let { values } = new ResultsParser().parseQueryResponse(queryResponse, getClaimableRewardsEndpoint);
console.log(values[0].valueOf().toFixed(0));
```

### Using `Interaction`, when the ABI is available

Prepare the interaction, check it, then build the query:

```
legacyDelegationContract = new SmartContract({
    address: legacyDelegationContractAddress,
    abi: legacyDelegationAbi
});

let interaction = legacyDelegationContract.methods.getClaimableRewards([addressOfFirstDevnetDelegator]);
query = interaction.check().buildQuery();
```

Then, run the query and parse the results:

```
queryResponse = await networkProvider.queryContract(query);
let typedBundle = new ResultsParser().parseQueryResponse(queryResponse, interaction.getEndpoint());
console.log(typedBundle.values[0].valueOf().toFixed(0));
```

Depending on the context, reinterpret (cast) the results:

```
let firstValueAsStruct = <Struct>firstValue;
```
## Contract interactions

### When the ABI is not available

```
import { Address, AddressValue, SmartContract, U64Value } from "@multiversx/sdk-core";

let contractAddress = new Address("erd1qqqqqqqqqqqqqpgq5sup58y38q3pwyqklagxmuraetshrqwpd8ssh0ssph");
let contract = new SmartContract({ address: contractAddress });

let tx1 = contract.call({
    caller: addressOfAlice,
    func: "doSomething",
    gasLimit: 5000000,
    args: [new AddressValue(addressOfCarol), new U64Value(1000)],
    chainID: "D"
});

tx1.setNonce(42);
```

Then, sign, broadcast `tx` and wait for its completion.

### Using `Interaction`, when the ABI is not available

```
import { Interaction, TokenTransfer, U32Value } from "@multiversx/sdk-core";

let args = [new U32Value(1), new U32Value(2), new U32Value(3)];
let interaction = new Interaction(contract, "doSomethingWithValue", args);

let tx2 = interaction
    .withSender(addressOfAlice)
    .withNonce(43)
    .withValue(TokenTransfer.egldFromAmount(1))
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

Then, sign, broadcast `tx` and wait for its completion.

### Using `Interaction`, when the ABI is available

```
import { AbiRegistry } from "@multiversx/sdk-core";

let abiRegistry = AbiRegistry.create({
    "endpoints": [
        {
            "name": "foobar",
            "inputs": [],
            "outputs": []
        },
        {
            "name": "doSomethingWithValue",
            "inputs": [{
                "type": "u32"
            },
            {
                "type": "u32"
            },
            {
                "type": "u32"
            }],
            "outputs": []
        }
    ]
});

contract = new SmartContract({ address: contractAddress, abi: abiRegistry });

let tx3 = contract.methods.doSomethingWithValue([1, 2, 3])
    .withSender(addressOfAlice)
    .withNonce(44)
    .withValue(TokenTransfer.egldFromAmount(1))
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

Now let's see an example using variadic arguments, as well:

```
import { StringValue, VariadicValue } from "@multiversx/sdk-core";

abiRegistry = AbiRegistry.create({
    "endpoints": [
        {
            "name": "foobar",
            "inputs": [],
            "outputs": []
        },
        {
            "name": "doSomething",
            "inputs": [{
                "type": "counted-variadic<utf-8 string>"
            },
            {
                "type": "variadic<u64>"
            }],
            "outputs": []
        }
    ]
});

contract = new SmartContract({ address: contractAddress, abi: abiRegistry });

let tx4 = contract.methods.doSomething(
    [
        // Counted variadic must be explicitly typed 
        VariadicValue.fromItemsCounted(StringValue.fromUTF8("foo"), StringValue.fromUTF8("bar")),
        // Regular variadic can be implicitly typed 
        1, 2, 3
    ])
    .withSender(addressOfAlice)
    .withNonce(45)
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

### Transfer & execute

Given an interaction:

```
interaction = contract.methods.foobar([]);
```

One can apply token transfers to the smart contract call, as well.

For single payments, do as follows:

```
// Fungible token 
interaction.withSingleESDTTransfer(TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18));

// Non-fungible token 
interaction.withSingleESDTNFTTransfer(TokenTransfer.nonFungible("SDKJS-38f249", 1));
```

For multiple payments:

```
interaction.withMultiESDTNFTTransfer([
    TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18),
    TokenTransfer.nonFungible("SDKJS-38f249", 1)
]);
```

## Parsing contract results

:::important
When the default `ResultsParser` misbehaves, please open an issue [on GitHub](https://github.com/multiversx/mx-sdk-js-core/issues), and also provide as many details as possible about the unparsable results (e.g. provide a dump of the transaction object if possible - make sure to remove any sensitive information).
:::

### When the ABI is not available

```
import { ResultsParser } from "@multiversx/sdk-core";

let resultsParser = new ResultsParser();
let txHash = "d415901a9c88e564adf25b71b724b936b1274a2ad03e30752fdc79235af8ea3e";
let transactionOnNetwork = await networkProvider.getTransaction(txHash);
let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);

console.log(untypedBundle.returnCode, untypedBundle.values.length);
```

### When the ABI is available

```
let endpointDefinition = AbiRegistry.create({
    "name": "counter",
    "endpoints": [{
        "name": "increment",
        "inputs": [],
        "outputs": [{ "type": "i64" }]
    }]
}).getEndpoint("increment");

transactionOnNetwork = await networkProvider.getTransaction(txHash);
let typedBundle = resultsParser.parseOutcome(transactionOnNetwork, endpointDefinition);

console.log(typedBundle.returnCode, typedBundle.values.length);
```

Above, `endpointDefinition` is manually constructed. 
However, in practice, it can be obtained from the `Interaction` object, if available in the context:

```
endpointDefinition = interaction.getEndpoint();
```

Alternatively, the `endpointDefinition` can also be obtained from the `SmartContract` object:

```
let endpointDefinition = smartContract.getEndpoint("myFunction");
```

For customizing the default parser, also see [extending sdk-js](/sdk-and-tools/sdk-js/extending-sdk-js).
## Contract events

### Decode transaction events

Example of decoding a transaction event having the identifier `deposit`:

```
const abiContent = await promises.readFile("../contracts/example.abi.json", { encoding: "utf8" });
const abiObj = JSON.parse(abiContent);
const abiRegistry = AbiRegistry.create(abiObj);
const resultsParser = new ResultsParser();

const eventIdentifier = "deposit";
const eventDefinition = abiRegistry.getEvent(eventIdentifier);
const transaction = await networkProvider.getTransaction("532087e5021c9ab8be8a4db5ad843cfe0610761f6334d9693b3765992fd05f67");
const event = transaction.contractResults.items[0].logs.findFirstOrNoneEvent(eventIdentifier);
const outcome = resultsParser.parseEvent(event, eventDefinition);
console.log(JSON.stringify(outcome, null, 4));
```
## Explicit decoding / encoding of values

### Decoding a custom type

Example of decoding a custom type (a structure) called `DepositEvent` from binary data:

```
import { AbiRegistry, BinaryCodec } from "@multiversx/sdk-core";
import { promises } from "fs";

const abiJson = await promises.readFile("../contracts/example.abi.json", { encoding: "utf8" });
const abiObj = JSON.parse(abiJson);
const abiRegistry = AbiRegistry.create(abiObj);
const depositCustomType = abiRegistry.getCustomType("DepositEvent");
const codec = new BinaryCodec();
let data = Buffer.from("00000000000003db000000", "hex");
let decoded = codec.decodeTopLevel(data, depositCustomType);
let decodedValue = decoded.valueOf();

console.log(JSON.stringify(decodedValue, null, 4));
```

Example of decoding a custom type (a structure) called `Reward` from binary data:

```
const rewardStructType = abiRegistry.getStruct("Reward");
data = Buffer.from("010000000445474c440000000201f400000000000003e80000000000000000", "hex");

[decoded] = codec.decodeNested(data, rewardStructType);
decodedValue = decoded.valueOf();
console.log(JSON.stringify(decodedValue, null, 4));
```
## Signing objects

:::note
For **dApps**, use the available **[signing providers](/sdk-and-tools/sdk-js/sdk-js-signing-providers)** instead.
:::

Creating a `UserSigner` from a JSON wallet:

```
import { UserSigner } from "@multiversx/sdk-wallet";
import { promises } from "fs";

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
let signer = UserSigner.fromWallet(walletObject, "password");
```

Creating a `UserSigner` from a PEM file:

```
const pemText = await promises.readFile("../testwallets/alice.pem", { encoding: "utf8" });
signer = UserSigner.fromPem(pemText);
```

Signing a transaction:

```
import { Transaction } from "@multiversx/sdk-core";

const transaction = new Transaction({
    gasLimit: 50000,
    gasPrice: 1000000000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    chainID: "D",
    version: 1
});

const serializedTransaction = transaction.serializeForSigning();
const transactionSignature = await signer.sign(serializedTransaction);
transaction.applySignature(transactionSignature);

console.log("Transaction signature", transaction.getSignature().toString("hex"));
console.log("Transaction hash", transaction.getHash().toString());
```

Signing an arbitrary message:

```
import { SignableMessage } from "@multiversx/sdk-core";

let message = new SignableMessage({
    message: Buffer.from("hello")
});

let serializedMessage = message.serializeForSigning();
let messageSignature = await signer.sign(serializedMessage);
message.applySignature(messageSignature);

console.log("Message signature", message.getSignature().toString("hex"));
```

## Verifying signatures

Creating a `UserVerifier`:

```
import { UserVerifier } from "@multiversx/sdk-wallet";

const aliceVerifier = UserVerifier.fromAddress(addressOfAlice);
const bobVerifier = UserVerifier.fromAddress(addressOfBob);
```

Suppose we have the following transaction:

```
const tx = Transaction.fromPlainObject({
    nonce: 42,
    value: "12345",
    sender: addressOfAlice.bech32(),
    receiver: addressOfBob.bech32(),
    gasPrice: 1000000000,
    gasLimit: 50000,
    chainID: "D",
    version: 1,
    signature: "3c5eb2d1c9b3ab2f578541e62dcfa5008976d11f85644a48884a8a6c4d2980fa14954ab2924d6e67c051562488096d2e79cd3c0378edf234a52e648e672d1b0a"
});

const serializedTx = tx.serializeForSigning();
const txSignature = tx.getSignature();
```

And / or the following message and signature:

```
message = new SignableMessage({ message: Buffer.from("hello") });
serializedMessage = message.serializeForSigning();
messageSignature = Buffer.from("561bc58f1dc6b10de208b2d2c22c9a474ea5e8cabb59c3d3ce06bbda21cc46454aa71a85d5a60442bd7784effa2e062fcb8fb421c521f898abf7f5ec165e5d0f", "hex");
```

We can verify their signatures as follows:

```
console.log("Is signature of Alice?", aliceVerifier.verify(serializedTx, txSignature));
console.log("Is signature of Alice?", aliceVerifier.verify(serializedMessage, messageSignature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedTx, txSignature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedMessage, messageSignature));
```
