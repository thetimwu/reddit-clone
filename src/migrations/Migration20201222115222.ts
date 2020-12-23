import { Migration } from "@mikro-orm/migrations";

//key specification without a key length error, resolved by using varchar instead of text due to uniqueness
export class Migration20201222115222 extends Migration {
  async up(): Promise<void> {
    this.addSql("drop table `user`");
    this.addSql(
      "create table `user` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime not null, `username` varchar(200) not null, `password` text not null) default character set utf8mb4 engine = InnoDB;"
    );
    this.addSql(
      "alter table `user` add unique `user_username_unique`(`username`);"
    );
  }
}
