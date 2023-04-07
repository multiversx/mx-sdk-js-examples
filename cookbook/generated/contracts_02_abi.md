## ABI

### Load the ABI from a file

```
import { AbiRegistry, Address, SmartContract } from "@multiversx/sdk-core";
import { promises } from "fs";

let abiJson = await promises.readFile("../contracts/counter.abi.json", { encoding: "utf8" });
let abiObj = JSON.parse(abiJson);
let abiRegistry = AbiRegistry.create(abiObj);
let existingContractAddress = Address.fromBech32("erd1qqqqqqqqqqqqqpgq5sup58y38q3pwyqklagxmuraetshrqwpd8ssh0ssph");
let existingContract = new SmartContract({ address: existingContractAddress, abi: abiRegistry });
```

### Load the ABI from an URL

```
import axios from "axios";

const response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.abi.json");
abiRegistry = AbiRegistry.create(response.data);
existingContract = new SmartContract({ address: existingContractAddress, abi: abiRegistry });
```