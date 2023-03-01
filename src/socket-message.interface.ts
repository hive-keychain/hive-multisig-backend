export enum SocketMessageCommand {
  SIGNER_CONNECT = "signer_connect",
  REQUEST_SIGNATURE = "request_signature",
  REQUEST_SIGNATURE_RESPONSE = "request_signature_response",
  SIGN_TRANSACTION = "sign_transaction",
  SIGN_TRANSACTION_RESPONSE = "sign_transaction_response",
  REQUEST_LOCK = "request_lock",
  REQUEST_LOCK_RESPONSE = "request_lock_response",
  NOTIFY_TRANSACTION_BROADCASTED = "notify_transaction_broadcasted",
  TRANSACTION_BROADCASTED_ACK = "transaction_broadcasted_ack",
}

export interface SocketMessage {
  command: string;
  payload: SocketMessageType;
}

export interface SocketMessageType {
  type: SocketMessageCommand;
}

export interface ConnectMessage extends SocketMessageType {
  type: SocketMessageCommand.SIGNER_CONNECT;
  publicKey: string;
}

export interface RequestSignatureMessage extends SocketMessageType {
  type: SocketMessageCommand.REQUEST_SIGNATURE;
  expirationDate: Date;
  threshold: number;
  signers: RequestSignatureSigner;
}

export interface RequestSignatureSigner {
  encryptedTransaction: string; // Encrypted transaction with signer key
  publicKey: string;
}

export interface SignTransactionMessage extends SocketMessageType {
  type: SocketMessageCommand.SIGN_TRANSACTION;
}
