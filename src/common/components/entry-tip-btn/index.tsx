import React, { Component } from "react";

import { Modal } from "react-bootstrap";

import { Global } from "../../store/global/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";
import { Account } from "../../store/accounts/types";
import { Entry } from "../../store/entries/types";
import { User } from "../../store/users/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Transactions } from "../../store/transactions/types";

import LoginRequired from "../login-required";
import { Transfer } from "../transfer";
import Tooltip from "../tooltip";

import { _t } from "../../i18n";

import { giftOutlineSvg } from "../../img/svg";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  users: User[];
  ui: UI;
  activeUser: ActiveUser | null;
  entry: Entry;
  signingKey: string;
  account: Account;
  fetchPoints: (username: string, type?: number) => void;
  updateWalletValues: () => void;
  addAccount: (data: Account) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  setSigningKey: (key: string) => void;
}

interface DialogProps extends Props {
  onHide: () => void;
}

export class TippingDialog extends Component<DialogProps> {
  render() {
    const { global, entry, activeUser } = this.props;

    if (!activeUser) {
      return null;
    }

    const to = entry.author;
    const memo = `Tip for @${entry.author}/${entry.permlink}`;
    const transactions: Transactions = {
      list: [],
      loading: false,
      group: "",
      oldest: null,
      newest: null,
      debug: ""
    };

    return (
      <Transfer
        {...this.props}
        activeUser={activeUser}
        transactions={transactions}
        asset={global.usePrivate ? "POINT" : "HIVE"}
        mode="transfer"
        amount={global.usePrivate ? "100.000" : "1.000"}
        to={to}
        memo={memo}
      />
    );
  }
}

interface State {
  dialog: boolean;
}

export class EntryTipBtn extends Component<Props, State> {
  state: State = {
    dialog: false
  };

  toggleDialog = () => {
    const { dialog } = this.state;
    this.setState({ dialog: !dialog });
  };

  render() {
    const { activeUser } = this.props;
    const { dialog } = this.state;

    return (
      <>
        {LoginRequired({
          ...this.props,
          children: (
            <div className="entry-tip-btn" onClick={this.toggleDialog}>
              <Tooltip content={_t("entry-tip.title")}>
                <span className="inner-btn">{giftOutlineSvg}</span>
              </Tooltip>
            </div>
          )
        })}

        {dialog && activeUser && (
          <Modal
            animation={false}
            show={true}
            centered={true}
            onHide={this.toggleDialog}
            keyboard={false}
            className="tipping-dialog modal-thin-header"
            size="lg"
          >
            <Modal.Header closeButton={true} />
            <Modal.Body>
              <TippingDialog {...this.props} onHide={this.toggleDialog} />
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    dynamicProps: p.dynamicProps,
    users: p.users,
    ui: p.ui,
    account: p.account,
    fetchPoints: p.fetchPoints,
    updateWalletValues: p.updateWalletValues,
    activeUser: p.activeUser,
    entry: p.entry,
    signingKey: p.signingKey,
    addAccount: p.addAccount,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp,
    setSigningKey: p.setSigningKey
  };

  return <EntryTipBtn {...props} />;
};
