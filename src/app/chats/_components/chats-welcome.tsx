import React, { useContext, useEffect, useMemo, useState } from "react";
import { CodeInput } from "@ui/input";
import { CreateAnAccount } from "./create-an-account";
import { ChatsImport } from "./chats-import";
import { ChatContext, useKeysQuery, useRestoreChatByPin } from "@ecency/ns-query";
import i18next from "i18next";
import { OrDivider } from "@/features/shared";

export function ChatsWelcome() {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");

  const { hasUserJoinedChat } = useContext(ChatContext);
  const { publicKey } = useKeysQuery();

  const {
    mutateAsync: restoreByPin,
    isError: isRestoreFailed,
    isPending: isRestoreLoading
  } = useRestoreChatByPin();

  const isAlreadyRegisteredInChats = useMemo(() => !!publicKey, [publicKey]);

  useEffect(() => {
    // Handle PIN on account restoring
    if (step === 0 && pin.length === 8) {
      restoreByPin(pin);
    }
  }, [pin, restoreByPin, step]);

  useEffect(() => {
    if (hasUserJoinedChat) {
      setStep(0);
    }
  }, [hasUserJoinedChat]);

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="font-bold">{i18next.t("chat.welcome.title")}</div>
        </div>

        {isAlreadyRegisteredInChats ? (
          <>
            <div className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-center">
              <div>{i18next.t("chat.welcome.already-joined-title")}</div>
              <div>{i18next.t("chat.welcome.already-joined-hint")}</div>
              <CodeInput value={pin} setValue={setPin} codeSize={8} disabled={isRestoreLoading} />
              {isRestoreFailed && (
                <div className="text-red">{i18next.t("chat.welcome.pin-failed")}</div>
              )}
            </div>
            <OrDivider />
            <div className="flex justify-center gap-4">
              <ChatsImport />
              <CreateAnAccount />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-4 text-gray-600 dark:text-gray-400 text-center">
              <div>{i18next.t("chat.welcome.description")}</div>
            </div>
            <div className="flex justify-center gap-4">
              <ChatsImport />
              <CreateAnAccount />
            </div>
          </>
        )}
      </div>
    </>
  );
}
