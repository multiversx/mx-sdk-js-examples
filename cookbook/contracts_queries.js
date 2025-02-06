import { apiNetworkProvider, loadAbi } from "./framework.js"; // md-ignore

const abi = await loadAbi("../contracts/adder.abi.json"); // md-ignore

// ## Contract queries

// In order to perform Smart Contract queries, we recommend the use of `class:SmartContractQueriesController`. 
// The legacy approaches that rely on `func:SmartContract.createQuery()` or `func:Interaction.buildQuery()` are still available, but they will be deprecated in the (distant) future.

// You will notice that the `class:SmartContractQueriesController` requires a `QueryRunner` object at initialization.
// A `NetworkProvider`, slighly adapted, is used to satisfy this requirement.

// ```js
import { QueryRunnerAdapter, SmartContractQueriesController } from "@multiversx/sdk-core";

const queryRunner = new QueryRunnerAdapter({
    networkProvider: apiNetworkProvider
});

let controller = new SmartContractQueriesController({
    queryRunner: queryRunner
});
// ```

// If the contract ABI is available, provide it to the controller:

// ```js
controller = new SmartContractQueriesController({
    queryRunner: queryRunner,
    abi: abi
});
// ```

// Let's create a query object:

// ```js
const query = controller.createQuery({
    contract: "erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60",
    function: "getSum",
    arguments: [],
});
// ```

// Then, run the query against the network. You will get a `class:SmartContractQueryResponse` object.

// ```js
const response = await controller.runQuery(query);
// ```

// :::tip
// The invocation of `controller.runQuery()` ultimately calls the VM query endpoints of the MultiversX REST API.
// :::

// The response object contains the raw output of the query, which can be parsed as follows:

// ```js
const [sum] = controller.parseQueryResponse(response);
console.log(sum);
// ```
