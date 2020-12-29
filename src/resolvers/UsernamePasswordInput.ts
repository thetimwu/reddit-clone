import { Field, InputType } from "type-graphql";

//import { EntityManager } from "@mikro-orm/mysql";
//EntityManager querybuild to write sql in case of orm error
//eg. [user] = await(em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({username...}).returning("*")
//another way to add arguments
@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}
