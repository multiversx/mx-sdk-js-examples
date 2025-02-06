import { Address, TransactionComputer, TransactionWatcher, UserSigner } from "@multiversx/sdk-core"; // md-ignore
import { promises } from "fs"; // md-ignore
import { addressOfAlice, apiNetworkProvider, loadAbi, syncAccounts } from "./framework.js"; // md-ignore

const abi = await loadAbi("../contracts/adder.abi.json"); // md-ignore

const { alice: deployer } = await syncAccounts(); // md-ignore

// ## Contract deployments

// ### Load the bytecode from a file

// ```js
import { Code } from "@multiversx/sdk-core";

const codeBuffer = await promises.readFile("../contracts/adder.wasm");
const code = Code.fromBuffer(codeBuffer);
// ```

// ### Perform a contract deployment

// In `sdk-core v13`, the recommended way to create transactions for deploying
// (and, for that matter, upgrading and interacting with)
// smart contracts is through a `class:SmartContractTransactionsFactory`.

// The older (legacy) approach, using the method `func:SmartContract.deploy()`, is still available, however.
// At some point in the future, `func:SmartContract.deploy()` will be deprecated and removed.

// Now, let's create a `class:SmartContractTransactionsFactory`:

// ```js
import { SmartContractTransactionsFactory, TransactionsFactoryConfig } from "@multiversx/sdk-core";

const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

let factory = new SmartContractTransactionsFactory({
    config: factoryConfig
});
// ```

// If the contract ABI is available, provide it to the factory:

// ```js
factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: abi
});
// ```

// Now, prepare the deploy transaction:

// ```js
import { U32Value } from "@multiversx/sdk-core";

// For deploy arguments, use "TypedValue" objects if you haven't provided an ABI to the factory: // md-as-comment
let args = [new U32Value(42)];
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
args = [42];

const deployTransaction = factory.createTransactionForDeploy({
    sender: addressOfAlice,
    bytecode: code.valueOf(),
    gasLimit: 6000000n,
    arguments: args
});
// ```

// md-insert:mixedTypedValuesAndNativeValues

// Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand).

// ```js
deployTransaction.nonce = deployer.getNonceThenIncrement();
// ```

// Now, **sign the transaction** using a wallet / signing provider of your choice.

// md-insert:forSimplicityWeUseUserSigner

// ```js
const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(deployTransaction);

deployTransaction.signature = await signer.sign(serializedTx);
// ```

// Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

// ```js
const txHash = await apiNetworkProvider.sendTransaction(deployTransaction);
const transactionOnNetwork = await new TransactionWatcher(apiNetworkProvider).awaitCompleted(txHash);
// ```

// ### Computing the contract address

// Even before broadcasting, 
// at the moment you know the _sender_ address and the _nonce_ for your deployment transaction, you can (deterministically) compute the (upcoming) address of the contract:

// ```js
import { AddressComputer } from "@multiversx/sdk-core";

const addressComputer = new AddressComputer();
const contractAddress = addressComputer.computeContractAddress(
    Address.fromBech32(deployTransaction.sender),
    deployTransaction.nonce
);

console.log("Contract address:", contractAddress.bech32());
// ```

// ### Parsing transaction outcome

// In the end, you can parse the results using a `class:SmartContractTransactionsOutcomeParser`.
// However, since the `parseDeploy` method requires a `class:TransactionOutcome` object as input,
// we need to first convert our `TransactionOnNetwork` object to a `class:TransactionOutcome`, by means of a `class:TransactionsConverter`.

// ```js
import { SmartContractTransactionsOutcomeParser, TransactionsConverter } from "@multiversx/sdk-core";

const converter = new TransactionsConverter();
const parser = new SmartContractTransactionsOutcomeParser();

const transactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetwork);
const parsedOutcome = parser.parseDeploy({ transactionOutcome });

console.log(parsedOutcome);
// ```
