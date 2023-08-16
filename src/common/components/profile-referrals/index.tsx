import React from "react";
import { History } from "history";
import isEqual from "react-fast-compare";
import moment from "moment";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { OperationGroup, Transactions } from "../../store/transactions/types";
import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";
import MyPagination from "../pagination";
import Transfer, { TransferAsset, TransferMode } from "../transfer";
import LinearProgress from "../linear-progress";
import { shareVariantSvg } from "../../img/svg";
import { getReferrals, getReferralsStats, ReferralItem, ReferralStat } from "../../api/private-api";
// import clipboard from '../../util/clipboard';
import { _t } from "../../i18n";
import { success } from "../feedback";
import { Tsx } from "../../i18n/helper";

import "./index.scss";

interface Props {
  history: History;
  global: Global;
  dynamicProps: DynamicProps;
  activeUser: ActiveUser | null;
  transactions: Transactions;
  account: Account;
  signingKey: string;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  setSigningKey: (key: string) => void;
  fetchTransactions: (username: string, group?: OperationGroup | "") => void;
  updateWalletValues: () => void;
}

interface State {
  referrals: ReferralItem[];
  claimed_points: number;
  pending_points: number;
  proxy: string | null;
  transfer: boolean;
  referred: string;
  transferMode: null | TransferMode;
  transferAsset: null | TransferAsset;
  loading: boolean;
  page: number;
  totalPages: number;
  lastReferralId: number | null;
}

export class ProfileReferrals extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    referred: "",
    referrals: [],
    claimed_points: 0,
    pending_points: 0,
    proxy: "",
    transfer: false,
    transferAsset: "HP",
    transferMode: "delegate",
    page: 1,
    totalPages: 0,
    lastReferralId: null
  };

  componentDidMount() {
    this.load();
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return (
      !isEqual(this.props.account, nextProps.account) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.state, nextState)
    );
  }

  load = async () => {
    this.stateSet({ loading: true });
    await this.getReferrals(this.state.lastReferralId);
    await this._getReferralsStats();
  };

  getReferrals = async (id: any) => {
    try {
      const { account } = this.props;

      // Fetch referrals
      const data = await getReferrals(account.name, id);
      this.stateSet({
        referrals: [...this.state.referrals, ...data.data],
        loading: false
      });
    } catch (error) {
      console.log("Something went wrong: ", error);
    }
  };
  _getReferralsStats = async () => {
    const { account } = this.props;
    const referralStats: ReferralStat = await getReferralsStats(account.name);

    const earnedPoints = referralStats.rewarded * 100;
    const unearnedPoints = (referralStats.total - referralStats.rewarded) * 100;
    this.stateSet({
      claimed_points: earnedPoints,
      pending_points: unearnedPoints,
      totalPages: referralStats.total,
      loading: false
    });
  };

  copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("profile-edit.copied"));
  };

  openTransferDialog = (mode: TransferMode, asset: TransferAsset, user: string) => {
    this.stateSet({
      transfer: true,
      transferMode: mode,
      transferAsset: asset,
      referred: user
    });
  };

  closeTransferDialog = () => {
    this.stateSet({ transfer: false, transferMode: null, transferAsset: null });
  };

  render() {
    const { global, account } = this.props;
    const { referrals, loading, page } = this.state;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sliced = referrals.slice(start, end);

    const table = (
      <>
        <table className="table d-none d-sm-block d-flex flex-column">
          <thead>
            <tr>
              <th className="col-rank">{_t("referral.created")}</th>
              <th>{_t("referral.list-referral")}</th>
              <th className="col-version">{_t("referral.rewarded")}</th>
              <th className="col-version" />
            </tr>
          </thead>
          <tbody>
            {sliced.map((row, i) => {
              var dateObj = new Date(row.created);
              var momentObj = moment(dateObj);
              var createdAt = momentObj.format("YYYY/MM/DD");
              return (
                <tr key={i}>
                  <td className="align-middle">
                    <div className="witness-rank">
                      <span className="rank-number">{createdAt}</span>
                    </div>
                  </td>
                  <td>
                    {ProfileLink({
                      history: this.props.history,
                      addAccount: () => {},
                      username: row.username,
                      children: (
                        <span className="d-flex align-center gap-2">
                          <UserAvatar size="medium" username={row.username} />
                          <span className="d-block align-self-center ml-2">{row.username}</span>
                        </span>
                      )
                    })}
                  </td>

                  <td className="align-middle">
                    <span className="bg-primary text-white reward-wrapper py-1 px-3 circle">
                      {row.rewarded === 0 ? _t("g.no") : _t("g.yes")}
                    </span>
                  </td>
                  <td className="delegate-button">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => this.openTransferDialog("delegate", "HP", row.username)}
                    >
                      {_t("referral.delegate-hp")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {this.state.transfer && (
          <Transfer
            {...this.props}
            activeUser={this.props.activeUser!}
            to={this.state.referred}
            mode={this.state.transferMode!}
            asset={this.state.transferAsset!}
            onHide={this.closeTransferDialog}
          />
        )}
      </>
    );

    const header = (
      <div className="page-header mt-2 mb-2">
        <div className="header-title text-left">{_t("referral.page-title")}</div>

        <div className="d-flex mt-2">
          <div>
            <h5 className="header-title text-left">{this.state.claimed_points}</h5>
            <h6 className=" text-left">{_t("referral.earned-reward")}</h6>
          </div>
          <div>
            <h5 className="header-title text-left ml-3">{this.state.pending_points}</h5>
            <h6 className=" text-left ml-3">{_t("referral.pending-reward")}</h6>
          </div>
          <div className="ml-5">
            <button
              onClick={() =>
                this.copyToClipboard(`https://ecency.com/signup?referral=${account.name}`)
              }
              className="btn btn-primary"
            >
              {_t("entry.address-copy")} {shareVariantSvg}
            </button>
          </div>
        </div>
        <Tsx k="referral.page-description-long">
          <div className="header-description text-left" />
        </Tsx>
      </div>
    );
    let containerClasses = global.isElectron ? " mt-0 pt-6" : "";
    return (
      <div className={"app-content witnesses-page mt-0 mx-0" + containerClasses}>
        {(() => {
          if (loading) {
            return (
              <>
                {header}
                <LinearProgress />
              </>
            );
          }

          return (
            <>
              {header}
              <div className="table-responsive">
                {table}

                {referrals.length >= pageSize && (
                  <MyPagination
                    className="mt-4"
                    dataLength={this.state.totalPages}
                    pageSize={pageSize}
                    maxItems={4}
                    page={page}
                    onPageChange={(page: number) => {
                      this.stateSet({
                        page,
                        lastReferralId: referrals[referrals.length - 1].id
                      });
                      this.getReferrals(referrals[referrals.length - 1].id);
                    }}
                    showLastNo={false}
                  />
                )}
              </div>
            </>
          );
        })()}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    updateWalletValues: p.updateWalletValues,
    global: p.global,
    history: p.history,
    activeUser: p.activeUser,
    account: p.account,
    dynamicProps: p.dynamicProps,
    transactions: p.transactions,
    signingKey: p.signingKey,
    addAccount: p.addAccount,
    updateActiveUser: p.updateActiveUser,
    setSigningKey: p.setSigningKey,
    fetchTransactions: p.fetchTransactions
  };

  return <ProfileReferrals {...props} />;
};
