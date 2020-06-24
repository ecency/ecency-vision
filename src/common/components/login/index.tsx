import React, { Component } from "react";

import { Modal, Button } from "react-bootstrap";

import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import { getAuthUrl } from "../../helper/hive-signer";

const hsLogo = require("../../img/hive-signer.svg");

interface Props {
  users: User[];
  activeUser: ActiveUser | null;
  children: JSX.Element;
  setActiveUser: (name: string | null) => void;
  onHide: () => void;
  onLogin: () => void;
}

export default class Login extends Component<Props> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { onHide } = this.props;
    return (
      <Modal show={true} centered={true} onHide={onHide}>
        <Modal.Body className="login-dialog-content">
          <a className="btn btn-outline-primary" href={getAuthUrl()}>
            <img src={hsLogo} className="hs-logo" /> Login with hivesigner
          </a>
        </Modal.Body>
      </Modal>
    );
  }
}
