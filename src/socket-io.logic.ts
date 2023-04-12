import { Server } from "socket.io";
import { Config } from "./config";
import { SignatureRequestLogic } from "./signature-request/signature-request.logic";
import {
  RequestSignatureMessage,
  SignTransactionMessage,
  SignerConnectError,
  SignerConnectMessage,
  SignerConnectResponse,
  SignerConnectResult,
  SocketMessageCommand,
} from "./socket-message.interface";
import { AccountUtils } from "./utils/account.utils";

interface ConnectedSigners {
  [publicKey: string]: string[];
}

let io;
let connectedSigners: ConnectedSigners = {};

const setup = async (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    // TODO: Only for dev
    socket.on("ping", (arg) => {
      socket.emit("pong", []);
    });

    socket.on("disconnect", (reason) => {
      console.log(`disconnect ${socket.id} due to ${reason}`);
      disconnectedSigner(socket.id);
    });

    socket.on(
      SocketMessageCommand.SIGNER_CONNECT,
      async (
        data: SignerConnectMessage[],
        returnPendingSignatureRequests: (
          response: SignerConnectResponse
        ) => void
      ) => {
        const result: SignerConnectResult = {};
        let errors: SignerConnectError;
        for (const d of data) {
          try {
            await AccountUtils.verifyKey(d.publicKey, d.message, d.username);
            await registerSigner(socket.id, d.publicKey);
            result[d.username] = await SignatureRequestLogic.retrieveAllPending(
              d.publicKey
            );
          } catch (err) {
            if (!errors) {
              errors = {};
            }
            errors[d.username] = err;
            console.log(err);
          }
        }
        returnPendingSignatureRequests({
          errors: errors,
          result: result,
        } as SignerConnectResponse);
      }
    );

    socket.on(
      SocketMessageCommand.REQUEST_LOCK,
      async (
        requestSignatureId: number,
        sendIsRequestLocked: (lock: boolean) => void
      ) => {
        const lock = await SignatureRequestLogic.requestLock(
          requestSignatureId
        );
        sendIsRequestLocked(lock);
      }
    );

    socket.on(
      SocketMessageCommand.REQUEST_SIGNATURE,
      async (
        message: RequestSignatureMessage,
        sendAck: (message: string) => void
      ) => {
        const signatureRequest = await SignatureRequestLogic.requestSignature(
          message.threshold,
          message.expirationDate,
          message.keyType,
          message.signers
        );

        for (const potentialSigner of message.signers) {
          if (!connectedSigners[potentialSigner.publicKey]) continue;
          for (const socketId of connectedSigners[potentialSigner.publicKey]) {
            console.log(`Emit to ${socketId}`);
            io.of("/")
              .sockets.get(socketId)
              .emit(
                SocketMessageCommand.REQUEST_SIGN_TRANSACTION,
                signatureRequest
              );
          }
        }
        sendAck("Transaction send to potential signers");
      }
    );

    socket.on(
      SocketMessageCommand.SIGN_TRANSACTION,
      async (params: SignTransactionMessage, sendResponse) => {
        console.log(params);
      }
    );
  });

  io.listen(Config.port.socketIo);
};

const registerSigner = (socketId: string, publicKeys: string) => {
  if (!connectedSigners) {
    connectedSigners = {};
  }
  if (!connectedSigners[publicKeys]) {
    connectedSigners[publicKeys] = [];
  }
  if (!connectedSigners[publicKeys].includes(socketId)) {
    connectedSigners[publicKeys].push(socketId);
  }

  console.log("Connected signers updated", connectedSigners);
};

const disconnectedSigner = (socketId: string) => {
  for (const pubKey of Object.keys(connectedSigners)) {
    connectedSigners[pubKey] = connectedSigners[pubKey].filter(
      (s) => s !== socketId
    );
    if (connectedSigners[pubKey].length === 0) {
      delete connectedSigners[pubKey];
    }
  }
  console.log("Connected signers updated", connectedSigners);
};

export const SocketIoLogic = { setup };
