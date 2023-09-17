import React, { Component } from "react";
import { History } from "history";
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

import { DelegatedVestingShare, getVestingDelegations } from "../../api/hive";

import {
  delegateVestingShares,
  delegateVestingSharesHot,
  delegateVestingSharesKc,
  formatError
} from "../../api/operations";

import { _t } from "../../i18n";

import { vestsToHp } from "../../helper/vesting";

import parseAsset from "../../helper/parse-asset";

import formattedNumber from "../../util/formatted-number";

import _c from "../../util/fix-class-names";
import MyPagination from "../pagination";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";

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
  searchText?: string;
  totalDelegated: string;
  setSubtitle?: (value: number) => void;
}

interface State {
  loading: boolean;
  inProgress: boolean;
  data: DelegatedVestingShare[];
  searchData: DelegatedVestingShare[];
  hideList: boolean;
  page: number;
}

export class List extends BaseComponent<Props, State> {
  state: State = {
    loading: false,
    inProgress: false,
    data: [],
    searchData: [],
    hideList: false,
    page: 1
  };

  componentDidMount() {
    this.fetch().then();
  }

  fetch = () => {
    const { account, dynamicProps, totalDelegated, setSubtitle } = this.props;
    this.setState({ loading: true });
    let totalData: DelegatedVestingShare[] = [];
    const { hivePerMVests } = dynamicProps;

    let getData = (account: string, start: string, limit: number) => {
      return getVestingDelegations(account, start, limit).then((r) => {
        totalData = totalData.concat(r);
        if (r.length === limit) {
          getData(account, r[limit - 1].delegatee, limit);
        } else {
          const sorted: DelegatedVestingShare[] = totalData.sort((a, b) => {
            return parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount;
          });

          const totalDelegatedValue = sorted.reduce((n, item) => {
            let parsedValue: any = parseAsset(item.vesting_shares).amount;
            parsedValue = vestsToHp(parsedValue, hivePerMVests);
            parsedValue = formattedNumber(parsedValue);
            parsedValue = parsedValue.replace(/,/g, "");
            parsedValue = parseFloat(parsedValue);
            parsedValue = n + parsedValue;
            return parsedValue;
          }, 0);

          const totalDelegatedNumbered = parseFloat(
            totalDelegated.replace(" HP", "").replace(",", "")
          );
          const toBeReturned = totalDelegatedNumbered - totalDelegatedValue;
          setSubtitle && setSubtitle(Number(toBeReturned.toFixed(3)));

          this.setState({ loading: false, data: [...new Set(sorted)] });
        }
      });
    };

    return getData(account.name, "", 1000);
  };

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.searchText !== this.props.searchText &&
      this.props.searchText &&
      this.props.searchText.length > 0
    ) {
      let filteredItems = this.state.data.filter((item) =>
        item.delegatee.toLocaleLowerCase().includes(this.props.searchText!.toLocaleLowerCase())
      );
      this.setState({ searchData: filteredItems, page: 1 });
    }
  }

  render() {
    const { loading, data, hideList, inProgress, searchData, page } = this.state;
    const { dynamicProps, activeUser, account, searchText } = this.props;
    const { hivePerMVests } = dynamicProps;

    if (loading) {
      return (
        <div className="delegated-vesting-content">
          <LinearProgress />
        </div>
      );
    }

    let dataToShow = searchText && searchText.length > 0 ? searchData : data;

    const pageSize = 8;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sliced = dataToShow.slice(start, end);

    return (
      <div
        className={_c(
          `delegated-vesting-content ${inProgress ? "in-progress" : ""} ${hideList ? "hidden" : ""}`
        )}
      >
        <div className="user-list">
          <div className="list-body">
            {sliced.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
            {sliced.map((x) => {
              const vestingShares = parseAsset(x.vesting_shares).amount;
              const { delegatee: username } = x;

              const deleteBtn =
                activeUser && activeUser.username === account.name
                  ? KeyOrHotDialog({
                      ...this.props,
                      popOver: true,
                      activeUser: activeUser,
                      children: (
                        <a href="#" className="undelegate">
                          {_t("delegated-vesting.undelegate")}
                        </a>
                      ),
                      onToggle: () => {
                        const { hideList } = this.state;
                        this.setState({ hideList: !hideList });
                      },
                      onKey: (key) => {
                        this.setState({ inProgress: true });
                        delegateVestingShares(activeUser.username, key, username, "0.000000 VESTS")
                          .then(() => this.fetch())
                          .catch((err) => error(...formatError(err)))
                          .finally(() => this.setState({ inProgress: false }));
                      },
                      onHot: () => {
                        delegateVestingSharesHot(activeUser.username, username, "0.000000 VESTS");
                      },
                      onKc: () => {
                        this.setState({ inProgress: true });
                        delegateVestingSharesKc(activeUser.username, username, "0.000000 VESTS")
                          .then(() => this.fetch())
                          .catch((err) => error(...formatError(err)))
                          .finally(() => this.setState({ inProgress: false }));
                      }
                    })
                  : null;

              return (
                <div className="list-item" key={username}>
                  <div className="item-main">
                    {ProfileLink({
                      ...this.props,
                      username,
                      children: <UserAvatar username={x.delegatee} size="small" />
                    })}
                    <div className="item-info">
                      {ProfileLink({
                        ...this.props,
                        username,
                        children: <span className="item-name notranslate">{username}</span>
                      })}
                    </div>
                  </div>
                  <div className="item-extra">
                    <Tooltip content={x.vesting_shares}>
                      <span>
                        {formattedNumber(vestsToHp(vestingShares, hivePerMVests), { suffix: "HP" })}
                      </span>
                    </Tooltip>
                    {deleteBtn}
                  </div>
                </div>
              );
            })}
          </div>
          <MyPagination
            className="mt-4"
            dataLength={dataToShow.length}
            pageSize={pageSize}
            maxItems={4}
            page={page}
            onPageChange={(page: number) => {
              this.setState({ page });
            }}
          />
        </div>
      </div>
    );
  }
}

interface DelegatedVestingState {
  searchText: string;
  subtitle: string;
}

export default class DelegatedVesting extends Component<Props, DelegatedVestingState> {
  state = {
    searchText: "",
    subtitle: ""
  };

  render() {
    const { onHide } = this.props;
    const { subtitle, searchText } = this.state;

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <ModalHeader closeButton={true}>
            <ModalTitle>
              <div>
                <div>{_t("delegated-vesting.title")}</div>
                <div className="text-muted mt-3 text-small">{subtitle}</div>
              </div>
            </ModalTitle>
          </ModalHeader>

          <div className="w-full mb-4 px-3">
            <FormControl
              type="text"
              placeholder={_t("friends.search-placeholder")}
              value={searchText}
              onChange={(e) => this.setState({ searchText: e.target.value })}
            />
          </div>
          <ModalBody>
            <List
              {...this.props}
              searchText={searchText}
              setSubtitle={(value) =>
                this.setState({
                  subtitle: value === 0 ? "" : `+${value} ${_t("delegated-vesting.subtitle")}`
                })
              }
            />
          </ModalBody>
        </Modal>
      </>
    );
  }
}
