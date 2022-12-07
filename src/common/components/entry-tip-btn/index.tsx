import React, { Component } from "react";

import { Modal } from "react-bootstrap";

import { Account } from "../../store/accounts/types";
import { Entry } from "../../store/entries/types";
import { Transactions } from "../../store/transactions/types";
import { match } from "react-router";
import LoginRequired from "../login-required";
import { Transfer } from "../transfer";
import Tooltip from "../tooltip";
import { connect } from "react-redux";
import { PageProps, pageMapDispatchToProps, pageMapStateToProps } from "../../pages/common";
import { _t } from "../../i18n";

import { giftOutlineSvg } from "../../img/svg";

interface MatchParams {
  category: string;
  permlink: string;
  username: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
  account: Account;
  entry: Entry;
  updateWalletValues: () => void;
  setTipDialogMounted: (d: boolean) => void;
}

interface DialogProps extends Props {
  onHide: () => void;
}

export class TippingDialog extends Component<DialogProps> {
  componentDidMount(): void {
    this.props.setTipDialogMounted(true);
  }

  componentWillUnmount(): void {
    this.props.setTipDialogMounted(false);
  }

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
      group: ""
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

export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryTipBtn as any);
