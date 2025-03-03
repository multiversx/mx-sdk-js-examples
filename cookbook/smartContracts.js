import { AbiRegistry, Account, Address, AddressComputer, BigUIntValue, Code, DevnetEntrypoint, SmartContractTransactionsOutcomeParser, U32Value } from "@multiversx/sdk-core";
import axios from "axios";
import { promises } from "fs";
import path from 'path';
// ## Smart Contracts

// Contract ABIs

// A contract's ABI (Application Binary Interface) describes the endpoints, data structures, and events that the contract exposes. 
// While interactions with the contract are possible without the ABI, they are much easier to implement when the definitions are available.

// Loading the ABI from a file
// ```js
{
  let abiJson = await promises.readFile( "../contracts/adder.abi.json", { encoding: "utf8" } );
  let abiObj = JSON.parse( abiJson );
  let abi = AbiRegistry.create( abiObj );
}
// ```

// Loading the ABI from an URL

// ```js
{
  const response = await axios.get( "https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/adder.abi.json" );
  abi = AbiRegistry.create( response.data );
}
// ```

// Manually construct the ABI

// If an ABI file isn’t available, but you know the contract’s endpoints and data types, you can manually construct the ABI.

// ```js
{
  abi = AbiRegistry.create( {
    "endpoints": [ {
      "name": "add",
      "inputs": [],
      "outputs": []
    } ]
  } );
}
// ```

// ```js
{
  abi = AbiRegistry.create( {
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
  } );
}
// ```

// ## Smart Contract deployments
// For creating smart contract deployment transactions, we have two options: a controller and a factory. Both function similarly to the ones used for token transfers.
// When creating transactions that interact with smart contracts, it's recommended to provide the ABI file to the controller or factory if possible. 
// This allows arguments to be passed as native Javascript values. If the ABI is not available, but we know the expected data types, we can pass arguments as typed values (e.g., `BigUIntValue`, `ListValue`, `StructValue`, etc.) or as raw bytes.

// # Deploying a Smart Contract Using the Controller

// ```js
{
  const filePath = path.join( "src", "testdata", "testwallets", "alice.pem" );
  const sender = await Account.newFromPem( filePath );
  const entrypoint = new DevnetEntrypoint();

  // the developer is responsible for managing the nonce
  sender.nonce = await entrypoint.recallAccountNonce( sender.address );

  // load the contract bytecode
  const codeBuffer = await promises.readFile( "../contracts/adder.wasm" );
  const code = Code.fromBuffer( codeBuffer );
  // load the abi file
  abi = await loadAbiRegistry( "src/testdata/adder.abi.json" );

  const controller = entrypoint.createSmartContractController( abi );

  // For deploy arguments, use "TypedValue" objects if you haven't provided an ABI to the factory: // md-as-comment
  let args = [ new U32Value( 42 ) ];
  // Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
  args = [ 42 ];

  const deployTransaction = await controller.createTransactionForDeploy(
    sender,
    sender.getNonceThenIncrement(),
    {
      bytecode: code.valueOf(),
      gasLimit: 6000000n,
      arguments: args,
    },
  );

  // broadcasting the transaction
  const txHash = await entrypoint.sendTransaction( deployTransaction );
}
// ```

// md-insert:mixedTypedValuesAndNativeValues

// # Parsing contract deployment transactions

// ```js
{
  // We use the transaction hash we got when broadcasting the transaction
  const outcome = await controller.awaitCompletedDeploy( txHash ); // waits for transaction completion and parses the result
  const contractAddress = outcome.contracts[ 0 ].address;
}
// ```

// If we want to wait for transaction completion and parse the result in two different steps, we can do as follows:

// ```js
{
  // We use the transaction hash we got when broadcasting the transaction
  // If we want to wait for transaction completion and parse the result in two different steps, we can do as follows:
  const transactionOnNetwork = await controller.awaitTransactionCompleted( txHash );

  // parsing the transaction
  const outcome = await controller.parseDeploy( transactionOnNetwork );
}
// ```

// ### Computing the contract address

// Even before broadcasting, at the moment you know the sender's address and the nonce for your deployment transaction, you can (deterministically) compute the (upcoming) address of the smart contract:

// ```js
{
  const addressComputer = new AddressComputer();
  const contractAddress = addressComputer.computeContractAddress(
    deployTransaction.sender,
    deployTransaction.nonce
  );

  console.log( "Contract address:", contractAddress.toBech32() );
}
// ```

// ## Deploying a smart contract using the factory
// After the transaction is created the nonce needs to be properly set and the transaction should be signed before broadcasting it.

// ```js
{
  const abiJson = await promises.readFile( "../contracts/adder.abi.json", { encoding: "utf8" } );
  const abiObj = JSON.parse( abiJson );
  const abi = AbiRegistry.create( abiObj );

  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createTransfersTransactionsFactory();

  // load the contract bytecode
  const codeBuffer = await promises.readFile( "../contracts/adder.wasm" );
  const code = Code.fromBuffer( codeBuffer );

  // For deploy arguments, use "TypedValue" objects if you haven't provided an ABI to the factory: // md-as-comment
  let args = [ new BigUIntValue( 42 ) ];
  // Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
  args = [ 42 ];

  const filePath = path.join( "src", "testdata", "testwallets", "alice.pem" );
  const alice = await Account.newFromPem( filePath );

  const deployTransaction = await factory.createTransactionForDeploy(
    sender,
    {
      bytecode: code.valueOf(),
      gasLimit: 6000000n,
      arguments: args,
    },
  );

  // the developer is responsible for managing the nonce
  alice.nonce = await entrypoint.recallAccountNonce( sender.address );

  // set the nonce
  deployTransaction.nonce = alice.nonce;

  // sign the transaction
  deployTransaction.signature = alice.signTransaction( transaction );

  // broadcasting the transaction
  const txHash = await entrypoint.sendTransaction( deployTransaction );

  // waiting for transaction to complete 
  const transactionOnNetwork = await entrypoint.awaitTransactionCompleted( txHash );

  // parsing transaction
  const parser = new SmartContractTransactionsOutcomeParser();
  const parsedOutcome = parser.parseDeploy( transactionOnNetwork );
  const contractAddress = parsedOutcome.contracts[ 0 ].address;

  console.log( contractAddress );
}
// ```

// ### Smart Contract calls

// In this section we'll see how we can call an endpoint of our previously deployed smart contract using both approaches with the `controller` and the `factory`.

// **Calling a smart contract using the controller**

// ```js
{
  const filePath = path.join( "src", "testdata", "testwallets", "alice.pem" );
  const sender = await Account.newFromPem( filePath );

  // the developer is responsible for managing the nonce
  sender.nonce = await entrypoint.recallAccountNonce( sender.address );

  // load the contract bytecode
  const codeBuffer = await promises.readFile( "../contracts/adder.wasm" );
  const code = Code.fromBuffer( codeBuffer );
  // load the abi file
  abi = await loadAbiRegistry( "src/testdata/adder.abi.json" );

  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createSmartContractController( abi );

  const contractAddress = Address.newFromBech32( "erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug" );

  // For deploy arguments, use "TypedValue" objects if you haven't provided an ABI to the factory: // md-as-comment
  let args = [ new U32Value( 42 ) ];
  // Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
  args = [ 42 ];

  const transaction = await controller.createTransactionForExecute(
    sender,
    sender.getNonceThenIncrement(),
    {
      contract: contractAddress,
      gasLimit: 5000000n,
      function: "add",
      arguments: args,
    },
  );

  // broadcasting the transaction
  const txHash = await entrypoint.sendTransaction( transaction );

  console.log( txHash );
}
// ```

// **Parsing smart contract call transactions**
// In our case, calling the add endpoint does not return anything, but similar to the example above, we could parse this transaction to get the output values of a smart contract call.

// ```js
// waits for transaction completion and parses the result
{
  const parsedOutcome = controller.awaitCompletedExecute( transactionOnNetwork );
  const values = parsedOutcome.contracts.values;
}
// ```

// ## **Calling a smart contract and sending tokens (transfer & execute)**
// Additionally, if an endpoint requires a payment when called, we can send tokens to the contract while creating a smart contract call transaction. 
// Both EGLD and ESDT tokens or a combination of both can be sent. This functionality is supported by both the controller and the factory.

// ```js
{
  const filePath = path.join( "src", "testdata", "testwallets", "alice.pem" );
  const sender = await Account.newFromPem( filePath );

  // the developer is responsible for managing the nonce
  sender.nonce = await entrypoint.recallAccountNonce( sender.address );

  // load the contract bytecode
  const codeBuffer = await promises.readFile( "../contracts/adder.wasm" );
  const code = Code.fromBuffer( codeBuffer );

  // load the abi file
  abi = await loadAbiRegistry( "src/testdata/adder.abi.json" );

  // get the smart contracts controller
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createSmartContractController( abi );

  const contractAddress = Address.newFromBech32( "erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug" );

  // For deploy arguments, use "TypedValue" objects if you haven't provided an ABI to the factory: // md-as-comment
  let args = [ new U32Value( 42 ) ];
  // Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
  args = [ 42 ];

  // creating the transfers
  const firstToken = new Token( { identifier: "TEST-38f249", nonce: 10 } );
  const firstTransfer = new TokenTransfer( { token: firstToken, amount: 1n } );

  const secondToken = new Token( { identifier: "BAR-c80d29" } );
  const secondTransfer = new TokenTransfer( { token: secondToken, amount: 10000000000000000000n } );

  const transaction = await controller.createTransactionForExecute(
    sender,
    sender.getNonceThenIncrement(),
    {
      contract: contractAddress,
      gasLimit: 5000000n,
      function: "add",
      arguments: args,
      nativeTransferAmount: 1000000000000000000n,
      tokenTransfers: [ firstTransfer, secondTransfer ]
    },
  );

  // broadcasting the transaction
  const txHash = await entrypoint.sendTransaction( transaction );

  console.log( txHash );
}
// ```

// ## **Calling a smart contract using the factory**
// Let's create the same smart contract call transaction, but using the `factory`.

// ```js
{
  const filePath = path.join( "src", "testdata", "testwallets", "alice.pem" );
  const sender = await Account.newFromPem( filePath );

  // the developer is responsible for managing the nonce
  sender.nonce = await entrypoint.recallAccountNonce( sender.address );

  // load the contract bytecode
  const codeBuffer = await promises.readFile( "../contracts/adder.wasm" );
  const code = Code.fromBuffer( codeBuffer );

  // load the abi file
  abi = await loadAbiRegistry( "src/testdata/adder.abi.json" );

  // get the smart contracts controller
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createSmartContractTransactionsFactory( abi );

  const contractAddress = Address.newFromBech32( "erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug" );

  // For deploy arguments, use "TypedValue" objects if you haven't provided an ABI to the factory: // md-as-comment
  let args = [ new U32Value( 42 ) ];
  // Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory: // md-as-comment
  args = [ 42 ];

  // creating the transfers
  const firstToken = new Token( { identifier: "TEST-38f249", nonce: 10 } );
  const firstTransfer = new TokenTransfer( { token: firstToken, amount: 1n } );

  const secondToken = new Token( { identifier: "BAR-c80d29" } );
  const secondTransfer = new TokenTransfer( { token: secondToken, amount: 10000000000000000000n } );

  const transaction = await controller.createTransactionForExecute(
    sender,
    {
      contract: contractAddress,
      gasLimit: 5000000n,
      function: "add",
      arguments: args,
      nativeTransferAmount: 1000000000000000000n,
      tokenTransfers: [ firstTransfer, secondTransfer ]
    },
  );

  transaction.nonce = sender.getNonceThenIncrement();
  transaction.signature = sender.signTransaction( transaction );

  // broadcasting the transaction
  const txHash = await entrypoint.sendTransaction( transaction );

  console.log( txHash );
}
// ```

// **Parsing transaction outcome**
// As said before, the `add` endpoint we called does not return anything, but we could parse the outcome of smart contract call transactions, as follows:

// ```js
{
  // load the abi file
  abi = await loadAbiRegistry( "src/testdata/adder.abi.json" );
  const parser = SmartContractTransactionsOutcomeParser( { abi } );
  const transactionOnNetwork = entrypoint.getTransaction( txHash );
  const outcome = parser.parseExecute();
}
// ```

// **Decoding transaction events**
// You might be interested into decoding events emitted by a contract. You can do so by using the `TransactionEventsParser`.

// Suppose we'd like to decode a `startPerformAction` event emitted by the [multisig](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract.

// First, we load the abi file, then we fetch the transaction, we extract the event from the transaction and then we parse it.

// ```js
{
  {
    // load the abi files
    abi = await loadAbiRegistry( "src/testdata/adder.abi.json" );
    const parser = new TransactionEventsParser( { abi } );
    const transactionOnNetwork = entrypoint.getTransaction( txHash );
    const events = gatherAllEvents( transactionOnNetwork );
    const outcome = parser.parseEvents( { events } );
  }
}
// ```