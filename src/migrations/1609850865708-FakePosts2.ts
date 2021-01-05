import { MigrationInterface, QueryRunner } from "typeorm";

export class FakePosts21609850865708 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //cannot run multiple insert sql in mySql
    //but mulitple insert into table works in PLSql
    for (let i = 0; i < 20; i++) {
      await queryRunner.query(`
            insert into post (title, text, creatorId) values ('Bird ${i}', '${i} Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis.', 1);
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE * from Post
        `);
  }
}
