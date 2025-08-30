import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToUser1717690000 implements MigrationInterface {
    name = 'AddStatusToUser1717690000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "status" character varying NOT NULL DEFAULT 'ACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    }
} 