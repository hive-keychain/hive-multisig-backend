import { Express } from "express";
import { AccountUtils } from "../utils/account.utils";
import { HiveUtils } from "../utils/hive.utils";
import { SignatureRequestLogic } from "./signature-request.logic";

const setupGetAllForUsername = (app: Express) => {
  app.get(`/signature-request/all`, async (req, res) => {
    try {
      const publicKey = req.query.publicKey as string;
      const encodedMessage = req.headers.message as string;
      console.log(req.headers);
      console.log(req.header("message"));

      const result = await HiveUtils.getClient().keys.getKeyReferences([
        publicKey!,
      ]);
      const username = result.accounts[0][0];
      if (AccountUtils.verifyKey(publicKey, encodedMessage, username))
        res.send(
          await SignatureRequestLogic.getAllForPublicKey(
            req.query.publicKey as string
          )
        );
      else res.status(401).send("You cannot access this data");
    } catch (e) {
      res.status(401).send("You cannot access this data");
    }
  });

  app.get("/health", (req, res) => {
    res.status(200).send();
  });
};

const setupApis = (app: Express) => {
  setupGetAllForUsername(app);
};

export const SignatureRequestApi = { setupApis };
