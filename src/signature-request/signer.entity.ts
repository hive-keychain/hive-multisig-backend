import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { SignatureRequest } from "./signature-request.entity";

@Entity({ name: "signer" })
export class Signer {
  @PrimaryColumn()
  publicKey: string;

  @Column("text")
  encryptedTransaction: string;

  @Column()
  weight: number;

  @Column({ nullable: true, default: null })
  signature?: string;

  @Column({ nullable: true, default: false })
  refused?: boolean;

  @ManyToOne(
    () => SignatureRequest,
    (signatureRequest) => signatureRequest.signers,
    { nullable: false }
  )
  signatureRequest: SignatureRequest;
}
