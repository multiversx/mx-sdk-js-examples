import { Address, SignableMessage } from "@multiversx/sdk-core";
import { UserVerifier } from "@multiversx/sdk-wallet";

// In a real-life implementation, this code should be located on the server-side.
export function acquireThirdPartyAuthToken() {
    // Such a token would be created by an identity provider (e.g. a backend application related to the dApp).
    return "example-auth-token";
}

// In a real-life implementation, this code should be located on the server-side.
export function verifyAuthTokenSignature(address, authToken, signature) {
    console.log("verifyAuthTokenSignature()");
    console.log("address:", address);
    console.log("authToken:", authToken);
    console.log("signature:", signature);

    // Note that the verification API will be improved in a future version of @multiversx/sdk-wallet
    // As of @multiversx/sdk-wallet@v3.0.0, this API is a bit tedious:
    const verifier = UserVerifier.fromAddress(new Address(address));

    const message = new SignableMessage({
        message: Buffer.from(`${address}${authToken}{}`)
    });

    const serializedMessage = message.serializeForSigning();
    const ok = verifier.verify(serializedMessage, Buffer.from(signature, "hex"));
    if (ok) {
        return `The bearer of the token [${authToken}] is also the owner of the address [${address}].`;
    }

    return "Verification failed.";
}
