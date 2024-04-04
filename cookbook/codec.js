import { loadAbi } from "./framework.js"; // md-ignore

const abi = await loadAbi("../contracts/example.abi.json"); // md-ignore
const abiMultisig = await loadAbi("../contracts/multisig-full.abi.json"); // md-ignore

// ## Explicit decoding / encoding of values

// When needed, you can use the `class:BinaryCodec` to [decode and encode values](https://docs.multiversx.com/developers/data/serialization-overview/) manually.

// ### Decoding a custom type

// Example of decoding a custom type (a structure) called `DepositEvent` from binary data:

// ```
import { BinaryCodec } from "@multiversx/sdk-core";

const depositCustomType = abi.getCustomType("DepositEvent");
const codec = new BinaryCodec();
let data = Buffer.from("00000000000003db000000", "hex");
let decoded = codec.decodeTopLevel(data, depositCustomType);
let decodedValue = decoded.valueOf();

console.log(JSON.stringify(decodedValue, null, 4));
// ```

// Example of decoding a custom type (a structure) called `Reward` from binary data:

// ```
const rewardStructType = abi.getStruct("Reward");
data = Buffer.from("010000000445474c440000000201f400000000000003e80000000000000000", "hex");

[decoded] = codec.decodeNested(data, rewardStructType);
decodedValue = decoded.valueOf();
console.log(JSON.stringify(decodedValue, null, 4));
// ```

// Example of decoding a custom type (an enum) called `Action` (of [**multisig**](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract) from binary data:

// ```
const actionStructType = abiMultisig.getEnum("Action");
data = Buffer.from("0500000000000000000500d006f73c4221216fa679bc559005584c4f1160e569e1000000012a0000000003616464000000010000000107", "hex");

[decoded] = codec.decodeNested(data, actionStructType);
decodedValue = decoded.valueOf();
console.log(JSON.stringify(decodedValue, null, 4));
// ```

// ### Encoding a custom type

// Example of encoding a custom type (a struct) called `EsdtTokenPayment` (of [**multisig**](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract) into binary data:

// ```
import { BigUIntValue, Field, Struct, TokenIdentifierValue, U64Value } from "@multiversx/sdk-core";

const paymentType = abiMultisig.getStruct("EsdtTokenPayment");

const paymentStruct = new Struct(paymentType, [
    new Field(new TokenIdentifierValue("TEST-8b028f"), "token_identifier"),
    new Field(new U64Value(0n), "token_nonce"),
    new Field(new BigUIntValue(10000n), "amount")
]);

const encoded = codec.encodeNested(paymentStruct);

console.log(encoded.toString("hex"));
// ```
