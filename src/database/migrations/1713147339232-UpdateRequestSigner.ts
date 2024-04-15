import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateRequestSigner1713147339232 implements MigrationInterface {
  name = "UpdateRequestSigner1713147339232";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("signer", "twoFACode");
    await queryRunner.addColumn(
      "signer",
      new TableColumn({
        name: "metaData",
        type: "varchar(255)",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
