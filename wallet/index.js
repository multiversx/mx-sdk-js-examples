const { exampleDeriveAccountsFromMnemonic, exampleSignAndBroadcastTransaction, exampleSignMessage } = require("./basic");

(async () => {
    exampleDeriveAccountsFromMnemonic();
    await exampleSignAndBroadcastTransaction();
    await exampleSignMessage();
})();
