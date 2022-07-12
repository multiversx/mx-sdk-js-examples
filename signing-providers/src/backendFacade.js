import { UserVerifier } from "@elrondnetwork/erdjs-walletcore";
import { Address, SignableMessage } from "@elrondnetwork/erdjs";

// In a real-life implementation, this code should be located on the server-side.
export function acquireThirdPartyAuthToken() {
    // Such a token would be created by an identity provider (e.g. a backend application related to the dApp).
    return "example-auth-token";
}

// In a real-life implementation, this code should be located on the server-side.
export function verifySignature(address, authToken, signature) {
    console.log("verifySignature()");
    console.log("address:", address);
    console.log("authToken:", authToken);
    console.log("signature:", signature);

    // Note that the verification API will be improved in a future version of erdjs-walletcore.
    // As of @elrondnetwork/erdjs-walletcore@v1.0.0, this API is a bit tedious:
    const verifier = UserVerifier.fromAddress(new Address(address));
    
    const message = new SignableMessage({
        signature: { hex: () => signature },
        message: Buffer.from(`${address}${authToken}{}`)
    });

    const ok = verifier.verify(message);
    if (ok) {
        return `The bearer of the token [${authToken}] is also the owner of the address [${address}].`;
    }

    return "Verification failed.";
}
