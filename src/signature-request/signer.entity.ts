import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "signer" })
export class Signer {
  @PrimaryColumn()
  username: string;

  @Column()
  encryptedTransaction: string;

  @Column()
  weight: number;

  @Column()
  signature?: string;

  @Column()
  refused?: boolean;
}
