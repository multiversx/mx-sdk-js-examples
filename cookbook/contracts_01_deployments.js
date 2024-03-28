import { AbiRegistry } from "@multiversx/sdk-core"; // md-ignore
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore
import { addressOfAlice } from "./samples.js"; // md-ignore

const networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com"); // md-ignore

let abiJson = await promises.readFile("../contracts/adder.abi.json", { encoding: "utf8" }); // md-ignore
let abiObj = JSON.parse(abiJson); // md-ignore
let abi = AbiRegistry.create(abiObj); // md-ignore

// ## Contract deployments

// ### Load the bytecode from a file

// ```
import { Code } from "@multiversx/sdk-core";
import { promises } from "fs";

const codeBuffer = await promises.readFile("../contracts/adder.wasm");
const code = Code.fromBuffer(codeBuffer);
// ```

// ### Perform a contract deployment

// In `sdk-core v13`, the recommended way to create transactions for deploying
// (and, for that matter, upgrading and interacting with) 
// smart contracts is through a `SmartContractTransactionsFactory`.

// The older (legacy) approach, using the method `SmartContract.deploy()`, is still available, however. 
// At some point in the future, `SmartContract.deploy()` will be deprecated and removed.

// Now, let's create a `SmartContractTransactionsFactory`:

// ```
import { SmartContractTransactionsFactory, TokenComputer, TransactionsFactoryConfig } from "@multiversx/sdk-core";

const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

let factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    tokenComputer: new TokenComputer()
});
// ```

// If the contract ABI is available, provide it to the factory:

// ```
factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: abi,
    tokenComputer: new TokenComputer(),
});
// ```

// Now, prepare the deploy transaction:

// ```
import { U32Value } from "@multiversx/sdk-core";

// For deploy arguments, use `TypedValue` objects if you haven't provided an ABI to the factory:
let args = [new U32Value(42)]
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory:
args = [42];

const deployTransaction = factory.createTransactionForDeploy({
    sender: addressOfAlice,
    bytecode: code.valueOf(),
    gasLimit: 6000000n,
    args: args,
});
// ```

// :::tip
// When creating transactions using `SmartContractTransactionsFactory`, even if the ABI is available and provided,
// you can still use `TypedValue` objects as arguments for deployments and interactions.
//
// Even further, you can use mix `TypedValue` objects with plain JavaScript values and objects. E.g.
// ```
// let args = [new U32Value(42), "hello", { foo: "bar" }, new TokenIdentifierValue("TEST-abcdef")];
// ```
// :::

// Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand). 

// ```
import { Account } from "@multiversx/sdk-core"; // md-ignore

const deployer = new Account(addressOfAlice);
const deployerOnNetwork = await networkProvider.getAccount(addressOfAlice);
deployer.update(deployerOnNetwork);

deployTransaction.nonce = deployer.getNonceThenIncrement();
// ```

// Now, **sign the transaction** using a wallet / signing provider of your choice.

// md:insert:forSimplicityWeUseUserSigner

import { TransactionComputer } from "@multiversx/sdk-core"; // md-ignore
import { UserSigner } from "@multiversx/sdk-wallet"; // md-ignore

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(deployTransaction);

deployTransaction.signature = await signer.sign(serializedTx);

// Once you know the sender address and nonce for your deployment transaction, you can (deterministically) compute the (upcoming) address of the contract:

// ```
import { SmartContract } from "@multiversx/sdk-core"; // md-ignore

const contractAddress = SmartContract.computeAddress(deployTransaction.getSender(), deployTransaction.getNonce());
console.log("Contract address:", contractAddress.bech32());
// ```

// Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

// ```
import { TransactionWatcher } from "@multiversx/sdk-core"; // md-ignore

const txHash = await networkProvider.sendTransaction(deployTransaction);
let transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(txHash);
// ```

// In the end, parse the results:

// ```
import { ResultsParser } from "@multiversx/sdk-core";

let { returnCode } = new ResultsParser().parseUntypedOutcome(transactionOnNetwork);
console.log("Return code:", returnCode);
// ```
