import { KeychainKeyTypes } from "hive-keychain-commons";
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
  keyType: KeychainKeyTypes;

  @Column()
  locked: boolean;

  @Column()
  broadcasted?: boolean;

  @OneToMany(() => Signer, (signer) => signer.publicKey)
  signers: Signer[];
}
