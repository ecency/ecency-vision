import React, { useContext, useEffect, useState } from "react";
import { _t } from "../../../i18n";
import { keySvg } from "../../../img/svg";
import { ChatContext } from "../chat-context-provider";
import LinearProgress from "../../../components/linear-progress";
import ChatsConfirmationModal from "./chats-confirmation-modal";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { FormControl, InputGroup } from "@ui/input";
import { useImportChatByKey, useJoinChat } from "../mutations";
import OrDivider from "../../../components/or-divider";

export function ChatsImport() {
  const [showImportChats, setShowImportChats] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const { hasUserJoinedChat } = useContext(ChatContext);
  const { mutateAsync: joinChat } = useJoinChat();

  const { mutateAsync: importChatByKey, isLoading, error: importError } = useImportChatByKey();

  useEffect(() => {
    if (importError) {
      setError(_t("chat.invalid-private-key"));
    }
  }, [importError]);

  useEffect(() => {
    if (hasUserJoinedChat) {
      setStep(0);
    }
  }, [hasUserJoinedChat]);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        {showImportChats && (
          <div className="private-key" style={{ margin: "15px 10px" }}>
            <Form onSubmit={(e: React.FormEvent) => e.preventDefault()}>
              <InputGroup
                prepend={keySvg}
                append={
                  <Button onClick={() => importChatByKey({ key: privateKeyInput })}>
                    {_t("chat.submit")}
                  </Button>
                }
              >
                <FormControl
                  value={privateKeyInput}
                  type="password"
                  autoFocus={true}
                  autoComplete="off"
                  placeholder={_t("chat.enter-private-key")}
                  aria-invalid={!!error}
                  onChange={(e) => {
                    setPrivateKeyInput(e.target.value);
                    setError("");
                  }}
                />
              </InputGroup>
              {isLoading && <LinearProgress />}
              {error && <div className="text-red text-xs p-4">{error}</div>}
            </Form>
          </div>
        )}
        <Button onClick={() => setShowImportChats(!showImportChats)}>
          {_t("chat.import-chat")}
        </Button>
        <OrDivider />
        <div className="flex justify-center">
          <Button onClick={() => setStep(1)}>{_t("chat.create-new-account")}</Button>
        </div>
      </div>
      {step !== 0 && (
        <ChatsConfirmationModal
          actionType={"Warning"}
          content={"creating new account will reset your chats"}
          onClose={() => {
            setStep(0);
          }}
          onConfirm={() => joinChat()}
        />
      )}
    </>
  );
}
