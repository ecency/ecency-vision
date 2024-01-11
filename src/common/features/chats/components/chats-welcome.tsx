import React, { useContext, useEffect, useMemo, useState } from "react";
import { _t } from "../../../i18n";
import { CodeInput } from "@ui/input";
import OrDivider from "../../../components/or-divider";
import { useGetAccountFullQuery } from "../../../api/queries";
import { useMappedStore } from "../../../store/use-mapped-store";
import { CreateAnAccount } from "./create-an-account";
import { ChatsImport } from "./chats-import";
import { ChatContext, getUserChatPublicKey, useRestoreChatByPin } from "@ecency/ns-query";

export function ChatsWelcome() {
  const { activeUser } = useMappedStore();

  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");

  const { hasUserJoinedChat } = useContext(ChatContext);
  const { data: fullAccount } = useGetAccountFullQuery(activeUser?.username);

  const {
    mutateAsync: restoreByPin,
    isError: isRestoreFailed,
    isLoading: isRestoreLoading
  } = useRestoreChatByPin();

  const isAlreadyRegisteredInChats = useMemo(() => {
    if (!fullAccount) {
      return false;
    }
    const publicKey = getUserChatPublicKey(fullAccount);
    return !!publicKey;
  }, [fullAccount]);

  useEffect(() => {
    // Handle PIN on account restoring
    if (step === 0 && pin.length === 8) {
      restoreByPin(pin);
    }
  }, [pin]);

  useEffect(() => {
    if (hasUserJoinedChat) {
      setStep(0);
    }
  }, [hasUserJoinedChat]);

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center mb-6">
          <div className="font-bold">{_t("chat.welcome.title")}</div>
        </div>

        {isAlreadyRegisteredInChats ? (
          <>
            <div className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-center">
              <div>{_t("chat.welcome.already-joined-title")}</div>
              <div>{_t("chat.welcome.already-joined-hint")}</div>
              <CodeInput value={pin} setValue={setPin} codeSize={8} disabled={isRestoreLoading} />
              {isRestoreFailed && <div className="text-red">{_t("chat.welcome.pin-failed")}</div>}
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
              <div>{_t("chat.welcome.description")}</div>
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
