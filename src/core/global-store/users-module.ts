import { User } from "@/entities";
import * as ls from "@/utils/local-storage";
import { decodeObj, encodeObj } from "@/utils";

export function createUsersState() {
  return {
    users: [] as User[]
  };
}

export function createUsersActions() {
  return {
    addUser: (user: User) => {
      ls.set(`user_${user.username}`, encodeObj(user));
      ls.getByPrefix("user_").map((x) => {
        const u = decodeObj(x) as User;
        return {
          username: u.username,
          refreshToken: "",
          accessToken: "",
          expiresIn: u.expiresIn,
          postingKey: u.postingKey
        };
      });
    },
    deleteUser: (username: string) => ls.remove(`user_${username}`)
  };
}
