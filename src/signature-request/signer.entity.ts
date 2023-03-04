import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { SignatureRequest } from "./signature-request.entity";

@Entity({ name: "signer" })
export class Signer {
  @PrimaryColumn()
  publicKey: string;

  @Column()
  encryptedTransaction: string;

  @Column()
  weight: number;

  @Column()
  signature?: string;

  @Column()
  refused?: boolean;

  @ManyToOne(
    () => SignatureRequest,
    (signatureRequest) => signatureRequest.signers
  )
  signatureRequest: SignatureRequest;
}
