import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value: number;

  @Field(() => Int) //infer type
  @PrimaryColumn({ type: "int" })
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @Field(() => Int)
  @PrimaryColumn({ type: "int" })
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots)
  post: Post;
}
