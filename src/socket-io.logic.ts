import Logger from "hive-keychain-commons/lib/logger/logger";
import { Server } from "socket.io";
import { SignatureRequestLogic } from "./signature-request/signature-request.logic";
import {
  NotifyTxBroadcastedMessage,
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

const setup = (httpServer: any) => {
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
        const result: SignerConnectResult = {
          pendingSignatureRequests: {},
          notifications: {},
        };
        let errors: SignerConnectError;
        for (const d of data) {
          try {
            await AccountUtils.verifyKey(d.publicKey, d.message, d.username);
            await registerSigner(socket.id, d.publicKey);
            result.pendingSignatureRequests[d.username] =
              await SignatureRequestLogic.retrieveAllPending(d.publicKey);
            result.notifications[d.username] =
              await SignatureRequestLogic.retrieveAllBroadcastNotification(
                d.publicKey
              );
          } catch (err) {
            if (!errors) {
              errors = {};
            }
            errors[d.publicKey] = err;
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
      SocketMessageCommand.SIGNER_DISCONNECT,
      async (publicKey: string) => {
        Logger.info(`Disconnecting ${publicKey}`);
        delete connectedSigners[publicKey];
        console.log(connectedSigners);
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
        console.log(message);
        const signatureRequest = await SignatureRequestLogic.requestSignature(
          message.signatureRequest.threshold,
          message.signatureRequest.expirationDate,
          message.signatureRequest.keyType,
          message.signatureRequest.signers,
          message.initialSigner
        );

        for (const potentialSigner of message.signatureRequest.signers) {
          if (!connectedSigners[potentialSigner.publicKey]) continue;
          for (const socketId of connectedSigners[potentialSigner.publicKey]) {
            console.log(`Emit to ${socketId}`);
            io.of("/")
              .sockets.get(socketId)
              .emit(SocketMessageCommand.REQUEST_SIGN_TRANSACTION, {
                ...signatureRequest,
                targetedPublicKey: potentialSigner.publicKey,
              });
          }
        }
        sendAck("Transaction sent to potential signers");
      }
    );

    socket.on(
      SocketMessageCommand.SIGN_TRANSACTION,
      async (
        params: SignTransactionMessage,
        requestBroadcast: (signatures: string[]) => void
      ) => {
        await SignatureRequestLogic.saveSignature(
          params.signerId,
          params.signature
        );
        const signatures =
          await SignatureRequestLogic.getSignatureIfCanBroadcast(
            params.signatureRequestId
          );
        if (signatures?.length > 0) {
          requestBroadcast(signatures);
        }
      }
    );

    socket.on(
      SocketMessageCommand.NOTIFY_TRANSACTION_BROADCASTED,
      async (params: NotifyTxBroadcastedMessage, ack: () => void) => {
        await SignatureRequestLogic.setAsBroadcasted(params.signatureRequestId);
        const signatureRequest = await SignatureRequestLogic.getById(
          params.signatureRequestId
        );
        // should notify everyone
        const signersToNotify = await SignatureRequestLogic.getAllSigners(
          params.signatureRequestId
        );
        for (const signer of signersToNotify) {
          if (!connectedSigners[signer.publicKey]) continue;
          for (const socketId of connectedSigners[signer.publicKey]) {
            console.log(`Emit to ${socketId}`);
            io.of("/")
              .sockets.get(socketId)
              .emit(SocketMessageCommand.TRANSACTION_BROADCASTED_NOTIFICATION, {
                ...signatureRequest,
                signers: signatureRequest.signers.find(
                  (s) => s.publicKey === signer.publicKey
                ),
              });
            await SignatureRequestLogic.setSignerAsNotified(signer.id);
          }
        }
        ack();
      }
    );
  });

  // io.listen(Config.port.socketIo);
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
