import { Server } from "socket.io";
import { Config } from "./config";
import { SignatureRequest } from "./signature-request/signature-request.entity";
import { SignatureRequestLogic } from "./signature-request/signature-request.logic";
import {
  RequestSignatureMessage,
  SignTransactionMessage,
  SocketMessageCommand,
} from "./socket-message.interface";

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
        publicKeys: string[],
        returnPendingSignatureRequests: (
          signatureRequests: SignatureRequest[]
        ) => void
      ) => {
        await registerSigner(socket.id, publicKeys);
        const signatureRequests =
          await SignatureRequestLogic.retrieveAllPending(publicKeys);
        returnPendingSignatureRequests(signatureRequests);
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

const registerSigner = (socketId: string, publicKeys: string[]) => {
  if (!connectedSigners) {
    connectedSigners = {};
  }
  for (const pubKey of publicKeys) {
    if (!connectedSigners[pubKey]) {
      connectedSigners[pubKey] = [];
    }
    if (!connectedSigners[pubKey].includes(socketId))
      connectedSigners[pubKey].push(socketId);
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
