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
import { Address, CodeMetadata } from "@multiversx/sdk-core";

let transaction = contract.deploy({
    deployer: Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    code: code,
    codeMetadata: new CodeMetadata(/* set the parameters accordingly */),
    initArguments: [/* set the initial arguments, if any */],
    gasLimit: 20000000,
    chainID: "D"
});
// ```

// Then, set the transaction nonce.

// Note that the account nonce must be synchronized beforehand.Also, locally increment the nonce of the deployer(optional).

// ```
transaction.setNonce(deployer.getNonceThenIncrement());
// ```

// Then sign the transaction using a wallet / signing provider of your choice.Upon signing, you would usually compute the contract address(deterministically computable), as follows:

// ```
let contractAddress = SmartContract.computeAddress(transaction.getSender(), transaction.getNonce());
// ```

// In order to broadcast the transaction and await its completion, use a network provider and a transaction watcher:
