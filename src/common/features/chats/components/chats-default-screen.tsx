import { _t } from "../../../i18n";
import { Alert } from "@ui/alert";
import { Button } from "@ui/button";
import moment from "moment";
import React, { HTMLProps, useContext, useMemo } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { classNameObject } from "../../../helper/class-name-object";
import { ChatContext } from "@ecency/ns-query";

export function ChatsDefaultScreen(props: HTMLProps<HTMLDivElement>) {
  const { activeUser } = useMappedStore();
  const { setRevealPrivateKey } = useContext(ChatContext);

  const [lastKeysSavingTime, setLastKeysSaving] = useLocalStorage<string>(PREFIX + "_chats_lkst");

  // We offer user to save account credentials each month
  const isLastKeysSavingTimeExpired = useMemo(
    () =>
      lastKeysSavingTime
        ? moment(new Date(lastKeysSavingTime)).isBefore(moment().subtract(30, "days"))
        : true,
    [lastKeysSavingTime]
  );

  return (
    <div
      {...props}
      className={classNameObject({
        "flex flex-col justify-center items-center px-4 w-full h-full": true,
        [props.className ?? ""]: !!props.className
      })}
    >
      <div className="text-xl text-blue-dark-sky mb-4 font-semibold">
        {_t("chat.welcome.hello")}, @{activeUser?.username}
      </div>
      <div>{_t("chat.welcome.start-description")}</div>
      {isLastKeysSavingTimeExpired && (
        <Alert appearance="primary" className="max-w-[550px] flex items-center mt-4 gap-4">
          <span>{_t("chat.warn-key-saving")}</span>
          <Button
            className="whitespace-nowrap"
            onClick={() => {
              setRevealPrivateKey(true);
              setLastKeysSaving(moment().toDate().toISOString());
            }}
          >
            {_t("chat.view-and-save")}
          </Button>
        </Alert>
      )}
    </div>
  );
}
