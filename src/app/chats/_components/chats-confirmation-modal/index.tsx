import React, { useContext, useEffect, useState } from "react";

import "./index.scss";
import { Button } from "@ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@ui/modal";
import { ChatContext } from "@ecency/ns-query";
import { LinearProgress } from "@/features/shared";
import i18next from "i18next";

interface Props {
  actionType: string;
  content: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ChatsConfirmationModal = (props: Props) => {
  const { onClose, onConfirm, content, actionType } = props;
  const { hasUserJoinedChat } = useContext(ChatContext);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    if (hasUserJoinedChat && inProgress) {
      setInProgress(false);
    }
  }, [hasUserJoinedChat, inProgress]);
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
    <Modal show={true} centered={true} onHide={onClose} className="chats-dialog" size="lg">
      <ModalHeader thin={true} closeButton={true} />
      <ModalBody className="chat-modals-body">{confirmationModalContent}</ModalBody>
      <ModalFooter className="flex justify-end gap-4 items-center">
        <Button
          outline={true}
          onClick={() => {
            onClose();
          }}
        >
          {i18next.t("chat.close")}
        </Button>
        <Button
          onClick={() => {
            setInProgress(true);
            onConfirm();
          }}
        >
          {i18next.t("chat.confirm")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
