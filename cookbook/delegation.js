import { Account, Address, DevnetEntrypoint, TokenManagementTransactionsOutcomeParser } from "@multiversx/sdk-core"; // md-ignore
import path from 'path'; // md-ignore
// ### Delegation management

// To learn more about staking providers and delegation, please refer to the official [documentation](https://docs.multiversx.com/validators/delegation-manager/#introducing-staking-providers).
// In this section, we'll cover how to:
// - Create a new delegation contract
// - Retrieve the contract address
// - Delegate funds to the contract
// - Redelegate rewards
// - Claim rewards
// - Undelegate and withdraw funds

// These operations can be performed using both the controller and the **factory**. For a complete list of supported methods, please refer to the autogenerated documentation:
// - [DelegationController](https://multiversx.github.io/mx-sdk-js-core/v14/classes/DelegationController.html)
// - [DelegationTransactionsFactory](https://multiversx.github.io/mx-sdk-js-core/v14/classes/DelegationTransactionsFactory.html)

// #### Creating a New Delegation Contract Using the Controller
// ```js
{
  // create the entrypoint and the delegation controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createDelegationController();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const transaction = await controller.createTransactionForNewDelegationContract(
    alice.address,
    alice.getNonceThenIncrement(),
    {
      totalDelegationCap: 0,
      serviceFee: 10n,
      amount: 1250000000000000000000n,
    });

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // wait for transaction completion, extract delegation contract's address // md-as-comment
  const outcome = await controller.awaitCompletedCreateNewDelegationContract(txHash);

  const contractAddress = outcome[0].contractAddress;
}
// ```

// #### Creating a new delegation contract using the factory
// ```js
{
  // create the entrypoint and the delegation factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createDelegationTransactionsFactory();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);


  const transaction = await factory.createTransactionForNewDelegationContract(alice.address,
    {
      totalDelegationCap: 0,
      serviceFee: 10n,
      amount: 1250000000000000000000n,
    });
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  // set the nonce // md-as-comment
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = await alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);

  // waits until the transaction is processed and fetches it from the network // md-as-comment
  const transactionOnNetwork = await entrypoint.awaitCompletedTransaction(txHash);

  // extract the contract address // md-as-comment
  const parser = new TokenManagementTransactionsOutcomeParser();
  const outcome = parser.parseIssueFungible(transactionOnNetwork);
  const contractAddress = outcome[0].contractAddress;
}
// ```

// #### Delegating funds to the contract using the Controller
// We can send funds to a delegation contract to earn rewards.

// ```js
{
  // create the entrypoint and the delegation controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createDelegationController();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");

  const transaction = await controller.createTransactionForDelegating(
    alice.address,
    alice.getNonceThenIncrement(),
    {
      delegationContract: contract,
      amount: 5000000000000000000000n,
    });

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Delegating funds to the contract using the factory
// ```js
{
  // create the entrypoint and the delegation factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createDelegationTransactionsFactory();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");

  const transaction = await factory.createTransactionForDelegating(alice.address,
    {
      delegationContract: contract,
      amount: 5000000000000000000000n,
    });
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  // set the nonce // md-as-comment
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = await alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Redelegating rewards using the Controller
// Over time, as rewards accumulate, we may choose to redelegate them to the contract to maximize earnings.

// ```js
{
  // create the entrypoint and the delegation controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createDelegationController();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const transaction = await controller.createTransactionForRedelegatingRewards(
    alice.address,
    alice.getNonceThenIncrement(),
    {
      delegationContract: contract,
    });

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Redelegating rewards using the factory
// ```js
{
  // create the entrypoint and the delegation factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createDelegationTransactionsFactory();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");

  const transaction = await factory.createTransactionForRedelegatingRewards(alice.address,
    {
      delegationContract: contract,
    });
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  // set the nonce // md-as-comment
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = await alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Claiming rewards using the Controller
// We can also claim our rewards when needed.

// ```js
{
  // create the entrypoint and the delegation controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createDelegationController();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const transaction = await controller.createTransactionForClaimingRewards(
    alice.address,
    alice.getNonceThenIncrement(),
    {
      delegationContract: contract,
    });

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Claiming rewards using the factory
// ```js
{
  // create the entrypoint and the delegation factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createDelegationTransactionsFactory();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");

  const transaction = await factory.createTransactionForClaimingRewards(alice.address,
    {
      delegationContract: contract,
    });
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  // set the nonce // md-as-comment
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = await alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Undelegating funds using the Controller
// By **undelegating**, we signal the contract that we want to retrieve our staked funds. This process requires a **10-epoch unbonding period** before the funds become available.

// ```js
{
  // create the entrypoint and the delegation controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createDelegationController();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const transaction = await controller.createTransactionForUndelegating(
    alice.address,
    alice.getNonceThenIncrement(),
    {
      delegationContract: contract,
      amount: 1000000000000000000000n // 1000 EGLD // md-as-comment
    });

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Undelegating funds using the factory
// ```js
{
  // create the entrypoint and the delegation factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createDelegationTransactionsFactory();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");

  const transaction = await factory.createTransactionForUndelegating(alice.address,
    {
      delegationContract: contract,
      amount: 1000000000000000000000n // 1000 EGLD // md-as-comment
    });
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  // set the nonce // md-as-comment
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = await alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Withdrawing funds using the Controller
// After the `10-epoch unbonding period` is complete, we can proceed with withdrawing our staked funds using the controller. This final step allows us to regain access to the previously delegated funds.

// ```js
{
  // create the entrypoint and the delegation controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.createDelegationController();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const transaction = await controller.createTransactionForWithdrawing(
    alice.address,
    alice.getNonceThenIncrement(),
    {
      delegationContract: contract,
    });

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```

// #### Withdrawing funds using the factory
// ```js
{
  // create the entrypoint and the delegation factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.createDelegationTransactionsFactory();

  const filePath = path.join("src", "testdata", "testwallets", "alice.pem");
  const alice = await Account.newFromPem(filePath);

  const contract = Address.newFromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva");

  const transaction = await factory.createTransactionForWithdrawing(alice.address,
    {
      delegationContract: contract,
    });
  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  // set the nonce // md-as-comment
  transaction.nonce = alice.getNonceThenIncrement();

  // sign the transaction // md-as-comment
  transaction.signature = await alice.signTransaction(transaction);

  // sending the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
}
// ```