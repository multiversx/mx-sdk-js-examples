// ## Guarded transactions
// Similar to relayers, transactions also have two additional fields:

// - guardian
// - guardianSignature
// Each controller includes an argument for the guardian. The transaction can either:
// 1. Be sent to a service that signs it using the guardian’s account, or
// 2. Be signed by another account acting as a guardian.

// Let’s issue a token using a guarded account:

// **Creating guarded transactions using controllers**
//We can create relayed transactions using any of the available controllers. 
// Each controller includes a relayer argument, which must be set if we want to create a relayed transaction.
// Let’s issue a fungible token using a relayed transaction:

// ```js
import { Account, DevnetEntrypoint } from '@multiversx/sdk-core';
import path from 'path';
{ // md-ignore
  // create the entrypoint and the token management controller // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const controller = entrypoint.creatTokenManagementController();

  // create the issuer of the token // md-comment
  const walletsPath = path.join("src", "testdata", "testwallets");
  const alice = await Account.newFromPem(path.join(walletsPath, "alice.pem"));

  // carol will be our guardian // md-comment
  const carol = await Account.newFromPem(path.join(walletsPath, "carol.pem"));

  // fetch the nonce of the network // md-as-comment
  alice.nonce = await entrypoint.recallAccountNonce(alice.address);

  const transaction = await controller.createTransactionForIssuingFungible(
    alice,
    alice.getNonceThenIncrement(),
    carol.address,
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

  // guardian also signs the transaction // md-as-comment
  transaction.relayerSignature = carol.signTransaction(transaction);

  // broadcast the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
} // md-ignore
// ```

// **Creating guarded transactions using factories**
// Unlike controllers, `transaction factories` do not have a `guardian` argument. Instead, the **guardian must be set after creating the transaction**.
// This approach is beneficial because the **transaction is not signed by the sender at the time of creation**, allowing flexibility in setting the guardian before signing.

// Let’s issue a fungible token using the `TokenManagementTransactionsFactory`:

// ```js
{ // md-ignore
  // create the entrypoint and the token management factory // md-as-comment
  const entrypoint = new DevnetEntrypoint();
  const factory = entrypoint.creatTokenManagementController();

  // create the issuer of the token // md-comment
  const walletsPath = path.join("src", "testdata", "testwallets");
  const alice = await Account.newFromPem(path.join(walletsPath, "alice.pem"));

  // carol will be our guardian // md-comment
  const carol = await Account.newFromPem(path.join(walletsPath, "carol.pem"));

  const transaction = await factory.createTransactionForIssuingFungible(
    alice.address,
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

  // set the guardian // md-as-comment
  transaction.guardian = carol.address;

  // sign the transaction // md-as-comment
  transaction.signature = alice.signTransaction(transaction);

  // guardian also signs the transaction // md-as-comment
  transaction.guardianSignature = carol.signTransaction(transaction);

  // broadcast the transaction // md-as-comment
  const txHash = await entrypoint.sendTransaction(transaction);
} // md-ignore
// ```

// We can create guarded relayed transactions just like we did before. However, keep in mind:

// 🔹 Only the sender can be guarded—the relayer cannot be guarded.

// Flow for Creating Guarded Relayed Transactions:
// - Using Controllers:
//    1. Set both guardian and relayer fields.
//    2. The transaction must be signed by both the guardian and the relayer.
// - Using Factories:

//    1. Create the transaction.
//    2. Set both guardian and relayer fields.
//    3. First, the sender signs the transaction.
//    4. Then, the guardian signs.
//    5. Finally, the relayer signs before broadcasting.