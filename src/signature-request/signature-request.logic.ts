import { KeychainKeyTypes } from "hive-keychain-commons";
import { RequestSignatureSigner } from "../socket-message.interface";
import { SignatureRequest } from "./signature-request.entity";
import { SignatureRequestRepository } from "./signature-request.repository";
import { Signer } from "./signer.entity";

const requestSignature = async (
  threshold: number,
  expirationDate: Date,
  keyType: KeychainKeyTypes,
  signers: RequestSignatureSigner[]
) => {
  const signatureRequest: SignatureRequest = {
    id: null,
    expirationDate: expirationDate,
    threshold: threshold,
    keyType: keyType,
    locked: false,
    broadcasted: false,
    signers: signers.map((s) => {
      return { ...s, signature: null, refused: false } as unknown as Signer;
    }),
  };

  return await SignatureRequestRepository.create(signatureRequest);
};

export const SignatureRequestLogic = {
  requestSignature,
};
