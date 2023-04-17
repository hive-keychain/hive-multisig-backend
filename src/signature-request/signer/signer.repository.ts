import { DatabaseModule } from "../../database/typeorm";
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

export const SignerRepository = {
  saveSignature,
  refuseTransaction,
};
