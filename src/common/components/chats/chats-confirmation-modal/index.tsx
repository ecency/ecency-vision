import React from "react";
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../../i18n";

interface Props {
  // actionType: any;
  // step: any;
  onClose: () => void;
  onConfirm: () => void;
  // t: any;
}
const ChatsConfirmationModal = (props: Props) => {
  const { onClose, onConfirm } = props;
  const confirmationModalContent = (
    <>
      <div className="join-community-dialog-header border-bottom">
        <div className="join-community-dialog-titles">
          <h2 className="join-community-main-title">Confirmation</h2>
        </div>
      </div>
      <div className="join-community-dialog-body" style={{ fontSize: "18px", marginTop: "12px" }}>
        Are you sure?
      </div>
      <p className="join-community-confirm-buttons" style={{ textAlign: "right" }}>
        <Button
          variant="outline-primary"
          className="close-btn"
          style={{ marginRight: "20px" }}
          onClick={() => {
            onClose();
          }}
        >
          {_t("chat.close")}
        </Button>
        <Button
          variant="outline-primary"
          className="confirm-btn"
          onClick={() => {
            onConfirm();
          }}
        >
          {_t("chat.confirm")}
        </Button>
      </p>
    </>
  );

  return (
    <Modal
      animation={false}
      show={true}
      centered={true}
      onHide={onClose}
      keyboard={false}
      className="chats-dialog modal-thin-header"
      size="lg"
    >
      <Modal.Header closeButton={true} />
      <Modal.Body className="chat-modals-body">{confirmationModalContent}</Modal.Body>
    </Modal>
  );
};

export default ChatsConfirmationModal;
