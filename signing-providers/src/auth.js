import { NativeAuthClient } from "@multiversx/sdk-native-auth-client";
import { API_URL, NETWORK_NAME } from "./config";

export async function createNativeAuthInitialPart() {
  const client = new NativeAuthClient({
    apiUrl: API_URL,
    expirySeconds: 7200,
  });

  const initialPart = await client.initialize();
  console.log("createNativeAuthInitialPart()", initialPart);

  return initialPart;
}

export function packNativeAuthToken(address, initialPart, signature) {
  console.log("packNativeAuthToken()");
  console.log("address", address);
  console.log("initialPart", initialPart);
  console.log("signature", signature);

  const client = new NativeAuthClient();
  const accessToken = client.getToken(address, initialPart, signature);
  return accessToken;
}

export function verifyNativeAuthToken(nativeAuthToken) {
  const message = `
Native auth token:
${nativeAuthToken}

Normally, you would now send this token to your server, which would then validate it.

Go and check it on:
https://utils.multiversx.com/auth (switch to ${NETWORK_NAME})`;

  console.log(message);
  alert(message);
}
