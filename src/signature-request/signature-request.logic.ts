import { KeychainKeyTypes } from "hive-keychain-commons";
import {
  RequestSignatureSigner,
  SignatureRequestInitialSigner,
} from "../socket-message.interface";
import { SignatureRequest } from "./signature-request.entity";
import { SignatureRequestRepository } from "./signature-request.repository";
import { Signer } from "./signer/signer.entity";
import { SignerRepository } from "./signer/signer.repository";

const requestSignature = async (
  threshold: number,
  expirationDate: Date,
  keyType: KeychainKeyTypes,
  signers: RequestSignatureSigner[],
  initialSigner: SignatureRequestInitialSigner
) => {
  const signersList: Signer[] = signers.map((s) => {
    return { ...s, signature: null, refused: false } as unknown as Signer;
  });
  signersList.push({
    ...signersList[0],
    publicKey: initialSigner.publicKey,
    weight: initialSigner.weight,
    signature: initialSigner.signature,
  });

  const signatureRequest: SignatureRequest = {
    id: null,
    expirationDate: expirationDate,
    threshold: threshold,
    keyType: keyType,
    initiator: initialSigner.username,
    locked: false,
    broadcasted: false,
    signers: signersList,
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

const saveSignature = async (signerId: number, signature: string) => {
  await SignerRepository.saveSignature(signerId, signature);
};

const refuseTransaction = async (signerId: number) => {
  await SignerRepository.refuseTransaction(signerId);
};

const getSignatureIfCanBroadcast = async (signatureRequestId: number) => {
  const signatureRequest = await SignatureRequestRepository.findById(
    signatureRequestId
  );

  let totalWeight = 0;
  const signatures = [];
  for (const signer of signatureRequest.signers) {
    if (signer.signature) {
      signatures.push(signer.signature);
      totalWeight += signer.weight;
    }
  }
  if (totalWeight >= signatureRequest.threshold) {
    return signatures;
  }
};

export const SignatureRequestLogic = {
  requestSignature,
  requestLock,
  retrieveAllPending,
  saveSignature,
  refuseTransaction,
  getSignatureIfCanBroadcast,
};
