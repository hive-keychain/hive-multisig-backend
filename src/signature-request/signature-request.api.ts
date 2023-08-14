import { Express } from "express";
import { SignatureRequestLogic } from "./signature-request.logic";

const setupGetAllForUsername = (app: Express) => {
  app.get(`/signature-request/all`, async (req, res) => {
    res.send(
      await SignatureRequestLogic.getAllForPublicKey(
        req.query.publicKey as string
      )
    );
  });
};

const setupApis = (app: Express) => {
  setupGetAllForUsername(app);
};

export const SignatureRequestApi = { setupApis };
