import { PublicKey, Signature, cryptoUtils } from "@hiveio/dhive";
import { HiveUtils } from "./hive.utils";

const verifyKey = async (
  publicKey: string,
  message: string,
  username: string
) => {
  const accounts = (
    await HiveUtils.getClient().keys.getKeyReferences([publicKey!])
  )?.accounts;
  if (accounts?.[0]?.includes(username)) {
    const signature = Signature.fromString(message);
    const key = PublicKey.fromString(publicKey);
    const result = key.verify(cryptoUtils.sha256(username), signature);
    if (result) {
      return true;
    } else throw new Error("The signature could not be verified");
  } else throw new Error("The signature could not be verified");
};

export const AccountUtils = {
  verifyKey,
};
