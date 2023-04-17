import { PrivateKey, KeyRole } from "@hiveio/dhive";
import { formatError } from "../api/operations";
import { error } from "../components/feedback";
import { _t } from "../i18n";
import { ActiveUser } from "../store/active-user/types";
import { UserKeys } from "../store/users/types";

export const generateKeys = (activeUser: ActiveUser, password: string): UserKeys => {
  if (!activeUser.data.__loaded) {
    return {};
  }

  const newPrivateKeys = { active: "", memo: "", owner: "", posting: "" };
  let keyCheck = "";

  try {
    ["owner", "active", "posting", "memo"].forEach((r) => {
      const k = PrivateKey.fromLogin(activeUser.username, password, r as KeyRole);
      newPrivateKeys[r] = k.toString();
      if (r === "memo") keyCheck = k.createPublic().toString();
    });
  } catch (err) {
    error(...formatError(err));
  }

  if (activeUser.data.memo_key !== keyCheck) {
    error(_t("view-keys.error"));
    return {};
  } else {
    return newPrivateKeys;
  }
};
