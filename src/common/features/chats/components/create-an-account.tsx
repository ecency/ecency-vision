import { _t } from "../../../i18n";
import { Button } from "@ui/button";
import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@ui/modal";
import { Alert } from "@ui/alert";
import { CodeInput } from "@ui/input";
import { useJoinChat } from "@ecency/ns-query";
import { uploadChatKeys } from "../utils/upload-chat-keys";

export function CreateAnAccount() {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");

  const { mutateAsync: joinChat } = useJoinChat(uploadChatKeys);

  return (
    <>
      <Button onClick={() => setStep(1)}>{_t("chat.create-new-account")}</Button>
      {step === 1 && (
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
            <Button disabled={pin.length < 8} onClick={() => joinChat(pin)}>
              {_t("chat.create-an-account")}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
