import { KeyRole, PrivateKey } from "@hiveio/dhive";
import { formatError } from "../api/operations";
import { error } from "../components/feedback";
import { ActiveUser, UserKeys } from "@/entities";
import i18next from "i18next";

export function generateKeys(activeUser: ActiveUser, password: string): UserKeys {
  if (!activeUser.data.__loaded) {
    return {};
  }

  const newPrivateKeys: Record<string, string> = { active: "", memo: "", owner: "", posting: "" };
  let keyCheck = "";

  try {
    Object.keys(newPrivateKeys).forEach((r) => {
      const k = PrivateKey.fromLogin(activeUser.username, password, r as KeyRole);
      newPrivateKeys[r] = k.toString();
      if (r === "memo") keyCheck = k.createPublic().toString();
    });
  } catch (err) {
    error(...formatError(err));
  }

  if (activeUser.data.memo_key !== keyCheck) {
    error(i18next.t("view-keys.error"));
    return {};
  } else {
    return newPrivateKeys;
  }
}
