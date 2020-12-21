import { Migration } from '@mikro-orm/migrations';

export class Migration20201221002421 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `post` (`id` int unsigned not null auto_increment primary key, `created_at` json not null, `updated_at` json not null, `title` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
  }

}
