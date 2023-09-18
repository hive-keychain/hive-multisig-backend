import path from "path";

require("dotenv").config();

export const Config = {
  port: {
    server: process.env.PORT || 5000,
    socketIo: process.env.SOCKET_PORT || 5001,
  },
  logger: {
    folder: path.join(__dirname, "..", "logs"),
    file: "multisig-%DATE%.log",
    levels: {
      TECHNICAL: 1,
      INFO: 1,
      ERROR: 0,
      OPERATION: 1,
      DEBUG: 1,
      WARN: 1,
    },
  },
  expiredRequest: {
    cleanEveryXHours: 24,
    cleanExpiredForXDays: 30,
  },
};
