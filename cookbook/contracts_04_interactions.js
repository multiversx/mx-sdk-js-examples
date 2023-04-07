import { ApiNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore
import { addressOfAlice, addressOfCarol } from "./samples.js"; // md-ignore

const networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com"); // md-ignore

// ## Contract interactions

// ### When the ABI is not available

// ```
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
// ```

// Then, sign, broadcast `tx` and wait for its completion.

// ### Using `Interaction`, when the ABI is not available

// ```
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
// ```

// Then, sign, broadcast `tx` and wait for its completion.

// ### Using `Interaction`, when the ABI is available

// ```
import { AbiRegistry } from "@multiversx/sdk-core";

const abiRegistry = AbiRegistry.create({
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
// ```

// ### Transfer & execute

// Given an interaction:

// ```
interaction = contract.methods.foobar([]);
// ```

// One can apply token transfers to the smart contract call, as well.

// For single payments, do as follows:

// ```
// Fungible token // md-as-comment
interaction.withSingleESDTTransfer(TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18));

// Non-fungible token // md-as-comment
interaction.withSingleESDTNFTTransfer(TokenTransfer.nonFungible("SDKJS-38f249", 1));
// ```

// For multiple payments:

// ```
interaction.withMultiESDTNFTTransfer([
    TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18),
    TokenTransfer.nonFungible("SDKJS-38f249", 1)
]);
// ```

// ## Parsing contract results

// :::important
// When the default `ResultsParser` misbehaves, please open an issue [on GitHub](https://github.com/multiversx/mx-sdk-js-core/issues), and also provide as many details as possible about the unparsable results (e.g. provide a dump of the transaction object if possible - make sure to remove any sensitive information).
// :::

// ### When the ABI is not available

// ```
import { ResultsParser } from "@multiversx/sdk-core";

let resultsParser = new ResultsParser();
let txHash = "d415901a9c88e564adf25b71b724b936b1274a2ad03e30752fdc79235af8ea3e";
let transactionOnNetwork = await networkProvider.getTransaction(txHash);
let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);

console.log(untypedBundle.returnCode, untypedBundle.values.length);
// ```

// ### When the ABI is available

// ```
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
// ```

// Above, `endpointDefinition` is manually constructed. 
// However, in practice, it can be obtained from the `Interaction` object, if available in the context:

// ```
endpointDefinition = interaction.getEndpoint();
// ```

// Alternatively, the `endpointDefinition` can also be obtained from the `SmartContract` object:

// ```
// let endpointDefinition = smartContract.getEndpoint("myFunction");
// ```

// For customizing the default parser, also see [extending sdk-js](/sdk-and-tools/sdk-js/extending-sdk-js).
