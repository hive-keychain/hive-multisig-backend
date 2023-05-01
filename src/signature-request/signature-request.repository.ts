import { MoreThan } from "typeorm";
import { DatabaseModule } from "../database/typeorm";
import { SignatureRequest } from "./signature-request.entity";

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

export const SignatureRequestRepository = {
  create,
  update,
  findById,
  findAll,
  setAsBroadcasted,
  findAllPending,
  findAllBroadcasted,
};
