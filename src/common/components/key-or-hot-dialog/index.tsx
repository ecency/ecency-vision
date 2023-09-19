import React, { Component } from "react";
import { PrivateKey } from "@hiveio/dhive";

import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";

import KeyOrHot from "../key-or-hot";

import PopoverConfirm from "@ui/popover-confirm";
import "./index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";

interface Props {
  global: Global;
  activeUser: ActiveUser;
  signingKey: string;
  popOver?: boolean;
  setSigningKey: (key: string) => void;
  children: JSX.Element;
  onKey: (key: PrivateKey) => void;
  onHot?: () => void;
  onKc?: () => void;
  onToggle?: () => void;
}

interface State {
  keyDialog: boolean;
}

export class KeyOrHotDialog extends Component<Props, State> {
  static defaultProps: { popOver: boolean };

  state: State = {
    keyDialog: false
  };

  toggleKeyDialog = () => {
    const { keyDialog } = this.state;
    this.setState({ keyDialog: !keyDialog });

    const { onToggle } = this.props;
    if (onToggle) onToggle();
  };

  render() {
    const { children, onKey, onHot, onKc, popOver } = this.props;
    const { keyDialog } = this.state;

    const newChildren = React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        return !popOver && this.toggleKeyDialog();
      }
    });

    return (
      <>
        {popOver ? (
          <div className="main">
            <PopoverConfirm
              placement="left"
              trigger="click"
              onConfirm={() => this.toggleKeyDialog()}
            >
              <div onClick={(e) => e.stopPropagation()}>{newChildren}</div>
            </PopoverConfirm>
          </div>
        ) : (
          newChildren
        )}

        {keyDialog && (
          <Modal
            animation={false}
            show={true}
            centered={true}
            onHide={this.toggleKeyDialog}
            className="key-or-hot-modal"
          >
            <ModalHeader closeButton={true} />
            <ModalBody>
              {KeyOrHot({
                ...this.props,
                inProgress: false,
                onKey: (key) => {
                  this.toggleKeyDialog();
                  onKey(key);
                },
                onHot: () => {
                  this.toggleKeyDialog();
                  if (onHot) {
                    onHot();
                  }
                },
                onKc: () => {
                  this.toggleKeyDialog();
                  if (onKc) {
                    onKc();
                  }
                }
              })}
            </ModalBody>
          </Modal>
        )}
      </>
    );
  }
}

KeyOrHotDialog.defaultProps = {
  popOver: false
};

export default (p: Props) => {
  const props = {
    global: p.global,
    activeUser: p.activeUser,
    signingKey: p.signingKey,
    popOver: p.popOver,
    setSigningKey: p.setSigningKey,
    children: p.children,
    onKey: p.onKey,
    onHot: p.onHot,
    onKc: p.onKc,
    onToggle: p.onToggle
  };

  return <KeyOrHotDialog {...props} />;
};
