import React from "react";
import { InsufficientResourceCreditsDetails } from "./insufficient-resource-credits-details";
import { CommonDetails } from "./common-details";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { ErrorFeedbackObject } from "@/features/shared";
import { ErrorTypes } from "@/enums";
import i18next from "i18next";

interface Props {
  instance: ErrorFeedbackObject;
  show: boolean;
  setShow: (value: boolean) => void;
}

export const FeedbackModal = ({ show, setShow, instance }: Props) => {
  const getErrorContent = () => {
    switch (instance.errorType) {
      case ErrorTypes.COMMON:
        return <CommonDetails instance={instance} />;
      case ErrorTypes.INSUFFICIENT_RESOURCE_CREDITS:
        return <InsufficientResourceCreditsDetails />;
      default:
        return <></>;
    }
  };

  return (
    <Modal show={show} centered={true} onHide={() => setShow(false)} className="purchase-qr-dialog">
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("feedback-modal.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>{getErrorContent()}</ModalBody>
    </Modal>
  );
};
