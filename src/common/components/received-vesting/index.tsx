import React, { Component } from "react";
import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import LinearProgress from "../linear-progress";
import { getReceivedVestingShares, ReceivedVestingShare } from "../../api/private-api";
import { _t } from "../../i18n";
import { vestsToHp } from "../../helper/vesting";
import parseAsset from "../../helper/parse-asset";
import formattedNumber from "../../util/formatted-number";
import MyPagination from "@ui/pagination";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";

interface Props {
  global: Global;
  history: History;
  account: Account;
  searchText?: string;
  dynamicProps: DynamicProps;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

interface State {
  loading: boolean;
  data: ReceivedVestingShare[];
  searchData: ReceivedVestingShare[];
  page: number;
}

export class List extends BaseComponent<Props, State> {
  state: State = {
    loading: false,
    data: [],
    searchData: [],
    page: 1
  };

  componentDidMount() {
    this.fetch().then();
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.searchText !== this.props.searchText &&
      this.props.searchText &&
      this.props.searchText.length > 0
    ) {
      let filteredItems = this.state.data.filter((item) =>
        item.delegator.toLocaleLowerCase().includes(this.props.searchText!.toLocaleLowerCase())
      );
      this.setState({ searchData: filteredItems, page: 1 });
    }
  }

  fetch = () => {
    const { account } = this.props;

    this.stateSet({ loading: true });
    return getReceivedVestingShares(account.name)
      .then((r) => {
        const sorted = r.sort((a, b) => {
          return parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount;
        });

        this.stateSet({ data: sorted });
      })
      .finally(() => this.stateSet({ loading: false }));
  };

  render() {
    const { loading, data, searchData, page } = this.state;
    const { dynamicProps, searchText } = this.props;
    const { hivePerMVests } = dynamicProps;

    if (loading) {
      return (
        <div className="received-vesting-content">
          <LinearProgress />
        </div>
      );
    }

    const displayData = searchText && searchText.length > 0 ? searchData : data;

    const pageSize = 8;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sliced = displayData.slice(start, end);

    return (
      <div className="received-vesting-content">
        <div className="user-list">
          <div className="list-body">
            {sliced.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
            {sliced.map((x) => {
              const vestingShares = parseAsset(x.vesting_shares).amount;
              const { delegator: username } = x;

              return (
                <div className="list-item" key={username}>
                  <div className="item-main">
                    {ProfileLink({
                      ...this.props,
                      username,
                      children: <UserAvatar username={username} size="small" />
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
                  </div>
                </div>
              );
            })}
          </div>

          <MyPagination
            className="mt-4"
            dataLength={displayData.length}
            pageSize={pageSize}
            maxItems={4}
            page={page}
            onPageChange={(page: number) => {
              this.stateSet({ page });
            }}
          />
        </div>
      </div>
    );
  }
}

interface ReceivedVestingState {
  searchText: string;
  searchTextDisabled: boolean;
}

export default class ReceivedVesting extends Component<Props, ReceivedVestingState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: "",
      searchTextDisabled: true
    };
  }

  render() {
    const { onHide } = this.props;
    const { searchText } = this.state;

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <ModalHeader closeButton={true}>
            <ModalTitle>{_t("received-vesting.title")}</ModalTitle>
          </ModalHeader>
          <div className="w-full px-3 pb-4">
            <FormControl
              type="text"
              placeholder={_t("friends.search-placeholder")}
              value={searchText}
              onChange={(e) => {
                let text = e.target.value;
                this.setState({
                  searchText: e.target.value,
                  searchTextDisabled: text.length === 0
                });
              }}
            />
          </div>
          <ModalBody>
            <List {...this.props} searchText={searchText} />
          </ModalBody>
        </Modal>
      </>
    );
  }
}
