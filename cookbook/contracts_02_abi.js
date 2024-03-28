// ## ABI

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
