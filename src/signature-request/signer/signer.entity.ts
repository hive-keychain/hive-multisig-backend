import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SignatureRequest } from "../signature-request.entity";

@Entity({ name: "signer" })
export class Signer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  publicKey: string;

  @Column("text")
  encryptedTransaction: string;

  @Column()
  weight: number;

  @Column({ nullable: true, default: null })
  signature?: string;

  @Column({ nullable: true, default: false })
  refused?: boolean;

  @Column({ nullable: true, default: false })
  notified?: boolean;

  @ManyToOne(
    () => SignatureRequest,
    (signatureRequest) => signatureRequest.signers,
    { nullable: false }
  )
  signatureRequest: SignatureRequest;
}
