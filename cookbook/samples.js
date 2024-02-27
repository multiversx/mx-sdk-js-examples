import { Address, Transaction, TransactionNext, TransactionPayload } from "@multiversx/sdk-core";

export const addressOfAlice = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
export const addressOfBob = new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx");
export const addressOfCarol = new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8");
export const completedTransactionsHashes = [
    "930e9e1a687602522f9b0803eae8d5f0a07ac6721ef5bb455a989e38b2681e5f",
    "9a4cce1b5e1c6edbd06aa509b09e02596b42afbdfa3f43db1245fd4634fc6815",
    "7d7d05f141026aa461154b52476a5a78bd3dd9b0dc29bedc66b0de54c55a41d5"
];

export const legacyDelegationContractAddress = Address.fromBech32("erd1qqqqqqqqqqqqqpgqp699jngundfqw07d8jzkepucvpzush6k3wvqyc44rx");
export const addressOfFirstDevnetDelegator = new Address("erd1s0us936aku52uxyvnhxspcaj4f4sp7d9azuyw7kf32ggm88ynlps7c0yr9");

export function getNotYetSignedTxLegacy() {
    return new Transaction({
        value: "1",
        gasLimit: 70000,
        gasPrice: 1000000000,
        sender: addressOfAlice,
        receiver: addressOfBob,
        data: new TransactionPayload("hello"),
        chainID: "D",
        version: 1
    });
}

export function getNotYetSignedTxNext() {
    return new TransactionNext({
        value: 1n,
        gasLimit: 70000n,
        gasPrice: 1000000000n,
        sender: addressOfAlice.toBech32(),
        receiver: addressOfBob.toBech32(),
        data: new TextEncoder().encode("hello"),
        chainID: "D",
        version: 1
    });
}

export function getReadyToBroadcastTxLegacy() {
    const tx = new Transaction({
        nonce: 42,
        value: "1000000000000000000",
        receiver: Address.fromBech32("erd1testnlersh4z0wsv8kjx39me4rmnvjkwu8dsaea7ukdvvc9z396qykv7z7"),
        sender: Address.fromBech32("erd1ej69d0509akc7vwh9kfeew5hp8gm8u2fxrd7066mmphs8029da6sxjca72"),
        gasLimit: 50000,
        gasPrice: 1000000000,
        chainID: "D"
    });

    const signature = Buffer.from("69d5cb5ce7a380cfd8bf6ebebbf70a45a5119791aa27b30e48e4a9f61a81afdfaf17b16368b8149039b84aa0bbaa3e1ee975eed9a07d196b6f480655fe40be09", "hex");
    tx.applySignature(signature);
    return tx;
}

export function getReadyToBroadcastTxNext() {
    const tx = new TransactionNext({
        nonce: 42n,
        value: 1000000000000000000n,
        receiver: "erd1testnlersh4z0wsv8kjx39me4rmnvjkwu8dsaea7ukdvvc9z396qykv7z7",
        sender: "erd1ej69d0509akc7vwh9kfeew5hp8gm8u2fxrd7066mmphs8029da6sxjca72",
        gasLimit: 50000n,
        gasPrice: 1000000000n,
        chainID: "D"
    });

    const signature = Buffer.from("69d5cb5ce7a380cfd8bf6ebebbf70a45a5119791aa27b30e48e4a9f61a81afdfaf17b16368b8149039b84aa0bbaa3e1ee975eed9a07d196b6f480655fe40be09", "hex");
    tx.signature = signature;
    return tx;
}
