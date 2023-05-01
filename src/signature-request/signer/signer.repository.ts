import { In } from "typeorm";
import { DatabaseModule } from "../../database/typeorm";
import { SignatureRequest } from "../signature-request.entity";
import { Signer } from "./signer.entity";

const getRepo = () => {
  return DatabaseModule.getDatabase().getRepository(Signer);
};

const saveSignature = async (id: number, signature: string) => {
  await getRepo().update({ id: id }, { signature });
};

const refuseTransaction = async (id: number) => {
  await getRepo().update({ id: id }, { refused: true });
};

const setAsNotified = async (id: number) => {
  await getRepo().update({ id: id }, { notified: true });
};

const setAllAsNotifiedForPublicKey = async (publicKey: string) => {
  await getRepo().update({ publicKey: publicKey }, { notified: true });
};

const deleteAllForSignatureRequest = async (
  signatureRequestIds: SignatureRequest["id"][]
) => {
  await getRepo().delete({ signatureRequest: In(signatureRequestIds) });
};

export const SignerRepository = {
  saveSignature,
  refuseTransaction,
  setAsNotified,
  setAllAsNotifiedForPublicKey,
  deleteAllForSignatureRequest,
};
