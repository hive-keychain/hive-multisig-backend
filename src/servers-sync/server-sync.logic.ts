import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Server } from "socket.io";
import { connect, Socket } from "socket.io-client";
import { Config } from "../config";
import { ArrayUtils } from "../utils/array.utils";
import { ServerSyncMessage } from "./server-sync-messages.enum";

interface OutgoingConnection {
  ipAddress: string;
  socket: Socket;
}

let ioServer: Server;
let ioClients: OutgoingConnection[] = [];

let seeds = Config.sync.seed;

const initSync = (httpServer: any) => {
  ioServer = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  for (const serverIpAddress of seeds) {
    connectToServer(serverIpAddress);
  }

  ioServer.on("connection", (socket) => {
    // Check if outgoing client connection exist. If not connect

    console.log(socket.handshake.headers.host);

    const outgoingConnection = ioClients.find(
      (outgoingConnection) =>
        outgoingConnection.ipAddress === socket.handshake.address
    );
    if (!outgoingConnection) {
      connectToServer(socket.handshake.address);
    }
  });

  ioServer.on(ServerSyncMessage.REQUEST_SEEDS, handleSeedsRequest);
};

const connectToServer = (ipAddress: string) => {
  const newClient = { ipAddress: ipAddress, socket: connect(ipAddress) };
  ioClients.push(newClient);
  requestSeeds(newClient.socket);
};

const requestSeeds = (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
  socket.emit(ServerSyncMessage.REQUEST_SEEDS, null, (newSeeds: string[]) => {
    seeds = ArrayUtils.mergeWithoutDuplicate(seeds, newSeeds);
    for (const serverIpAddress of seeds) {
      const outgoingConnection = ioClients.find(
        (outgoingConnection) => outgoingConnection.ipAddress === serverIpAddress
      );
      if (!outgoingConnection) {
        connectToServer(serverIpAddress);
      }
    }
  });
};

const handleSeedsRequest = (callback: (seeds: string[]) => void) => {
  callback(seeds);
};

export const ServerSyncLogic = { initSync };
