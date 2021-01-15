import DataLoader from "dataloader";
import { User } from "../../entities/User";

//key: eg. [1, 78, 9, 8]
//expect: [{id: 1, username: "tim"}, {}, {},{}]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((user) => {
      userIdToUser[user.id] = user;
    });
    return userIds.map((userId) => userIdToUser[userId]);
  });
