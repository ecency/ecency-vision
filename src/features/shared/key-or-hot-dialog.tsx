"use client";

import React, { PropsWithChildren, useState } from "react";
import { PrivateKey } from "@hiveio/dhive";
import PopoverConfirm from "@ui/popover-confirm";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { KeyOrHot } from "@/features/shared/key-or-hot";

interface Props {
  popOver?: boolean;
  onKey: (key: PrivateKey) => void;
  onHot?: () => void;
  onKc?: () => void;
  onToggle?: () => void;
}

export function KeyOrHotDialog({
  children,
  onKey,
  onHot,
  onKc,
  popOver = false,
  onToggle
}: PropsWithChildren<Props>) {
  const [keyDialog, setKeyDialog] = useState(false);

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
    onToggle?.();
  };

  return (
    <>
      {popOver ? (
        <div className="main">
          <PopoverConfirm placement="left" trigger="click" onConfirm={() => toggleKeyDialog()}>
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
          </PopoverConfirm>
        </div>
      ) : (
        children
      )}

      {keyDialog && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          className="key-or-hot-modal"
        >
          <ModalHeader closeButton={true} />
          <ModalBody>
            <KeyOrHot
              onKey={(key) => {
                toggleKeyDialog();
                onKey(key);
              }}
              onHot={() => {
                toggleKeyDialog();
                if (onHot) {
                  onHot();
                }
              }}
              onKc={() => {
                toggleKeyDialog();
                if (onKc) {
                  onKc();
                }
              }}
              inProgress={false}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
