import React, { Component } from "react";
import { History } from "history";
import { Modal } from "react-bootstrap";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import Tooltip from "../tooltip";
import KeyOrHotDialog from "../key-or-hot-dialog";
import { error } from "../feedback";
import {
  claimRewards,
  getHiveEngineTokenBalances,
  getUnclaimedRewards,
  getTokenDelegations,
  TokenStatus,
  DelegationEntry,
  Unstake,
  getPendingUnstakes
} from "../../api/hive-engine";
import {
  undelegateHiveEngineKey,
  undelegateHiveEngineHs,
  undelegateHiveEngineKc,
  formatError
} from "../../api/operations";
import { _t } from "../../i18n";
import { vestsToHp } from "../../helper/vesting";
import parseAsset from "../../helper/parse-asset";
import formattedNumber from "../../util/formatted-number";
import _c from "../../util/fix-class-names";
import HiveEngineToken, { HiveEngineTokenEntryDelta } from "../../helper/hive-engine-wallet";

interface Props {
  history: History;
  global: Global;
  activeUser: ActiveUser | null;
  account: Account;
  dynamicProps: DynamicProps;
  signingKey: string;
  addAccount: (data: Account) => void;
  setSigningKey: (key: string) => void;
  onHide: () => void;
  updateActiveUser: (data?: Account) => void;
  modifyTokenValues: (delta: HiveEngineTokenEntryDelta) => void;
  hiveEngineToken: HiveEngineToken;
  delegationList: Array<DelegationEntry>;
}

interface State {
  inProgress: boolean;
  data: DelegationEntry[];
  hideList: boolean;
}

export class ListHE extends BaseComponent<Props, State> {
  state: State = {
    inProgress: false,
    data: [],
    hideList: false
  };
  componentDidMount() {
    const { delegationList, hiveEngineToken, activeUser } = this.props;
    const data = delegationList.filter(
      (d) => d.symbol === hiveEngineToken.symbol && activeUser && d.from === activeUser.username
    );
    this.setState({ data });
  }
  render() {
    const { data, hideList, inProgress } = this.state;
    const { dynamicProps, activeUser, account, updateActiveUser, delegationList, hiveEngineToken } =
      this.props;
    const { hivePerMVests } = dynamicProps;

    return (
      <div
        className={_c(
          `delegated-vesting-content ${inProgress ? "in-progress" : ""} ${hideList ? "hidden" : ""}`
        )}
      >
        <div className="user-list">
          <div className="list-body">
            {data.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
            {data.map((x) => {
              const { symbol, quantity, to: username } = x;
              const deleteBtn =
                activeUser && activeUser.username === account.name
                  ? KeyOrHotDialog({
                      ...this.props,
                      activeUser: activeUser,
                      children: (
                        <a href="#" className="undelegate">
                          {_t("delegated-vesting.undelegate")}
                        </a>
                      ),
                      onToggle: () => {
                        const { hideList } = this.state;
                        this.stateSet({ hideList: !hideList });
                      },
                      onKey: (key) => {
                        this.stateSet({ inProgress: true });
                        undelegateHiveEngineKey(
                          activeUser.username,
                          key,
                          symbol,
                          username,
                          quantity
                        )
                          .then((TxC) => {
                            const { modifyTokenValues } = this.props;
                            this.stateSet({
                              data: data.filter((y) => y.to != x.to)
                            });
                            modifyTokenValues({ symbol, delegationsOutDelta: -quantity });
                          })
                          .catch((err) => error(err.message))
                          .finally(() => {
                            this.setState({ inProgress: false });
                            updateActiveUser(activeUser.data);
                          });
                      },
                      onHot: () => {
                        undelegateHiveEngineHs(activeUser.username, username, symbol, quantity);
                      },
                      onKc: () => {
                        this.stateSet({ inProgress: true });
                        undelegateHiveEngineKc(activeUser.username, username, symbol, quantity)
                          .then(() => {
                            const { modifyTokenValues } = this.props;
                            this.stateSet({
                              data: data.filter((y) => y.to !== x.to)
                            });
                            modifyTokenValues({ symbol, delegationsOutDelta: -quantity });
                          })
                          .catch((err) => error(err.message))
                          .finally(() => {
                            this.stateSet({ inProgress: false });
                            updateActiveUser(activeUser.data);
                          });
                      }
                    })
                  : null;
              return (
                <div className="list-item" key={username}>
                  <div className="item-main">
                    {ProfileLink({
                      ...this.props,
                      username,
                      children: (
                        <>
                          {UserAvatar({
                            ...this.props,
                            username: x.to,
                            size: "small"
                          })}
                        </>
                      )
                    })}
                    <div className="item-info">
                      {ProfileLink({
                        ...this.props,
                        username,
                        children: <a className="item-name notransalte">{username}</a>
                      })}
                    </div>
                  </div>
                  <div className="item-extra">
                    <Tooltip content={x.quantity}>
                      <span>{formattedNumber(x.quantity, { suffix: x.symbol })}</span>
                    </Tooltip>
                    {deleteBtn}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default class DelegatedVestingHE extends Component<Props> {
  render() {
    const { onHide, hiveEngineToken } = this.props;
    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <Modal.Header closeButton={true}>
            <Modal.Title>{_t("staked", hiveEngineToken)}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListHE {...this.props} />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
