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

const requestLock = async (requestId: number) => {
  const request = await SignatureRequestRepository.findById(requestId);
  if (request.locked) {
    return false;
  } else {
    request.locked = true;
    await SignatureRequestRepository.update(request);
    return true;
  }
};

const retrieveAllPending = async (publicKeys: string) => {
  const allSignatureRequest = await SignatureRequestRepository.findAll();
  const requestsToSign: SignatureRequest[] = [];
  for (const request of allSignatureRequest) {
    for (const potentialSigner of request.signers) {
      if (publicKeys === potentialSigner.publicKey) {
        requestsToSign.push(request);
      }
    }
  }
  return requestsToSign;
};

export const SignatureRequestLogic = {
  requestSignature,
  requestLock,
  retrieveAllPending,
};
