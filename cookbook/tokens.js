// ## Token management

// In this section, we're going to create transactions to issue fungible tokens, issue semi-fungible tokens, create NFTs, set token roles, but also parse these transactions to extract their outcome (e.g. get the token identifier of the newly issued token).

// These methods are available through the `TokenManagementController` and the `TokenManagementTransactionsFactory`. The controller also provides built-in methods for awaiting transaction completion and parsing transaction outcomes. 
// For the factory, the same functionality can be achieved using the `TokenManagementTransactionsOutcomeParser`.

// For scripts or quick network interactions, we recommend using the controller. However, for a more granular approach (e.g., DApps), the factory is the better choice.

// Loading the ABI from a file

// ```js
import { Account, DevnetEntrypoint } from "@multiversx/sdk-core";
import path from 'path';

{ // md-ignore
  // create the entrypoint and the token management controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.creatTokenManagementController();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address)

  const transaction = await controller.createTransactionForIssuingFungible(
    alice,
    alice.getNonceThenIncrement(),
    {
      tokenName: "NEWFNG",
      tokenTicker: "FNG",
      initialSupply: 1_000_000_000000n,
      numDecimals: 6n,
      canFreeze: false,
      canWipe: true,
      canPause: false,
      canChangeOwner: true,
      canUpgrade: true,
      canAddSpecialRoles: false,
    },
  );

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  const outcome = await entrypoint.awaitCompletedIssueFungible(txHash);

  const tokenIdentifier = outcome[0].tokenIdentifier

} // md-ignore
// ```

// **Issuing fungible tokens using the factory** 
// ```js
import { TokenManagementTransactionsOutcomeParser } from "@multiversx/sdk-core";
{ // md-ignore
  // create the entrypoint and the token management transactions factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createTokenManagementTransactionsFactory();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const transaction = await factory.createTransactionForIssuingFungible(
    alice,
    {
      tokenName: "NEWFNG",
      tokenTicker: "FNG",
      initialSupply: 1_000_000_000000n,
      numDecimals: 6n,
      canFreeze: false,
      canWipe: true,
      canPause: false,
      canChangeOwner: true,
      canUpgrade: true,
      canAddSpecialRoles: false,
    },
  );
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  // if we know that the transaction is completed, we can simply call `entrypoint.get_transaction(tx_hash)` // md-as-comment
  const transactionOnNetwork = await entrypoint.awaitCompletedTransaction(txHash);

  // extract the token identifier // md-as-comment
  const parser = new TokenManagementTransactionsOutcomeParser()
  const outcome = parser.parseIssueFungible(transactionOnNetwork)
  const tokenIdentifier = outcome[0].tokenIdentifier
} // md-ignore
// ```


//  Setting special roles for fungible tokens using the controller

// ```js
import { Address } from "@multiversx/sdk-core";

{ // md-ignore
  // create the entrypoint and the token management controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.creatTokenManagementController();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const bob = Address.newFromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx");

  const transaction = await controller.createTransactionForSettingSpecialRoleOnFungibleToken(
    alice,
    alice.getNonceThenIncrement(),
    {
      user: bob,
      tokenIdentifier: "TEST-123456",
      addRoleLocalMint: true,
      addRoleLocalBurn: true,
      addRoleESDTTransferRole: true,
    },
  );

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  const outcome = await entrypoint.awaitCompletedSetSpecialRoleOnFungibleToken(transaction);

  const roles = outcome[0].roles
  const user = outcome[0].userAddress
}
// ```

// **Setting special roles for fungible tokens using the factory**
// ```js

{ // md-ignore
  // create the entrypoint and the token management controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createTokenManagementTransactionsFactory();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);
  const bob = Address.newFromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx");

  const transaction = await factory.createTransactionForIssuingFungible(
    alice,
    {
      user: bob,
      tokenIdentifier: "TEST-123456",
      addRoleLocalMint: true,
      addRoleLocalBurn: true,
      addRoleESDTTransferRole: true,
    },
  );
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  // if we know that the transaction is completed, we can simply call `entrypoint.get_transaction(tx_hash)` // md-as-comment
  const transactionOnNetwork = await entrypoint.awaitCompletedTransaction(txHash);

  // extract the token identifier // md-as-comment
  const parser = new TokenManagementTransactionsOutcomeParser()
  const outcome = parser.parseSetSpecialRole(transactionOnNetwork)

  const roles = outcome[0].roles
  const user = outcome[0].userAddress

} // md-ignore
// ```

// **Issuing semi-fungible tokens using the controller**

// ```js

{ // md-ignore
  // create the entrypoint and the token management controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.creatTokenManagementController();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address)

  const transaction = await controller.createTransactionForIssuingSemiFungible(
    alice,
    alice.getNonceThenIncrement(),
    {
      tokenName: "NEWSEMI",
      tokenTicker: "SEMI",
      canFreeze: false,
      canWipe: true,
      canPause: false,
      canTransferNFTCreateRole: true,
      canChangeOwner: true,
      canUpgrade: true,
      canAddSpecialRoles: true,
    },
  );

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  const outcome = await entrypoint.awaitCompletedIssueSemiFungible(txHash);

  const tokenIdentifier = outcome[0].tokenIdentifier;
} // md-ignore
// ```

// **Issuing semi-fungible tokens using the factory**
// ```js

{ // md-ignore
  // create the entrypoint and the token management controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createTokenManagementTransactionsFactory();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const transaction = await factory.createTransactionForIssuingSemiFungible(
    alice,
    {
      tokenName: "NEWSEMI",
      tokenTicker: "SEMI",
      canFreeze: false,
      canWipe: true,
      canPause: false,
      canTransferNFTCreateRole: true,
      canChangeOwner: true,
      canUpgrade: true,
      canAddSpecialRoles: true,
    },
  );
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  const transactionOnNetwork = await entrypoint.awaitCompletedTransaction(txHash);

  // extract the token identifier // md-as-comment
  const parser = new TokenManagementTransactionsOutcomeParser()
  const outcome = parser.parseIssueSemiFungible(transactionOnNetwork)

  const tokenIdentifier = outcome[0].tokenIdentifier

} // md-ignore
// ```

// **Issuing NFT collection & creating NFTs using the controller**

// ```js

{ // md-ignore
  // create the entrypoint and the token management controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.creatTokenManagementController();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address)

  let transaction = await controller.createTransactionForIssuingNonFungible(
    alice,
    alice.getNonceThenIncrement(),
    {
      tokenName: "NEWNFT",
      tokenTicker: "NFT",
      canFreeze: false,
      canWipe: true,
      canPause: false,
      canTransferNFTCreateRole: true,
      canChangeOwner: true,
      canUpgrade: true,
      canAddSpecialRoles: true,
    },
  );

  // sending the transaction // md-as-comment
  let txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  let outcome = await entrypoint.awaitCompletedIssueNonFungible(txHash);

  const collectionIdentifier = outcome[0].tokenIdentifier

  // create an NFT // md-as-comment
  transaction = controller.createTransactionForCreatingNft(alice,
    alice.getNonceThenIncrement(),
    {
      tokenIdentifier: "FRANK-aa9e8d",
      initialQuantity: 1n,
      name: "test",
      royalties: 1000,
      hash: "abba",
      attributes: Buffer.from("test"),
      uris: ["a", "b"],
    },
  );

  // sending the transaction // md-as-comment
  txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  outcome = await entrypoint.awaitCompletedCreateNft(txHash);

  const identifier = outcome[0].tokenIdentifier;
  const nonce = outcome[0].nonce;
  const initalQuantity = outcome[0].initalQuantity;

} // md-ignore
// ```

// **Issuing NFT collection & creating NFTs using the factory**
// ```js


{ // md-ignore
  // create the entrypoint and the token management transdactions factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createTokenManagementTransactionsFactory();

  // create the issuer ot the token // md-as-comment
  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  let transaction = await factory.createTransactionForIssuingNonFungible(
    alice,
    {
      tokenName: "NEWNFT",
      tokenTicker: "NFT",
      canFreeze: false,
      canWipe: true,
      canPause: false,
      canTransferNFTCreateRole: true,
      canChangeOwner: true,
      canUpgrade: true,
      canAddSpecialRoles: true,
    },
  );
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  let txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction to execute, extract the token identifier // md-as-comment
  let transactionOnNetwork = await entrypoint.awaitCompletedTransaction(txHash);

  // extract the token identifier // md-as-comment
  let parser = new TokenManagementTransactionsOutcomeParser()
  let outcome = parser.parseIssueNonFungible(transactionOnNetwork)

  const collectionIdentifier = outcome[0].tokenIdentifier

  transaction = await factory.createTransactionForCreatingNFT(
    alice,
    {
      tokenIdentifier: "FRANK-aa9e8d",
      initialQuantity: 1n,
      name: "test",
      royalties: 1000,
      hash: "abba",
      attributes: Buffer.from("test"),
      uris: ["a", "b"],
    },
  );

  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  txHash = await entrypoint.sendTransaction(transaction);

  // ## wait for transaction to execute, extract the token identifier // md-as-comment
  transactionOnNetwork = await entrypoint.awaitCompletedTransaction(txHash);

  // extract the token identifier // md-as-comment
  outcome = parser.parseIssueNonFungible(transactionOnNetwork)

  const identifier = outcome[0].tokenIdentifier;
  const nonce = outcome[0].nonce;
  const initalQuantity = outcome[0].initalQuantity;

} // md-ignore
// ```

// These are just a few examples of what you can do using the token management controller or factory. For a complete list of supported methods, refer to the autogenerated documentation:

// - [TokenManagementController](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TokenManagementController.html)
// - [TokenManagementTransactionsFactory](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TokenManagementTransactionsFactory.html)