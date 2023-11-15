// ## Explicit decoding / encoding of values

// ### Decoding a custom type

// Example of decoding a custom type (a structure) called `DepositEvent` from binary data:

// ```
import { AbiRegistry, BinaryCodec } from "@multiversx/sdk-core";
import { promises } from "fs";

const abiJson = await promises.readFile("../contracts/example.abi.json", { encoding: "utf8" });
const abiObj = JSON.parse(abiJson);
const abiRegistry = AbiRegistry.create(abiObj);
const depositCustomType = abiRegistry.getCustomType("DepositEvent");
const codec = new BinaryCodec();
let data = Buffer.from("00000000000003db000000", "hex");
let decoded = codec.decodeTopLevel(data, depositCustomType);
let decodedValue = decoded.valueOf();

console.log(JSON.stringify(decodedValue, null, 4));
// ```

// Example of decoding a custom type (a structure) called `Reward` from binary data:

// ```
const rewardStructType = abiRegistry.getStruct("Reward");
data = Buffer.from("010000000445474c440000000201f400000000000003e80000000000000000", "hex");

[decoded] = codec.decodeNested(data, rewardStructType);
decodedValue = decoded.valueOf();
console.log(JSON.stringify(decodedValue, null, 4));
// ```
