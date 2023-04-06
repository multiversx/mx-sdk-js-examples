import { ApiNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore

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
import { Address, CodeMetadata } from "@multiversx/sdk-core";

const deployerAddress = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");

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
// import { TransactionWatcher } from "@multiversx/sdk-core"; // md-include

// await networkProvider.sendTransaction(deployTransaction); // md-include
// let transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(deployTransaction); // md-include
// ```

// In the end, parse the results:

// ```
import { ResultsParser } from "@multiversx/sdk-core";

// let { returnCode } = new ResultsParser().parseUntypedOutcome(transactionOnNetwork); // md-include
// console.log("Return code:", returnCode); // md-include
// ```

// ## ABI

// ### Load the ABI from a file

// ```
import { AbiRegistry, SmartContractAbi } from "@multiversx/sdk-core";

let abiJson = await promises.readFile("../contracts/counter.abi.json", { encoding: "utf8" });
let abiObj = JSON.parse(abiJson);
let abiRegistry = AbiRegistry.create(abiObj);
let abi = new SmartContractAbi(abiRegistry);
let existingContractAddress = Address.fromBech32("erd1qqqqqqqqqqqqqpgq5sup58y38q3pwyqklagxmuraetshrqwpd8ssh0ssph");
let existingContract = new SmartContract({ address: existingContractAddress, abi: abi });
// ```

// ### Load the ABI from an URL

// ```
response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.abi.json");
abiRegistry = AbiRegistry.create(response.data);
abi = new SmartContractAbi(abiRegistry);
existingContract = new SmartContract({ address: existingContractAddress, abi: abi });
// ```

// ## Contract queries

// ### When the ABI is not available

// ```
import { AddressValue, BigUIntType, BinaryCodec } from "@multiversx/sdk-core";

const legacyDelegationContractAddress = Address.fromBech32("erd1qqqqqqqqqqqqqpgqp699jngundfqw07d8jzkepucvpzush6k3wvqyc44rx");
let legacyDelegationContract = new SmartContract({ address: legacyDelegationContractAddress });
const addressOfFirstDevnetDelegator = new Address("erd1s0us936aku52uxyvnhxspcaj4f4sp7d9azuyw7kf32ggm88ynlps7c0yr9");

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
// ```

// ### Using `Interaction`, when the ABI is not available

// ```
import { Interaction } from "@multiversx/sdk-core";

let args = [new AddressValue(addressOfFirstDevnetDelegator)];
query = new Interaction(legacyDelegationContract, "getClaimableRewards", args)
    .buildQuery();

let queryResponseFromInteraction = await networkProvider.queryContract(query);

console.assert(JSON.stringify(queryResponseFromInteraction) === JSON.stringify(queryResponse));
// ```

// Then, parse the response as above.

// ### When the ABI is available

// ```
const legacyDelegationAbi = new SmartContractAbi(AbiRegistry.create({
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
}));

const getClaimableRewardsEndpoint = legacyDelegationAbi.getEndpoint("getClaimableRewards");

query = legacyDelegationContract.createQuery({
    func: "getClaimableRewards",
    args: [new AddressValue(addressOfFirstDevnetDelegator)]
});

queryResponse = await networkProvider.queryContract(query);
let { values } = new ResultsParser().parseQueryResponse(queryResponse, getClaimableRewardsEndpoint);
console.log(values[0].valueOf().toFixed(0));
// ```

// ### Using `Interaction`, when the ABI is available

// Prepare the interaction, check it, then build the query:

// ```
legacyDelegationContract = new SmartContract({ address: legacyDelegationContractAddress, abi: legacyDelegationAbi });

let interaction = legacyDelegationContract.methods.getClaimableRewards([addressOfFirstDevnetDelegator]);
query = interaction.check().buildQuery();
// ```

// Then, run the query and parse the results:

// ```
queryResponse = await networkProvider.queryContract(query);
let typedBundle = new ResultsParser().parseQueryResponse(queryResponse, interaction.getEndpoint());
console.log(typedBundle.values[0].valueOf().toFixed(0));
// ```

// Depending on the context, reinterpret (cast) the results:

// ```
// let firstValueAsStruct = <Struct>firstValue; // md-include
// ```
