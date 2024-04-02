// ## Contract ABIs

// A contract's ABI describes the endpoints, data structure and events that a contract exposes.
// While contract interactions are possible without the ABI, they are easier to implement when the definitions are available.

// ### Load the ABI from a file

// ```
import { AbiRegistry } from "@multiversx/sdk-core";
import { promises } from "fs";

let abiJson = await promises.readFile("../contracts/adder.abi.json", { encoding: "utf8" });
let abiObj = JSON.parse(abiJson);
let abi = AbiRegistry.create(abiObj);
// ```

// ### Load the ABI from an URL

// ```
import axios from "axios";

const response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.abi.json");
abi = AbiRegistry.create(response.data);
// ```

// ### Manually construct the ABI

// If an ABI file isn't directly available, but you do have knowledge of the contract's endpoints and types, you can manually construct the ABI. Let's see a simple example:

// ```
abi = AbiRegistry.create({
    "endpoints": [{
        "name": "add",
        "inputs": [],
        "outputs": []
    }]
});
// ```

// An endpoint with both inputs and outputs:

abi = AbiRegistry.create({
    "endpoints": [
        {
            "name": "foo",
            "inputs": [
                { "type": "BigUint" },
                { "type": "u32" },
                { "type": "Address" }
            ],
            "outputs": [
                { "type": "u32" }
            ]
        },
        {
            "name": "bar",
            "inputs": [
                { "type": "counted-variadic<utf-8 string>" },
                { "type": "variadic<u64>" }
            ],
            "outputs": []
        }
    ]
});

