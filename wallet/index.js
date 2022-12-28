const { exampleDeriveAccountsFromMnemonic, exampleSignAndBroadcastTransaction, exampleSignMessage, exampleVerifyTransactionSignature, exampleVerifyMessage } = require("./basic");

(async () => {
    exampleDeriveAccountsFromMnemonic();
    await exampleSignAndBroadcastTransaction();
    await exampleSignMessage();
    await exampleVerifyMessage();
    await exampleVerifyTransactionSignature();
})();
