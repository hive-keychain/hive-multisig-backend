import { KeychainKeyTypes } from "hive-keychain-commons";
import { Config } from "../config";
import {
  RequestSignatureSigner,
  SignatureRequestInitialSigner,
  UserNotification,
} from "../socket-message.interface";
import { SignatureRequest } from "./signature-request.entity";
import { SignatureRequestRepository } from "./signature-request.repository";
import { Signer } from "./signer/signer.entity";
import { SignerRepository } from "./signer/signer.repository";

const getById = async (signatureRequestId: SignatureRequest["id"]) => {
  return SignatureRequestRepository.findById(signatureRequestId);
};

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
  const allSignatureRequest = await SignatureRequestRepository.findAllPending();
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

const setAsBroadcasted = async (signatureRequestId: SignatureRequest["id"]) => {
  await SignatureRequestRepository.setAsBroadcasted(signatureRequestId);
};

const getAllSigners = async (signatureRequestId: SignatureRequest["id"]) => {
  const signatureRequest = await SignatureRequestRepository.findById(
    signatureRequestId
  );
  return signatureRequest.signers.filter((signer) => !!signer.signature);
};

const setSignerAsNotified = async (signerId: number) => {
  await SignerRepository.setAsNotified(signerId);
};

const retrieveAllBroadcastNotification = async (
  publicKey: string
): Promise<UserNotification[]> => {
  const requests = await SignatureRequestRepository.findAllBroadcasted();
  const requestsToNotify = requests.filter((r) =>
    r.signers.find(
      (signer) => signer.publicKey === publicKey && !signer.notified
    )
  );

  await SignerRepository.setAllAsNotifiedForPublicKey(publicKey);

  return requestsToNotify.map((r) => {
    return { signatureRequest: r, message: "transaction_broadcasted" };
  });
};

const initiateCleanExpiredRoutine = async () => {
  SignatureRequestRepository.cleanAllExpired();
  setInterval(() => {
    SignatureRequestRepository.cleanAllExpired();
  }, Config.expiredRequest.cleanEveryXHours * 60 * 60 * 1000);
};

const getAllForPublicKey = async (publicKey: string) => {
  const signatureRequests =
    await SignatureRequestRepository.findAllForPublicKey(publicKey);

  return signatureRequests.map((sr) => {
    let status;

    const now = new Date();

    if (now > sr.expirationDate) status = "expired";
    else if (sr.broadcasted) status = "broadcasted";
    else if (sr.signers[0].signature && !sr.broadcasted) status = "signed";
    else if (!sr.broadcasted && !sr.signers[0].signature) status = "pending";

    return { ...sr, status };
  });
};

export const SignatureRequestLogic = {
  requestSignature,
  requestLock,
  retrieveAllPending,
  saveSignature,
  refuseTransaction,
  getSignatureIfCanBroadcast,
  setAsBroadcasted,
  getAllSigners,
  getById,
  setSignerAsNotified,
  retrieveAllBroadcastNotification,
  initiateCleanExpiredRoutine,
  getAllForPublicKey,
};
