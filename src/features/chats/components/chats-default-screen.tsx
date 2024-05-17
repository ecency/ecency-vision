import { Alert } from "@ui/alert";
import { Button } from "@ui/button";
import moment from "moment";
import React, { HTMLProps, useContext, useMemo } from "react";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { ChatContext } from "@ecency/ns-query";
import { useGlobalStore } from "@/core/global-store";
import { PREFIX } from "@/utils/local-storage";
import { classNameObject } from "@ui/util";
import i18next from "i18next";

export function ChatsDefaultScreen(props: HTMLProps<HTMLDivElement>) {
  const activeUser = useGlobalStore((state) => state.activeUser);
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
        "flex flex-col justify-center items-center px-4 w-full pt-6 md:pt-0 md:h-full": true,
        [props.className ?? ""]: !!props.className
      })}
    >
      <div className="text-xl text-blue-dark-sky mb-4 font-semibold">
        {i18next.t("chat.welcome.hello")}, @{activeUser?.username}
      </div>
      <div>{i18next.t("chat.welcome.start-description")}</div>
      {isLastKeysSavingTimeExpired && (
        <Alert appearance="primary" className="max-w-[550px] flex items-center mt-4 gap-4">
          <span>{i18next.t("chat.warn-key-saving")}</span>
          <Button
            className="whitespace-nowrap"
            onClick={() => {
              setRevealPrivateKey(true);
              setLastKeysSaving(moment().toDate().toISOString());
            }}
          >
            {i18next.t("chat.view-and-save")}
          </Button>
        </Alert>
      )}
    </div>
  );
}
