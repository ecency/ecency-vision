import React from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "@ui/modal";
import { _t } from "../../../i18n";
import { usePollsCreationManagement } from "../hooks";
import { FormControl, InputGroup } from "@ui/input";
import { UilPanelAdd, UilPlus, UilQuestionCircle, UilTrash } from "@iconscout/react-unicons";
import { Button } from "@ui/button";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
}

export function PollsCreation({ show, setShow }: Props) {
  const {
    title,
    setTitle,
    choices,
    pushChoice,
    deleteChoiceByIndex,
    updateChoiceByIndex,
    hasEmptyOrDuplicatedChoices,
    accountAge,
    setAccountAge
  } = usePollsCreationManagement();

  return (
    <Modal
      show={show}
      centered={true}
      onHide={() => setShow(false)}
      className="polls-creation-modal"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{_t("polls.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-6">
          <InputGroup prepend={<UilQuestionCircle />}>
            <FormControl
              placeholder={_t("polls.title-placeholder")}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </InputGroup>

          <div className="flex flex-col gap-4 items-start mb-6">
            <div>{_t("polls.choices")}</div>
            {choices?.map((choice, key) => (
              <div key={key} className="w-full flex items-center gap-4">
                <InputGroup prepend={key + 1}>
                  <FormControl
                    placeholder={_t("polls.choice-placeholder", { n: key + 1 })}
                    type="text"
                    value={choice}
                    onChange={(e) => updateChoiceByIndex(e.target.value, key)}
                  />
                </InputGroup>
                <Button
                  size="sm"
                  onClick={() => deleteChoiceByIndex(key)}
                  appearance="gray-link"
                  icon={<UilTrash />}
                />
              </div>
            ))}
          </div>
          {hasEmptyOrDuplicatedChoices && (
            <div className="text-sm opacity-75 text-center pb-4">{_t("polls.polls-form-hint")}</div>
          )}
        </div>
        <div className="flex flex-col gap-4 items-start">
          <div>{_t("polls.options")}</div>
          <div className="text-sm opacity-50">{_t("polls.account-age")}</div>
          <FormControl
            placeholder="100"
            type="number"
            min={0}
            max={200}
            value={accountAge}
            onChange={(e) => {
              const value = +e.target.value;
              if (value >= 0 && value <= 200) {
                setAccountAge(+e.target.value);
              } else if (value < 0) {
                setAccountAge(0);
              } else {
                setAccountAge(200);
              }
            }}
          />
        </div>
      </ModalBody>
      <ModalFooter sticky={true}>
        <div className="flex justify-between">
          <Button
            icon={<UilPlus />}
            iconPlacement="left"
            onClick={() => pushChoice("")}
            outline={true}
          >
            {_t("polls.add-choice")}
          </Button>
          <Button
            icon={<UilPanelAdd />}
            disabled={hasEmptyOrDuplicatedChoices || !title || typeof accountAge !== "number"}
            iconPlacement="left"
            onClick={() => pushChoice("")}
          >
            {_t("polls.attach")}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
