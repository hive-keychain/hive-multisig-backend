import { SignatureRequest } from "../signature-request/signature-request.entity";
import { Signer } from "../signature-request/signer/signer.entity";

export interface NewSeedMessage {
  ipAddress: string;
}

export enum NewEntryType {
  TRANSACTION_BROADCASTED = "transactionBroadcasted",
  NEW_SIGNATURE_REQUEST = "newSignatureRequest",
  SIGNATURE_RECEIVED = "signatureReceived",
}

export interface NewEntryMessage {
  type: NewEntryType;
}

export interface NewSignatureRequestEntry {
  type: NewEntryType.NEW_SIGNATURE_REQUEST;
  signatureRequest: SignatureRequest;
}

export interface SignatureReceivedEntry {
  type: NewEntryType.SIGNATURE_RECEIVED;
  signatureRequestId: SignatureRequest["id"];
  signerId: Signer["id"];
  signature: string;
}

export interface TransactionBroadcastedEntry {
  type: NewEntryType.TRANSACTION_BROADCASTED;
  signatureRequestId: SignatureRequest["id"];
}

export interface FullSyncMessage {}
