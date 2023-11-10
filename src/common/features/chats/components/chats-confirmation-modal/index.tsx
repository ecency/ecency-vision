import React, { useContext, useEffect, useState } from "react";
import { _t } from "../../../../i18n";
import LinearProgress from "../../../../components/linear-progress";
import { ChatContext } from "../../chat-context-provider";

import "./index.scss";
import { Button } from "@ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@ui/modal";

interface Props {
  actionType: string;
  content: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ChatsConfirmationModal = (props: Props) => {
  const { onClose, onConfirm, content, actionType } = props;
  const { hasUserJoinedChat } = useContext(ChatContext);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    if (hasUserJoinedChat && inProgress) {
      setInProgress(false);
    }
  }, [hasUserJoinedChat]);
  const confirmationModalContent = (
    <>
      <div className="join-community-dialog-header border-bottom">
        <div className="join-community-dialog-titles">
          <h2 className="join-community-main-title">{actionType}</h2>
        </div>
      </div>
      {inProgress && <LinearProgress />}
      <div className="join-community-dialog-body">{content}</div>
    </>
  );

  return (
    <Modal
      animation={false}
      show={true}
      centered={true}
      onHide={onClose}
      className="chats-dialog"
      size="lg"
    >
      <ModalHeader thin={true} closeButton={true} />
      <ModalBody className="chat-modals-body">{confirmationModalContent}</ModalBody>
      <ModalFooter className="flex justify-end gap-4 items-center">
        <Button
          outline={true}
          className="close-btn"
          onClick={() => {
            onClose();
          }}
        >
          {_t("chat.close")}
        </Button>
        <Button
          className="confirm-btn"
          onClick={() => {
            setInProgress(true);
            onConfirm();
          }}
        >
          {_t("chat.confirm")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ChatsConfirmationModal;
