import bodyParser from "body-parser";
import express from "express";
import { Express } from "express-serve-static-core";
import Logger from "hive-keychain-commons/lib/logger/logger";
import { createServer } from "http";
import https from "https";
import { Config } from "./config";
import { AppDataSource } from "./database/data-source";
import { DatabaseModule } from "./database/typeorm";
import { SignatureRequestApi } from "./signature-request/signature-request.api";
import { SignatureRequestLogic } from "./signature-request/signature-request.logic";
import { SocketIoLogic } from "./socket-io.logic";
require("dotenv").config();

var cors = require("cors");

const initServerRoutine = async () => {
  const app = express();
  Logger.initLogger(Config.logger, process.env.NODE_ENV);
  setupRoutes(app);
  await DatabaseModule.initDatabaseConnection(AppDataSource);
  await SignatureRequestLogic.initiateCleanExpiredRoutine();
  startServer(app);
};

const setupRoutes = (app: Express) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());
  SignatureRequestApi.setupApis(app);
};

const startServer = (app: Express) => {
  if (!process.env.DEV) {
    https.createServer({}, app).listen(Config.port.server, () => {
      Logger.technical(`Https Server running on port ${Config.port.server}`);
    });
  } else {
    const httpServer = createServer(app);
    SocketIoLogic.setup(httpServer);

    httpServer.listen(Config.port.server, () => {
      Logger.technical(
        `Running on port ${Config.port.server}, socket.io on port ${Config.port.socketIo}`
      );
    });
  }
};

initServerRoutine();
