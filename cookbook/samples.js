import { Address, Transaction, TransactionNext, TransactionPayload } from "@multiversx/sdk-core";

export const addressOfAlice = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
export const addressOfBob = new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx");
export const addressOfCarol = new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8");

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
        value: "1",
        receiver: Address.fromBech32("erd1testnlersh4z0wsv8kjx39me4rmnvjkwu8dsaea7ukdvvc9z396qykv7z7"),
        sender: Address.fromBech32("erd15x2panzqvfxul2lvstfrmdcl5t4frnsylfrhng8uunwdssxw4y9succ9sq"),
        gasLimit: 50000,
        gasPrice: 1000000000,
        chainID: "D"
    });

    const signature = Buffer.from("c8eb539e486db7d703d8c70cab3b7679113f77c4685d8fcc94db027ceacc6b8605115034355386dffd7aa12e63dbefa03251a2f1b1d971f52250187298d12900", "hex");
    tx.applySignature(signature);
    return tx;
}

export function getReadyToBroadcastTxNext() {
    const tx = new TransactionNext({
        nonce: 42n,
        value: 1n,
        receiver: "erd1testnlersh4z0wsv8kjx39me4rmnvjkwu8dsaea7ukdvvc9z396qykv7z7",
        sender: "erd15x2panzqvfxul2lvstfrmdcl5t4frnsylfrhng8uunwdssxw4y9succ9sq",
        gasLimit: 50000n,
        gasPrice: 1000000000n,
        chainID: "D"
    });

    const signature = Buffer.from("c8eb539e486db7d703d8c70cab3b7679113f77c4685d8fcc94db027ceacc6b8605115034355386dffd7aa12e63dbefa03251a2f1b1d971f52250187298d12900", "hex");
    tx.signature = signature;
    return tx;
}
