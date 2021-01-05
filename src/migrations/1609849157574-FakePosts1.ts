import { MigrationInterface, QueryRunner } from "typeorm";

export class FakePosts11609849157574 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into post (title, text, creatorId) values ('The Puzzle', 'amet justo morbi ut odio cras mi pede malesuada in imperdiet et commodo vulputate justo in blandit ultrices enim lorem', 1);
        `);

    await queryRunner.query(`
        insert into post (title, text, creatorId) values ('Auschwitz: The Nazis and the ''Final Solution''', 'ullamcorper augue a suscipit nulla elit ac nulla sed vel enim sit amet', 1);
        `);

    await queryRunner.query(`
        insert into post (title, text, creatorId) values ('Attack on the Iron Coast', 'id mauris vulputate elementum nullam varius nulla facilisi cras non velit nec nisi', 1);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE * from Post
        `);
  }
}
