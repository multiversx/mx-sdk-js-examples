import { AbiRegistry, Address } from "@multiversx/sdk-core"; // md-ignore
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore
import { promises } from "fs"; // md-ignore
import { addressOfAlice } from "./samples.js"; // md-ignore

const networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com"); // md-ignore

let abiJson = await promises.readFile("../contracts/adder.abi.json", { encoding: "utf8" }); // md-ignore
let abiObj = JSON.parse(abiJson); // md-ignore
let abi = AbiRegistry.create(abiObj); // md-ignore

// ## Contract interactions

// In `sdk-core v13`, the recommended way to create transactions for calling
// (and, for that matter, deploying and upgrading) 
// smart contracts is through a `SmartContractTransactionsFactory`.

// The older (legacy) approaches, using `SmartContract.call()`, `SmartContract.methods.myFunction()`, `SmartContract.methodsExplicit.myFunction()` and
// `new Interaction(contract, "myFunction", args)` are still available, however. 
// At some point in the (more distant) future,  they will be deprecated and removed.

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

// Now, let's prepare a contract execute transaction, to call the `add` function of our
// previously deployed smart contract:

// ```
import { U32Value } from "@multiversx/sdk-core";

// For arguments, use `TypedValue` objects if you haven't provided an ABI to the factory: // md-as-comment
let args = [new U32Value(42)]
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
args = [42];

const transaction = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    functionName: "add",
    gasLimit: 5000000,
    args: args
});
// ```

// md-insert:mixedTypedValuesAndNativeValues

// Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand). 

// ```
import { Account } from "@multiversx/sdk-core"; // md-ignore

const caller = new Account(addressOfAlice);
const callerOnNetwork = await networkProvider.getAccount(addressOfAlice);
caller.update(callerOnNetwork);

transaction.nonce = caller.getNonceThenIncrement();
// ```

// Now, **sign the transaction** using a wallet / signing provider of your choice.

// md-insert:forSimplicityWeUseUserSigner

// ```
import { TransactionComputer } from "@multiversx/sdk-core"; // md-ignore
import { UserSigner } from "@multiversx/sdk-wallet"; // md-ignore

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(transaction);

transaction.signature = await signer.sign(serializedTx);
// ```

// Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

// ```
import { TransactionWatcher } from "@multiversx/sdk-core"; // md-ignore

const txHash = await networkProvider.sendTransaction(transaction);
const transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(txHash);
// ```

// ### Transfer & execute

// At times, you may want to send some tokens (native EGLD or ESDT) along with the contract call.

// For transfer & execute with native EGLD, prepare your transaction as follows:

// ```
const transaction = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    functionName: "foobar",
    gasLimit: 5000000,
    args: args,
    nativeTransferAmount: 1000000000000000000n
});
// ```

// Above, we're sending 1 EGLD along with the contract call.

// For transfer & execute with ESDT tokens, prepare your transaction as follows:




// TOKEN_CHOCOLATE="CHOCOLATE-daf625"
// TOKEN_BEER="BEER-b16c6d"



// // For single payments, do as follows:

// // ```
// // Fungible token // md-as-comment
// interaction.withSingleESDTTransfer(TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18));

// // Non-fungible token // md-as-comment
// interaction.withSingleESDTNFTTransfer(TokenTransfer.nonFungible("SDKJS-38f249", 1));
// // ```

// // For multiple payments:

// // ```
// interaction.withMultiESDTNFTTransfer([
//     TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18),
//     TokenTransfer.nonFungible("SDKJS-38f249", 1)
// ]);
// // ```




// // ## Parsing contract results

// // :::important
// // When the default `ResultsParser` misbehaves, please open an issue [on GitHub](https://github.com/multiversx/mx-sdk-js-core/issues), and also provide as many details as possible about the unparsable results (e.g. provide a dump of the transaction object if possible - make sure to remove any sensitive information).
// // :::

// // ### When the ABI is not available

// // ```
// import { ResultsParser } from "@multiversx/sdk-core";

// let resultsParser = new ResultsParser();
// let txHash = "d415901a9c88e564adf25b71b724b936b1274a2ad03e30752fdc79235af8ea3e";
// let transactionOnNetwork = await networkProvider.getTransaction(txHash);
// let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);

// console.log(untypedBundle.returnCode, untypedBundle.values.length);
// // ```

// // ### When the ABI is available

// // ```
// let endpointDefinition = AbiRegistry.create({
//     "name": "counter",
//     "endpoints": [{
//         "name": "increment",
//         "inputs": [],
//         "outputs": [{ "type": "i64" }]
//     }]
// }).getEndpoint("increment");

// transactionOnNetwork = await networkProvider.getTransaction(txHash);
// let typedBundle = resultsParser.parseOutcome(transactionOnNetwork, endpointDefinition);

// console.log(typedBundle.returnCode, typedBundle.values.length);
// // ```

