import { AbiRegistry, BinaryCodec } from "@multiversx/sdk-core";
import * as fs from "fs";
import minimist from "minimist";
import { homedir } from "os";

async function main() {
    const argv = minimist(process.argv.slice(2));
    const abiPath = asUserPath(argv.abi);
    const type = argv.type;
    const encodedData = argv.data;

    if (!abiPath) {
        throw new Error("Missing parameter 'abi'! E.g. --abi=~/example.abi.json");
    }
    if (!fs.existsSync(abiPath)) {
        throw new Error(`File not found: ${abiPath}`);
    }
    if (!type) {
        throw new Error("Missing parameter 'type'! E.g. --type=DepositEvent");
    }
    if (!encodedData) {
        throw new Error("Missing parameter 'data'! E.g. --data=00000000000003db000000");
    }

    const abiContent = fs.readFileSync(abiPath, { encoding: "utf8" });
    const abiObj = JSON.parse(abiContent);
    const abiRegistry = AbiRegistry.create(abiObj);
    const data = Buffer.from(encodedData, "hex");

    const customType = abiRegistry.customTypes.find((e) => e.getName() == type);
    if (!customType) {
        throw new Error(`Custom type not found: ${type}`);
    }

    const codec = new BinaryCodec();
    const decoded = codec.decodeTopLevel(data, customType);
    const decodedValue = decoded.valueOf();

    console.log(JSON.stringify(decodedValue, null, 4));
}

function asUserPath(userPath) {
    return (userPath || "").toString().replace("~", homedir);
}

async function doMain() {
    try {
        await main();
    } catch (error) {
        console.error("Error:");
        console.error(error.message);
        process.exit(1);
    }
}

await doMain();
