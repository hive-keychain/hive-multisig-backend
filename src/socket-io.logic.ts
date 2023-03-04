import { Server } from "socket.io";
import { Config } from "./config";
import { SocketMessageCommand } from "./socket-message.interface";

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
    socket.on("ping", (arg) => {
      socket.emit("pong", []);
    });

    socket.on("disconnect", (reason) => {
      console.log(`disconnect ${socket.id} due to ${reason}`);
      disconnectedSigner(socket.id);
    });

    socket.on(SocketMessageCommand.SIGNER_CONNECT, (publicKeys: string[]) => {
      registerSigner(socket.id, publicKeys);
    });
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

  console.log(connectedSigners);
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
  console.log(connectedSigners);
};

export const SocketIoLogic = { setup };
