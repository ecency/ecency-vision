import React, { Component } from "react";

import { History } from "history";

import { Table } from "react-bootstrap";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";

import BaseComponent from "../base";
import Tooltip from "../tooltip";
import LinearProgress from "../linear-progress";

import { _t } from "../../i18n";

import formattedNumber from "../../util/formatted-number";
import MyPagination from "../pagination";
import { getSavingsWithdrawFrom, SavingsWithdrawRequest } from "../../api/hive";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import { AssetSymbol } from "@hiveio/dhive";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "../modal";

interface Props {
  global: Global;
  tokenType: AssetSymbol;
  history: History;
  account: Account;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

interface State {
  loading: boolean;
  data: SavingsWithdrawRequest[];
  page: number;
}

export class List extends BaseComponent<Props, State> {
  state: State = {
    loading: false,
    data: [],
    page: 1
  };

  componentDidMount() {
    this.fetch().then();
  }

  fetch = () => {
    const { account } = this.props;

    this.stateSet({ loading: true });
    return getSavingsWithdrawFrom(account.name)
      .then((r) => {
        const sorted = r.sort((a, b) => {
          return a.request_id - b.request_id;
        });

        this.stateSet({ data: sorted });
      })
      .finally(() => this.stateSet({ loading: false }));
  };

  render() {
    const { loading, data, page } = this.state;
    const { tokenType } = this.props;

    if (loading) {
      return (
        <div className="savings-withdraw-content">
          <LinearProgress />
        </div>
      );
    }

    const displayData = data;

    const pageSize = 8;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sliced = displayData.slice(start, end);

    return (
      <div className="savings-withdraw-content">
        <div className="list-body">
          {sliced.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
          <Table striped={true} bordered={true} hover={true}>
            <thead>
              <tr>
                <th>{_t("conversion-requests.request-id")}</th>
                <th>{_t("conversion-requests.amount")}</th>
                <th>{_t("savings-withdraw.to")}</th>
                <th>{_t("conversion-requests.pending")}</th>
              </tr>
            </thead>
            <tbody>
              {sliced.map((x) => {
                const { request_id } = x;
                const publishedT = dateToFormatted(x.complete);
                const published = dateToFullRelative(x.complete);
                if (x.amount.includes(tokenType)) {
                  return (
                    <tr key={request_id}>
                      <td>{request_id}</td>
                      <td>
                        <Tooltip content={x.amount}>
                          <span>
                            {tokenType == "HBD"
                              ? formattedNumber(x.amount, { prefix: "$" })
                              : formattedNumber(x.amount, { suffix: tokenType })}
                          </span>
                        </Tooltip>
                      </td>
                      <td>
                        <Tooltip content={x.to}>
                          <span>{`@${x.to}`}</span>
                        </Tooltip>
                      </td>
                      <td>
                        <div className="date" title={publishedT}>
                          {published}
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  return null;
                }
              })}
            </tbody>
          </Table>
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
    );
  }
}

export default class SavingsWithdraw extends Component<Props> {
  render() {
    const { onHide } = this.props;

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <ModalHeader closeButton={true}>
            <ModalTitle>{_t("savings-withdraw.title")}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <List {...this.props} />
          </ModalBody>
        </Modal>
      </>
    );
  }
}
