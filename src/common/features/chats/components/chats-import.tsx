import React, { useContext, useEffect, useState } from "react";
import { _t } from "../../../i18n";
import { keySvg } from "../../../img/svg";
import { ChatContext } from "../chat-context-provider";
import LinearProgress from "../../../components/linear-progress";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { CodeInput, FormControl, InputGroup } from "@ui/input";
import { useImportChatByKey, useJoinChat } from "../mutations";
import OrDivider from "../../../components/or-divider";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@ui/modal";
import { Alert } from "@ui/alert";

export function ChatsImport() {
  const [showImportChats, setShowImportChats] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");

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
        <Modal centered={true} show={[1, 2].includes(step)} onHide={() => setStep(0)}>
          <ModalHeader closeButton={true}>{_t("chat.create-an-account")}</ModalHeader>
          <ModalBody>
            <div className="text-gray-600 mb-4">{_t("chat.create-description")}</div>
            <Alert appearance="primary">{_t("chat.create-pin-description")}</Alert>
            <CodeInput codeSize={8} value={pin} setValue={setPin} />
          </ModalBody>
          <ModalFooter className="flex justify-end items-center gap-3">
            <Button appearance="secondary" onClick={() => setStep(0)}>
              {_t("g.cancel")}
            </Button>
            <Button disabled={pin.length < 6} onClick={() => joinChat(pin)}>
              {_t("chat.create-an-account")}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
