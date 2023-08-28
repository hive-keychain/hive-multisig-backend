import { KeychainKeyTypes } from "hive-keychain-commons";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Signer } from "./signer/signer.entity";

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
  initiator: string;

  @Column()
  initiatorPublicKey: string;

  @Column()
  locked: boolean;

  @Column()
  broadcasted?: boolean;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updatedAt?: Date;

  @OneToMany(() => Signer, (signer) => signer.signatureRequest, {
    cascade: true,
  })
  signers: Signer[];
}
