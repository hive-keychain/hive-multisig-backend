export enum SocketMessageCommand {
  SIGNER_CONNECT = "signer_connect",
  REQUEST_SIGNATURE = "request_signature",
  SIGN_TRANSACTION = "sign_transaction",
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
