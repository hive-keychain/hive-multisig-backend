import { DatabaseModule } from "../database/typeorm";
import { SignatureRequest } from "./signature-request.entity";
import { Signer } from "./signer.entity";

const getRepo = () => {
  return DatabaseModule.getDatabase().getRepository(SignatureRequest);
};
const getSignerRepo = () => {
  return DatabaseModule.getDatabase().getRepository(Signer);
};

const findAll = () => {
  return getRepo().find();
};

const findById = (id: number) => {
  return getRepo().findOne({ where: { id: id } });
};

const create = async (signatureRequest: SignatureRequest) => {
  try {
    const request = await getRepo().save(signatureRequest);
    return request;
  } catch (err) {
    console.log(err);
  }
};

export const SignatureRequestRepository = {
  create,
  findById,
  findAll,
};
