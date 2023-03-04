import { KeychainKeyTypes } from "hive-keychain-commons";

export enum SocketMessageCommand {
  SIGNER_CONNECT = "signer_connect",
  SIGNER_CONNECT_ACK = "signer_connect_ack",
  REQUEST_SIGNATURE = "request_signature",
  REQUEST_SIGNATURE_RESPONSE = "request_signature_response",
  REQUEST_SIGN_TRANSACTION = "request_sign_transaction",
  SIGN_TRANSACTION = "sign_transaction",
  SIGN_TRANSACTION_RESPONSE = "sign_transaction_response",
  REQUEST_LOCK = "request_lock",
  REQUEST_LOCK_RESPONSE = "request_lock_response",
  NOTIFY_TRANSACTION_BROADCASTED = "notify_transaction_broadcasted",
  TRANSACTION_BROADCASTED_ACK = "transaction_broadcasted_ack",
}

export interface SocketMessage {
  command: string;
  payload: SocketMessagePayload;
}

export interface SocketMessagePayload {}

export interface SignerConnectMessage extends SocketMessagePayload {
  publicKey: string;
}

export interface RequestSignatureMessage extends SocketMessagePayload {
  expirationDate: Date;
  threshold: number;
  keyType: KeychainKeyTypes;
  signers: RequestSignatureSigner[];
}

export interface RequestSignatureSigner {
  encryptedTransaction: string; // Encrypted transaction with signer key
  publicKey: string;
  weight: string;
}

export interface SignTransactionMessage extends SocketMessagePayload {}
