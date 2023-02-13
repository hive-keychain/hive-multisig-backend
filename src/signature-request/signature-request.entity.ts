import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Signer } from "./signer.entity";

@Entity({ name: "signature-request" })
export class SignatureRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expirationDate: Date;

  @Column()
  threshold: number;

  @Column()
  locked: boolean;

  @Column()
  answered: boolean;

  @OneToMany(() => Signer, (signer) => signer.id)
  signers: Signer[];
}
