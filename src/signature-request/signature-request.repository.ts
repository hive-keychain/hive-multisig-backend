import { DatabaseModule } from "../database/typeorm";
import { SignatureRequest } from "./signature-request.entity";

const getRepo = () => {
  return DatabaseModule.getDatabase().getRepository(SignatureRequest);
};

const findAll = () => {
  return getRepo().find({ relations: ["signers"] });
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

export const SignatureRequestRepository = {
  create,
  update,
  findById,
  findAll,
};
