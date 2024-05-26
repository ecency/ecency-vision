import { Button } from "@ui/button";
import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@ui/modal";
import { Alert } from "@ui/alert";
import { CodeInput } from "@ui/input";
import { useJoinChat } from "@ecency/ns-query";
import i18next from "i18next";

export function CreateAnAccount() {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");

  const { mutateAsync: joinChat } = useJoinChat();

  return (
    <>
      <Button onClick={() => setStep(1)}>{i18next.t("chat.create-new-account")}</Button>
      {step === 1 && (
        <Modal centered={true} show={[1, 2].includes(step)} onHide={() => setStep(0)}>
          <ModalHeader closeButton={true}>{i18next.t("chat.create-an-account")}</ModalHeader>
          <ModalBody>
            <div className="text-gray-600 mb-4">{i18next.t("chat.create-description")}</div>
            <Alert appearance="primary">{i18next.t("chat.create-pin-description")}</Alert>
            <CodeInput codeSize={8} value={pin} setValue={setPin} />
          </ModalBody>
          <ModalFooter className="flex justify-end items-center gap-3">
            <Button appearance="secondary" onClick={() => setStep(0)}>
              {i18next.t("g.cancel")}
            </Button>
            <Button disabled={pin.length < 8} onClick={() => joinChat(pin)}>
              {i18next.t("chat.create-an-account")}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
