import { Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import React from "react";
import { ErrorFeedbackObject } from "../feedback";
import { ErrorTypes } from "../../enums";
import { InsufficientResourceCreditsDetails } from "./insufficient-resource-credits-details";
import { CommonDetails } from "./common-details";
import { ActiveUser } from "../../store/active-user/types";
import "./_index.scss";

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
      onHide={setShow}
      keyboard={false}
      className="purchase-qr-dialog"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>{_t("feedback-modal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{getErrorContent()}</Modal.Body>
    </Modal>
  );
};
