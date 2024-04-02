import { AbiRegistry, Address, Token, TokenTransfer, TransactionComputer, TransactionWatcher } from "@multiversx/sdk-core"; // md-ignore
import { UserSigner } from "@multiversx/sdk-wallet"; // md-ignore
import { promises } from "fs"; // md-ignore
import { addressOfAlice, apiNetworkProvider, syncAccounts } from "./framework.js"; // md-ignore

let abiJson = await promises.readFile("../contracts/adder.abi.json", { encoding: "utf8" }); // md-ignore
let abiObj = JSON.parse(abiJson); // md-ignore
let abi = AbiRegistry.create(abiObj); // md-ignore

const { alice } = await syncAccounts(); // md-ignore

// ## Contract interactions

// In `sdk-core v13`, the recommended way to create transactions for calling
// (and, for that matter, deploying and upgrading)
// smart contracts is through a `SmartContractTransactionsFactory`.

// The older (legacy) approaches, using `SmartContract.call()`, `SmartContract.methods.myFunction()`, `SmartContract.methodsExplicit.myFunction()` and
// `new Interaction(contract, "myFunction", args)` are still available.
// However, at some point in the (more distant) future,  they will be deprecated and removed.

// Now, let's create a `SmartContractTransactionsFactory`:

// ```
import { SmartContractTransactionsFactory, TransactionsFactoryConfig } from "@multiversx/sdk-core";

const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

let factory = new SmartContractTransactionsFactory({
    config: factoryConfig
});
// ```

// If the contract ABI is available, provide it to the factory:

// ```
factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: abi
});
// ```

// ### Regular interactions

// Now, let's prepare a contract transaction, to call the `add` function of our
// previously deployed smart contract:

// ```
import { U32Value } from "@multiversx/sdk-core";

// For arguments, use `TypedValue` objects if you haven't provided an ABI to the factory: // md-as-comment
let args = [new U32Value(42)];
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
args = [42];

const transaction = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args
});
// ```

// md-insert:mixedTypedValuesAndNativeValues

// Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand).

// ```
transaction.nonce = alice.getNonceThenIncrement();
// ```

// Now, **sign the transaction** using a wallet / signing provider of your choice.

// md-insert:forSimplicityWeUseUserSigner

// ```
const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(transaction);

transaction.signature = await signer.sign(serializedTx);
// ```

// Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

// ```
const txHash = await apiNetworkProvider.sendTransaction(transaction);
const transactionOnNetwork = await new TransactionWatcher(apiNetworkProvider).awaitCompleted(txHash);
// ```

// ### Transfer & execute

// At times, you may want to send some tokens (native EGLD or ESDT) along with the contract call.

// For transfer & execute with native EGLD, prepare your transaction as follows:

// ```
const transactionWithNativeTransfer = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args,
    nativeTransferAmount: 1000000000000000000n
});
// ```

// Above, we're sending 1 EGLD along with the contract call.

// For transfer & execute with ESDT tokens, prepare your transaction as follows:

// ```
const transactionWithTokenTransfer = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "UTK-14d57d" }),
            amount: 42000000000000000000n
        })
    ]
});
// ```

// Or, for transferring multiple tokens (NFTs included):

// ```
const transactionWithMultipleTokenTransfers = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "UTK-14d57d" }),
            amount: 42000000000000000000n
        }),
        new TokenTransfer({
            token: new Token({ identifier: "EXAMPLE-453bec", nonce: 3n }),
            amount: 1n
        })
    ]
});
// ```

// Above, we've prepared the `TokenTransfer` objects as seen in the section [token transfers](#token-transfers).

// ### Parsing transaction outcome

// Once a transaction is completed, you can parse the results using a [`SmartContractTransactionsOutcomeParser`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsOutcomeParser.html).
// However, since the `parseExecute` method requires a [`TransactionOutcome`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionOutcome.html) object as input,
// we need to first convert our `TransactionOnNetwork` object to a `TransactionOutcome`, by means of a [`TransactionsConverter`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionsConverter.html).

// md-insert:coreAndNetworkProvidersImpedanceMismatch

// ```
import { SmartContractTransactionsOutcomeParser, TransactionsConverter } from "@multiversx/sdk-core";

const converter = new TransactionsConverter();
const parser = new SmartContractTransactionsOutcomeParser({
    abi: abi
});

const transactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetwork);
const parsedOutcome = parser.parseExecute({ transactionOutcome });

console.log(parsedOutcome);
// ```
