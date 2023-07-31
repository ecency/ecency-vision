import { _t } from "../../i18n";
import React from "react";
import { ErrorFeedbackObject } from "../feedback";
import { ErrorTypes } from "../../enums";
import { InsufficientResourceCreditsDetails } from "./insufficient-resource-credits-details";
import { CommonDetails } from "./common-details";
import { ActiveUser } from "../../store/active-user/types";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "../modal";

interface Props {
  activeUser: ActiveUser | null;
  instance: ErrorFeedbackObject;
  show: boolean;
  setShow: (value: boolean) => void;
}

export const FeedbackModal = ({ show, setShow, instance, activeUser }: Props) => {
  const getErrorContent = () => {
    switch (instance.errorType) {
      case ErrorTypes.COMMON:
        return <CommonDetails instance={instance} />;
      case ErrorTypes.INSUFFICIENT_RESOURCE_CREDITS:
        return <InsufficientResourceCreditsDetails activeUser={activeUser} />;
      default:
        return <></>;
    }
  };

  return (
    <Modal
      animation={false}
      show={show}
      centered={true}
      onHide={() => setShow(false)}
      className="purchase-qr-dialog"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{_t("feedback-modal.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>{getErrorContent()}</ModalBody>
    </Modal>
  );
};
