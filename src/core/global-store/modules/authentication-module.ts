import { Account, ActiveUser } from "@/entities";
import * as ls from "@/utils/local-storage";
import Cookies from "js-cookie";
import { activeUserMaker } from "@/utils";
import { error } from "@/features/shared";
import { formatError } from "@/api/operations";
import { getAccountFullQuery } from "@/api/queries";

const load = (): ActiveUser | null => {
  const name = ls.get("active_user");
  if (name && ls.get(`user_${name}`)) {
    return activeUserMaker(name);
  }

  return null;
};

export function createAuthenticationState() {
  return {
    activeUser: null as ActiveUser | null
  };
}

async function populateActiveUserByApi(activeUser: ActiveUser) {
  const fallback = {
    name: activeUser.username
  };
  try {
    const response = await getAccountFullQuery(activeUser.username).prefetch();
    if (!response) {
      return fallback;
    }

    return response;
  } catch (e) {
    return fallback;
  }
}

export type AuthenticationState = ReturnType<typeof createAuthenticationState>;

export const createAuthenticationActions = (
  set: (state: Partial<AuthenticationState>) => void,
  getState: () => AuthenticationState
) => ({
  updateActiveUser: async (data?: Account) => {
    const { activeUser } = getState();
    if (!activeUser) {
      error(...formatError("Cannot update non-active user"));
      return;
    }

    set({
      activeUser: {
        data: data ?? (await populateActiveUserByApi(activeUser)),
        username: activeUser.username
      }
    });
  },
  setActiveUser: (name: string | null) => {
    if (name) {
      ls.set("active_user", name);
      Cookies.set("active_user", name, { expires: 365 });
      set({ activeUser: load() });
    } else {
      ls.remove("active_user");
      Cookies.remove("active_user");
      set({ activeUser: load() });
    }
  }
});
