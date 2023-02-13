import bodyParser from "body-parser";
import express from "express";
import { Express } from "express-serve-static-core";
import Logger from "hive-keychain-commons/lib/logger/logger";
import { createServer } from "http";
import https from "https";
import { Server } from "socket.io";
import { Config } from "./config";
import { AppDataSource } from "./database/data-source";
import { DatabaseModule } from "./database/typeorm";
require("dotenv").config();

var cors = require("cors");

const initServerRoutine = async () => {
  const app = express();
  Logger.initLogger(Config.logger, process.env.NODE_ENV);
  setupRoutes(app);
  await DatabaseModule.initDatabaseConnection(AppDataSource);

  startServer(app);
};

const setupRoutes = (app: Express) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());
};

const startServer = (app: Express) => {
  if (!process.env.DEV) {
    https.createServer({}, app).listen(Config.port.server, () => {
      Logger.technical(`Https Server running on port ${Config.port.server}`);
    });
  } else {
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });
    io.on("connection", (socket) => {
      const values = {
        id: socket.id,
      };
      console.log(values, "user connected");

      socket.on("ping", (arg) => {
        console.log("ping receive", arg);
        socket.emit("pong", []);
      });

      socket.on("disconnect", (reason) => {
        console.log(`disconnect ${socket.id} due to ${reason}`);
      });
    });

    io.listen(Config.port.socketIo);

    httpServer.listen(Config.port.server, () => {
      Logger.technical(
        `Running on port ${Config.port.server}, socket.io on port ${Config.port.socketIo}`
      );
    });
  }
};

initServerRoutine();
