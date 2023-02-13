import path from "path";

require("dotenv").config();

export const Config = {
  port: {
    server: 5000,
    socketIo: 5001,
  },
  logger: {
    folder: path.join(__dirname, "..", "logs"),
    file: "lease-market-%DATE%.log",
    levels: {
      TECHNICAL: 1,
      INFO: 1,
      ERROR: 0,
      OPERATION: 1,
      DEBUG: 1,
      WARN: 1,
    },
  },
};
