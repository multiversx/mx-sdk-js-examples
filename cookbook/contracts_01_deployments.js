import { ApiNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore
import { addressOfAlice } from "./samples.js"; // md-ignore

const networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com"); // md-ignore

// ## Contract deployments

// ### Load the bytecode from a file

// ```
import { Code } from "@multiversx/sdk-core";
import { promises } from "fs";

let buffer = await promises.readFile("../contracts/counter.wasm");
let code = Code.fromBuffer(buffer);
// ```

// ### Load the bytecode from an URL

// ```
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
// ```

// ### Perform a contract deployment

// Create a `SmartContract` object:

// ```
import { SmartContract } from "@multiversx/sdk-core";

let contract = new SmartContract();
// ```

// Prepare the deploy transaction:

// ```
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
// ```

// Then, set the transaction nonce.

// Note that the account nonce must be synchronized beforehand. 
// Also, locally increment the nonce of the deployer (optional).

// ```
import { Account } from "@multiversx/sdk-core";

const deployer = new Account(deployerAddress);
const deployerOnNetwork = await networkProvider.getAccount(deployerAddress);
deployer.update(deployerOnNetwork);

deployTransaction.setNonce(deployer.getNonceThenIncrement());
// ```

// Then **sign the transaction** using a wallet / signing provider of your choice (not shown here).

import { UserSigner } from "@multiversx/sdk-wallet"; // md-ignore

const pemText = await promises.readFile("../testwallets/alice.pem", { encoding: "utf8" }); // md-ignore
const signer = UserSigner.fromPem(pemText); // md-ignore
const signature = await signer.sign(deployTransaction.serializeForSigning()); // md-ignore
deployTransaction.applySignature(signature); // md-ignore

// Upon signing, you would usually compute the contract address (deterministically computable), as follows:

// ```
let contractAddress = SmartContract.computeAddress(deployTransaction.getSender(), deployTransaction.getNonce());
console.log("Contract address:", contractAddress.bech32());
// ```

// In order to broadcast the transaction and await its completion, use a network provider and a transaction watcher:

// ```
import { TransactionWatcher } from "@multiversx/sdk-core";

await networkProvider.sendTransaction(deployTransaction);
let transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(deployTransaction);
// ```

// In the end, parse the results:

// ```
import { ResultsParser } from "@multiversx/sdk-core";

let { returnCode } = new ResultsParser().parseUntypedOutcome(transactionOnNetwork);
console.log("Return code:", returnCode);
// ```
