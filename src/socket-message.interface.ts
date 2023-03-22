import { KeychainKeyTypes } from "hive-keychain-commons";

export enum SocketMessageCommand {
  SIGNER_CONNECT = "signer_connect",
  REQUEST_SIGNATURE = "request_signature",
  REQUEST_SIGN_TRANSACTION = "request_sign_transaction",
  SIGN_TRANSACTION = "sign_transaction",
  REQUEST_LOCK = "request_lock",
  NOTIFY_TRANSACTION_BROADCASTED = "notify_transaction_broadcasted",
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

export interface SignTransactionMessage extends SocketMessagePayload {
  encryptedTransaction: string;
  broadcasted: boolean;
  requestSignatureId: number;
}
