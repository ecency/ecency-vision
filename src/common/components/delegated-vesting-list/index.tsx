import React, { Component } from "react";

import { History } from "history";

import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

import { Modal, Spinner } from "react-bootstrap";

import { State as GlobalState } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";

import { VestingDelegation, getVestingDelegations } from "../../api/hive";

import { _t } from "../../i18n";

import { vestsToSp } from "../../helper/vesting";

import parseAsset from "../../helper/parse-asset";

import formattedNumber from "../../util/formatted-number";

interface ListProps {
  history: History;
  account: Account;
  dynamicProps: DynamicProps;
  addAccount: (data: Account) => void;
}

interface ListState {
  loading: boolean;
  data: VestingDelegation[];
}

export class List extends Component<ListProps, ListState> {
  state: ListState = {
    loading: false,
    data: [],
  };

  componentDidMount() {
    const { account } = this.props;

    this.setState({ loading: true });
    getVestingDelegations(account.name)
      .then((data) => {
        this.setData(data);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  setData = (data: VestingDelegation[]) => {
    data.sort((a, b) => {
      return parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount;
    });

    this.setState({ data });
  };

  render() {
    const { loading, data } = this.state;
    const { dynamicProps } = this.props;

    if (loading) {
      return (
        <div className="dialog-loading">
          <Spinner animation="grow" variant="primary" />
        </div>
      );
    }

    const { hivePerMVests } = dynamicProps;

    const columns = [
      {
        dataField: "delegatee",
        text: "",
        classes: "delegatee-cell",
        formatter: (cell: any, row: VestingDelegation) => {
          return (
            <ProfileLink {...this.props} username={row.delegatee}>
              <span className="account">
                <UserAvatar username={row.delegatee} size="small" /> {row.delegatee}
              </span>
            </ProfileLink>
          );
        },
      },
      {
        dataField: "vesting_shares",
        text: "",
        classes: "vesting-shares-cell",
        sortFunc: (a: string, b: string, order: string) => {
          if (order === "asc") {
            return parseAsset(a).amount - parseAsset(b).amount;
          }

          return parseAsset(b).amount - parseAsset(a).amount;
        },
        formatter: (cell: any, row: VestingDelegation) => {
          const vestingShares = parseAsset(row.vesting_shares).amount;

          return (
            <>
              {formattedNumber(vestsToSp(vestingShares, hivePerMVests), { suffix: "HP" })} <br />
              <small>{row.vesting_shares}</small>
            </>
          );
        },
      },
    ];

    const pageSize = 8;

    const sort = {
      dataField: "vesting_shares",
      order: "desc",
    };

    const pagination = {
      sizePerPage: pageSize,
      hideSizePerPage: true,
    };

    const tableProps = {
      bordered: false,
      defaultSorted: [sort],
      keyField: "delegatee",
      data,
      columns,
      pagination: data.length > pageSize ? paginationFactory(pagination) : undefined,
    };

    // @ts-ignore this is about the library's defaultSorted typing issue
    const table = <BootstrapTable {...tableProps} />;

    return (
      <div className="delegated-vesting-dialog-content">
        <div className="table-responsive">{table}</div>
      </div>
    );
  }
}

interface Props {
  history: History;
  global: GlobalState;
  dynamicProps: DynamicProps;
  account: Account;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

export default class DelegatedVestingList extends Component<Props> {
  render() {
    const { account, onHide } = this.props;

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <Modal.Header closeButton={true}>
            <Modal.Title>{_t("delegated-vesting.title", { n: account.name })}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <List {...this.props} />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
