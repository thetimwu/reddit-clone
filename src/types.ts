import { Request, Response } from "express";
import Redis from "ioredis";
import { createUserLoader } from "./resolvers/utils/createUserLoader";
import { createUpdootLoader } from "./resolvers/utils/createUpdootLoader";

export type MyContext = {
  req: Request & { session: { userId?: number } }; //& { session?: Express.Session }
  res: Response;
  redisClient: Redis.Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
