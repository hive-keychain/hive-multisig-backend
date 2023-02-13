import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "signer" })
export class Signer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  encryptedTransaction: string;

  @Column()
  publicKey: string;

  @Column()
  weight: number;

  @Column()
  signature?: string;

  @Column()
  refused?: boolean;
}
