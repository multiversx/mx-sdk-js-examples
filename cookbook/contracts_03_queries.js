import { ApiNetworkProvider } from "@multiversx/sdk-network-providers"; // md-ignore
import { addressOfFirstDevnetDelegator, legacyDelegationContractAddress } from "./samples.js"; // md-ignore

const networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com"); // md-ignore

// ## Contract queries

// ### When the ABI is not available

// ```
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
// ```

// ### Using `Interaction`, when the ABI is available

// Prepare the interaction, check it, then build the query:

// ```
legacyDelegationContract = new SmartContract({
    address: legacyDelegationContractAddress,
    abi: legacyDelegationAbi
});

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
// let firstValueAsStruct = <Struct>firstValue;
// ```
