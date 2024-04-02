import { AbiRegistry } from "@multiversx/sdk-core"; // md-ignore
import { promises } from "fs"; // md-ignore
import { syncAccounts } from "./framework.js"; // md-ignore

let abiJson = await promises.readFile("../contracts/adder.abi.json", { encoding: "utf8" }); // md-ignore
let abiObj = JSON.parse(abiJson); // md-ignore
let abi = AbiRegistry.create(abiObj); // md-ignore

const { alice } = await syncAccounts(); // md-ignore

// ## Contract arguments kata

// Now let's practice a bit more on preparing contract call (or for that matter, contract deploy) arguments.

// Take the example of an endpoint with these inputs:

// ```
endpoint = {
    inputs: [
        { type: "BigUint" },
        { type: "List<Address>" },
        { type: "bytes" },
    ]
}
// ```

// In this case, you would prepare the arguments like this:

// ```
args = []
// ```

// "name": "doSomething",
//             "inputs": [{
//                 "type": "counted-variadic<utf-8 string>"
//             },
//             {
//                 "type": "variadic<u64>"
//             }],

// [
//     // Counted variadic must be explicitly typed 
//     VariadicValue.fromItemsCounted(StringValue.fromUTF8("foo"), StringValue.fromUTF8("bar")),
//     // Regular variadic can be implicitly typed 
//     1, 2, 3
// ])

// If, for any reason, you'd like to convert native JavaScript values to `TypedValue` objects, use the `TypeInference` class:

// ```
// ...
// ```
