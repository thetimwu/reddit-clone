//not working properly, modify MyContext type instead
declare module "express-session" {
  interface SessionData {
    cookie: Cookie;
    userId: number;
  }
}

export default "express-session";
