import { Button } from "@ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@ui/modal";
import { CodeInput, FormControl } from "@ui/input";
import React, { useState } from "react";
import { Alert } from "@ui/alert";
import { useImportChatByKeys } from "@ecency/ns-query";
import i18next from "i18next";

export function ChatsImport() {
  const [step, setStep] = useState(0);
  const [ecencyChatKey, setEcencyChatKey] = useState("");
  const [pin, setPin] = useState("");

  const { mutateAsync: importChatByKey } = useImportChatByKeys();

  return (
    <>
      <Button outline={true} onClick={() => setStep(1)}>
        {i18next.t("chat.import.button")}
      </Button>
      {step === 1 && (
        <Modal centered={true} show={[1, 2].includes(step)} onHide={() => setStep(0)}>
          <ModalHeader closeButton={true}>{i18next.t("chat.import.title")}</ModalHeader>
          <ModalBody>
            <div className="text-gray-600 mb-4">{i18next.t("chat.import.description")}</div>
            <div className="text-sm p-3">{i18next.t("chat.key")}</div>
            <FormControl
              className="mb-4"
              type="text"
              value={ecencyChatKey}
              onChange={(e) => setEcencyChatKey(e.target.value)}
            />
            <Alert appearance="primary">{i18next.t("chat.create-pin-description")}</Alert>
            <CodeInput value={pin} setValue={setPin} codeSize={8} />
          </ModalBody>
          <ModalFooter className="flex justify-end items-center gap-3">
            <Button appearance="secondary" onClick={() => setStep(0)}>
              {i18next.t("g.cancel")}
            </Button>
            <Button
              disabled={!ecencyChatKey || pin.length < 7}
              onClick={() => importChatByKey({ ecencyChatKey, pin })}
            >
              {i18next.t("chat.import.button")}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
