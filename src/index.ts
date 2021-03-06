import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { MyContext } from "./types";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./resolvers/utils/createUserLoader";
import { createUpdootLoader } from "./resolvers/utils/createUpdootLoader";
// import "dotenv-safe"; //for env only

const main = async () => {
  const conn = await createConnection({
    type: "mysql",
    database: "lireddit2",
    username: "root",
    password: "root",
    // url:process.env.DATABASE_URL
    logging: true,
    synchronize: true, //automatic run migration if true, delete this line in production
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });

  await conn.runMigrations();

  // await Post.delete({}); //delete all posts

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = new Redis();

  //get cookie working in proxy environment like nginx,
  //app.set('trust proxy',1)

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTTL: true,
        disableTouch: true, //disableTouch makes redis valid forever which reduce app to access redis
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, //cookie only works in https
        //domain:  __prod__ ? ".example.com" : undefined,   //add if see cookie problems
      },
      saveUninitialized: false, //create a session by default
      secret: "my secret", //may add process.env.SECRET
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redisClient,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  //parseInt(process.env.PORT)
  app.listen(4000, () => {
    console.log("lireddit server listening at port 4000: ");
  });
};

main().catch((err) => {
  console.error(err);
});
