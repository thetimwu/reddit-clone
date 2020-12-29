import { Migration } from "@mikro-orm/migrations";

export class Migration20201228204131 extends Migration {
  async up(): Promise<void> {
    // this.addSql("alter table `user` add `email` varchar(200) not null;");
    // this.addSql("alter table `user` add unique `user_email_unique`(`email`);");
  }
}
