import axios from "axios";
import defaults from "../constants/defaults.json";

import { Global } from "../store/global/types";
import { ActiveUser } from "../store/active-user/types";

export const logUser = (activeUser: ActiveUser | string | undefined, global: Global) => {
  const { lang } = global;
  let username: string;
  if (!activeUser) {
    return;
  }
  if (typeof activeUser === "string") {
    username = activeUser;
  } else {
    // if (activeUser.__loaded) {
    username = activeUser.username;
  }
  try {
    const { appURL } = defaults;
    // should make the server side of this out...
    axios
      .post(`${appURL}/userlog-api`, {
        username,
        lang
      })
      .then(() => {})
      .catch(() => {});
  } catch (e) {}
};

export default logUser;
