import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class Add2FAFieldInSigner1707977308580 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "signer",
      new TableColumn({
        name: "twoFACode",
        type: "varchar(55)",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
