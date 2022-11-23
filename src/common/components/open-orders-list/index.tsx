import React, { Component } from "react";

import { History } from "history";

import { Table, Modal } from "react-bootstrap";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";

import BaseComponent from "../base";
import Tooltip from "../tooltip";
import LinearProgress from "../linear-progress";

import { _t } from "../../i18n";

import formattedNumber from "../../util/formatted-number";
import MyPagination from "../pagination";
import { getOpenOrder, OpenOrdersData } from "../../api/hive";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import { AssetSymbol } from "@hiveio/dhive";

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
  data: OpenOrdersData[];
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
    return getOpenOrder(account.name)
      .then((r) => {
        const sorted = r.sort((a, b) => {
          return a.orderid - b.orderid;
        });

        this.stateSet({ data: sorted });
      })
      .finally(() => this.stateSet({ loading: false }));
  };

  render() {
    const { loading, data, page } = this.state;
    const { tokenType, history } = this.props;

    if (loading) {
      return (
        <div className="open-orders-content">
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
      <div className="open-orders-content">
        <div className="list-body">
          {sliced.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
          <Table striped={true} bordered={true} hover={true} className="oo-table">
            <thead>
              <tr>
                <th>{_t("open-orders-list.order-id")}</th>
                <th>{_t("conversion-requests.amount")}</th>
                <th>{_t("open-orders-list.created")}</th>
                <th>{_t("open-orders-list.expires")}</th>
              </tr>
            </thead>
            <tbody>
              {sliced.map((x) => {
                const { orderid } = x;
                if (x.sell_price.base.includes(tokenType)) {
                  return (
                    <tr
                      key={orderid}
                      onClick={(e) => {
                        e.preventDefault();
                        history.push(`/market#limit`);
                      }}
                    >
                      <td>{orderid}</td>
                      <td>
                        <Tooltip content={x.sell_price.quote}>
                          <span>
                            {tokenType == "HBD"
                              ? formattedNumber(x.sell_price.base, { prefix: "$" })
                              : formattedNumber(x.sell_price.base, { suffix: tokenType })}
                          </span>
                        </Tooltip>
                      </td>
                      <td>
                        <div className="date" title={dateToFormatted(x.created)}>
                          {dateToFullRelative(x.created)}
                        </div>
                      </td>
                      <td>
                        <div className="date" title={dateToFormatted(x.expiration)}>
                          {dateToFullRelative(x.expiration)}
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

export default class OpenOrdersList extends Component<Props> {
  render() {
    const { onHide } = this.props;

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <Modal.Header closeButton={true}>
            <Modal.Title>{_t("open-orders-list.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <List {...this.props} />
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
