
## Contract events

### Decode transaction events

```
const abiContent = await promises.readFile("../contracts/example.abi.json", { encoding: "utf8" });
const abiObj = JSON.parse(abiContent);
const abiRegistry = AbiRegistry.create(abiObj);
const resultsParser = new ResultsParser();

const eventIdentifier = "deposit";
const eventDefinition = abiRegistry.getEvent(eventIdentifier);
const transaction = await networkProvider.getTransaction("532087e5021c9ab8be8a4db5ad843cfe0610761f6334d9693b3765992fd05f67");
const event = transaction.contractResults.items[0].logs.findFirstOrNoneEvent(eventIdentifier);
const outcome = resultsParser.parseEvent(event, eventDefinition);
console.log(JSON.stringify(outcome, null, 4));
```