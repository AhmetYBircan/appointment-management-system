import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedUpdatedBy1751325203458 implements MigrationInterface {
    name = 'AddCreatedUpdatedBy1751325203458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "createdBy" uuid`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "updatedBy" uuid`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "createdBy" uuid`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "updatedBy" uuid`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_eba61ea8dbd1d62db81cb7913ab" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2a49fad23707bdffdec5a20fdba" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_97d83f20a09181645dbb3b9b48f" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_ad212ba666bc8508e4fde25c30e" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_ad212ba666bc8508e4fde25c30e"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_97d83f20a09181645dbb3b9b48f"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2a49fad23707bdffdec5a20fdba"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_eba61ea8dbd1d62db81cb7913ab"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "updatedBy"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "updatedBy"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "createdBy"`);
    }

}
