import { AbiRegistry, ResultsParser } from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import * as fs from "fs";
import minimist from "minimist";
import { homedir } from "os";

async function main() {
    const argv = minimist(process.argv.slice(2));
    const abiPath = asUserPath(argv.abi);
    const eventIdentifier = argv.event;
    const apiUrl = argv.api;
    const transactionHash = argv.tx;

    if (!abiPath) {
        throw new Error("Missing parameter 'abi'! E.g. --abi=~/example.abi.json");
    }
    if (!fs.existsSync(abiPath)) {
        throw new Error(`File not found: ${abiPath}`);
    }
    if (!eventIdentifier) {
        throw new Error("Missing parameter 'event'! E.g. --event=deposit");
    }
    if (!apiUrl) {
        throw new Error("Missing parameter 'api'! E.g. --api=https://testnet-api.multiversx.com");
    }
    if (!transactionHash) {
        throw new Error("Missing parameter 'tx'! E.g. --tx=532087e5021c9ab8be8a4db5ad843cfe0610761f6334d9693b3765992fd05f67");
    }

    const abiContent = fs.readFileSync(abiPath, { encoding: "utf8" });
    const abiObj = JSON.parse(abiContent);
    const abiRegistry = AbiRegistry.create(abiObj);

    const eventDefinition = abiRegistry.getEvent(eventIdentifier);
    const resultsParser = new ResultsParser();

    const provider = new ApiNetworkProvider(apiUrl);
    const transaction = await provider.getTransaction(transactionHash);
    const event = findTransactionEvent(transaction, eventIdentifier);
    if (!event) {
        throw new Error(`Event not found: ${eventIdentifier}`);
    }

    const outcome = resultsParser.parseEvent(event, eventDefinition);
    console.log(JSON.stringify(outcome, null, 4));
}

function asUserPath(userPath) {
    return (userPath || "").toString().replace("~", homedir);
}

function findTransactionEvent(transaction, eventIdentifier) {
    const eventInTransaction = transaction.logs.findFirstOrNoneEvent(eventIdentifier);
    if (eventInTransaction) {
        return eventInTransaction;
    }

    for (const contractResult of transaction.contractResults.items) {
        const eventInContractResult = contractResult.logs.findFirstOrNoneEvent(eventIdentifier);
        if (eventInContractResult) {
            return eventInContractResult;
        }
    }

    return null;
}

async function doMain() {
    try {
        await main();
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

await doMain();
