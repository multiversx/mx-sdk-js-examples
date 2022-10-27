const { exampleDeriveAccountsFromMnemonic, exampleSignAndBroadcastTransaction, exampleSignMessage, exampleVerifyTransactionSignature } = require("./basic");

(async () => {
    exampleDeriveAccountsFromMnemonic();
    await exampleSignAndBroadcastTransaction();
    await exampleSignMessage();
    await exampleVerifyTransactionSignature();
})();
