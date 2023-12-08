import { Account, ActiveUser, UserPoints } from "@/entities";
import * as ls from "@/utils/local-storage";
import Cookies from "js-cookie";
import { activeUserMaker } from "@/utils";
import { getAccount } from "@/api/hive";
import { getPoints } from "@/api/private-api";

const load = (): ActiveUser | null => {
  const name = ls.get("active_user");
  if (name && ls.get(`user_${name}`)) {
    return activeUserMaker(name);
  }

  return null;
};

export function createActiveUserState() {
  return {
    activeUser: null as ActiveUser | null
  };
}

export type ActiveUserState = ReturnType<typeof createActiveUserState>;

export function createActiveUserActions(
  set: (state: Partial<ActiveUserState>) => void,
  getState: () => ActiveUserState
) {
  return {
    updateActiveUser: async (data?: Account) => {
      const { activeUser } = getState();
      if (!activeUser) {
        return;
      }

      let uData: Account | undefined = data;
      if (!uData) {
        try {
          uData = await getAccount(activeUser.username);
        } catch (e) {
          uData = {
            name: activeUser.username
          };
        }
      }

      let points: UserPoints;
      try {
        const r = await getPoints(activeUser.username);
        points = {
          points: r.points,
          uPoints: r.unclaimed_points
        };
      } catch (e) {
        points = {
          points: "0.000",
          uPoints: "0.000"
        };
      }
      set(Object.assign({}, getState(), { uData, points }));
    },
    setActiveUser: (name: string | null) => {
      if (name) {
        ls.set("active_user", name);
        Cookies.set("active_user", name, { expires: 365 });
        load();
      } else {
        ls.remove("active_user");
        Cookies.remove("active_user");
        load();
      }
    }
  };
}
