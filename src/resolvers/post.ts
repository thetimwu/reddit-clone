import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(10, limit);
    const realLimitPlusOne = realLimit + 1; //+1 to construct hasMore logic
    const qb = await getConnection()
      .getRepository(Post)
      .createQueryBuilder("post");

    const _qb = qb
      // .leftJoinAndSelect("post.creator", "user", "post.creatorId = user.id") //using data loader
      .leftJoinAndSelect("post.updoots", "updoot", "updoot.postId = post.id")
      .leftJoinAndMapOne(
        "post.voteStatus",
        "post.updoots",
        "voteStatus",
        `updoot.userId =  ${req.session.userId} and updoot.postId = post.id`
      ) //return Updoot for voteStatus instead of updoot.value due to unsolved query issue
      .orderBy("post.createdAt", "DESC")
      .take(realLimitPlusOne);
    if (cursor) {
      _qb.where("post.createdAt < :cursor", {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await _qb.getMany();
    return {
      hasMore: posts.length === realLimitPlusOne,
      posts: posts.slice(0, realLimit),
    };
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Post | undefined> {
    // return Post.findOne(id, { relations: ["creator"] });
    //cannot get voteStatus with the above method, so redo the posts query process as below to get one post.
    const qb = await getConnection()
      .getRepository(Post)
      .createQueryBuilder("post");

    const _qb = qb
      // .leftJoinAndSelect("post.creator", "user", "post.creatorId = user.id") //using data loader
      .leftJoinAndSelect("post.updoots", "updoot", "updoot.postId = post.id")
      .leftJoinAndMapOne(
        "post.voteStatus",
        "post.updoots",
        "voteStatus",
        `updoot.userId =  ${req.session.userId} and updoot.postId = post.id`
      ) //return Updoot for voteStatus instead of updoot.value due to unsolved query issue
      .where("post.id = :id", { id: id });

    const post = await _qb.getOne();
    return post;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input", () => PostInput) input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    // if (!req.session.userId) {
    //   throw new Error("not authenticated");
    // }
    return Post.create({ ...input, creatorId: req.session.userId }).save(); //Post.create better then createQueryBuilder method eg.in User/register
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("text", () => String, { nullable: true }) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where("id = :id and creatorId = :creatorId", {
        id,
        creatorId: req.session.userId,
      })
      .execute();
    // origin update
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return null;
    // }
    // if (typeof title !== undefined) {
    //   await Post.update({ id }, { title });
    // }

    const post = await Post.findOne(id); //returning("*") not working in MySQL, so mannually return post
    return post!;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    //non cascade way
    // try {
    //   const post = await Post.findOne(id);
    //   if (!post) {
    //     return false;
    //   }

    //   if (post.creatorId !== req.session.userId) {
    //     throw new Error("not authorized");
    //   }

    //   await Updoot.delete({ postId: id }); //delete updoot first to prevent violate foreign key constraint
    //   await Post.delete({ id, creatorId: req.session.userId });
    // } catch (error) {
    //   return false;
    // }
    // return true;

    //cascade way
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { userId, postId } });

    //the user has voted on the post before
    //and they are changing their vote
    if (updoot && updoot.value !== realValue) {
      await Updoot.update(
        {
          postId,
          userId,
        },
        { value: realValue }
      );

      const statValue = realValue === 1 ? "+ 2" : "- 2"; //change original value
      await Post.update(postId, { points: () => `points ${statValue}` });
    } else if (!updoot) {
      //has never voted before
      await Updoot.insert({
        value: realValue,
        userId,
        postId,
      });

      const statValue = realValue === 1 ? "+ 1" : "- 1";
      await getConnection()
        .createQueryBuilder()
        .update(Post)
        .set({ points: () => `points ${statValue}` })
        .where("id = :id", { id: postId })
        .execute();
    }
    return true;
  }
}
