import React, { Component } from "react";

import { Modal } from "react-bootstrap";

import isEqual from "react-fast-compare";

import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import PopoverConfirm from "../popover-confirm";

import { getAuthUrl } from "../../helper/hive-signer";

import { _t } from "../../i18n";

import { deleteForeverSvg } from "../../img/svg";

const hsLogo = require("../../img/hive-signer.svg");

interface UserItemprops {
  user: User;
  activeUser: ActiveUser | null;
  onSelect: (user: User) => void;
  onDelete: (user: User) => void;
}

export class UserItem extends Component<UserItemprops> {
  render() {
    const { user, activeUser } = this.props;

    return (
      <div
        className={`user-list-item ${activeUser && activeUser.name === user.username ? "active" : ""}`}
        onClick={() => {
          const { onSelect } = this.props;
          onSelect(user);
        }}
      >
        <UserAvatar {...this.props} username={user.username} size="normal" />
        <span className="username">@{user.username}</span>
        {activeUser && activeUser.name === user.username && <div className="check-mark" />}
        <div className="flex-spacer " />
        <PopoverConfirm
          onConfirm={() => {
            const { onDelete } = this.props;
            onDelete(user);
          }}
        >
          <div
            className="btn-delete"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Tooltip content={_t("g.delete")}>
              <span>{deleteForeverSvg}</span>
            </Tooltip>
          </div>
        </PopoverConfirm>
      </div>
    );
  }
}

interface Props {
  users: User[];
  activeUser: ActiveUser | null;
  setActiveUser: (name: string | null) => void;
  deleteUser: (username: string) => void;
  onHide: () => void;
  onLogin: () => void;
}

export default class Login extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.users, nextProps.users) || !isEqual(this.props.activeUser, nextProps.activeUser);
  }

  render() {
    const { users, onHide } = this.props;
    return (
      <Modal show={true} centered={true} onHide={onHide}>
        <Modal.Body className="login-dialog-content">
          {users.length > 0 && (
            <>
              <div className="user-list">
                <div className="user-list-header">{_t("login.users-title")}</div>
                <div className="user-list-body">
                  {users.map((u) => {
                    return (
                      <UserItem
                        key={u.username}
                        {...this.props}
                        user={u}
                        onSelect={(user) => {
                          const { setActiveUser, onLogin } = this.props;
                          setActiveUser(user.username);
                          onLogin();
                        }}
                        onDelete={(user) => {
                          const { activeUser, deleteUser, setActiveUser } = this.props;
                          deleteUser(user.username);

                          if (activeUser && user.username === activeUser.name) {
                            setActiveUser(null);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="or-divider">{_t("login.or")}</div>
            </>
          )}
          <div className="hs-login">
            <a className="btn btn-outline-primary" href={getAuthUrl()}>
              <img src={hsLogo} className="hs-logo" /> Login with hivesigner
            </a>
          </div>
          <p>
            {_t("login.signup-text-1")}
            &nbsp;
            <a href="#">{_t("login.signup-text-2")}</a>
          </p>
        </Modal.Body>
      </Modal>
    );
  }
}
