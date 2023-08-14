import Logger from "hive-keychain-commons/lib/logger/logger";
import { In, LessThan, MoreThan } from "typeorm";
import { Config } from "../config";
import { DatabaseModule } from "../database/typeorm";
import { SignatureRequest } from "./signature-request.entity";
import { SignerRepository } from "./signer/signer.repository";

const getRepo = () => {
  return DatabaseModule.getDatabase().getRepository(SignatureRequest);
};

const findAll = () => {
  return getRepo().find({ relations: ["signers"] });
};

const findAllPending = () => {
  const now = new Date();
  return getRepo().find({
    where: {
      expirationDate: MoreThan(now),
      broadcasted: false,
    },
    relations: ["signers"],
  });
};

const findAllBroadcasted = () => {
  return getRepo().find({
    where: {
      broadcasted: true,
    },
    relations: ["signers"],
  });
};

const findById = (id: number) => {
  return getRepo().findOne({ where: { id: id }, relations: ["signers"] });
};

const create = async (signatureRequest: SignatureRequest) => {
  try {
    const request = await getRepo().save(signatureRequest);
    return request;
  } catch (err) {
    console.log(err);
  }
};

const update = async (signatureRequest: SignatureRequest) => {
  await getRepo().save(signatureRequest);
};

const setAsBroadcasted = async (signatureRequestId: SignatureRequest["id"]) => {
  await getRepo().update({ id: signatureRequestId }, { broadcasted: true });
};

const cleanAllExpired = async () => {
  const expiredLimit = new Date();
  expiredLimit.setDate(
    expiredLimit.getDate() - Config.expiredRequest.cleanExpiredForXDays
  );
  const expiredRequests = await getRepo().find({
    where: { expirationDate: LessThan(expiredLimit), broadcasted: false },
  });
  await SignerRepository.deleteAllForSignatureRequest(
    expiredRequests.map((r) => r.id)
  );
  await getRepo().delete({ id: In(expiredRequests.map((r) => r.id)) });
  Logger.technical(`${expiredRequests.length} expired requests deleted`);
};

const findAllForPublicKey = async (publicKey: string) => {
  return getRepo().find({
    where: {
      signers: { publicKey: publicKey },
    },
    relations: ["signers"],
  });
};

export const SignatureRequestRepository = {
  create,
  update,
  findById,
  findAll,
  setAsBroadcasted,
  findAllPending,
  findAllBroadcasted,
  cleanAllExpired,
  findAllForPublicKey,
};
