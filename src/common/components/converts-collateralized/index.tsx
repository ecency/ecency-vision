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
import {
  CollateralizedConversionRequest,
  getCollateralizedConversionRequests
} from "../../api/hive";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";

import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";

interface Props {
  global: Global;
  history: History;
  account: Account;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

interface State {
  loading: boolean;
  data: CollateralizedConversionRequest[];
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
    return getCollateralizedConversionRequests(account.name)
      .then((r) => {
        const sorted = r.sort((a, b) => {
          return a.requestid - b.requestid;
        });

        this.stateSet({ data: sorted });
      })
      .finally(() => this.stateSet({ loading: false }));
  };

  render() {
    const { loading, data, page } = this.state;

    if (loading) {
      return (
        <div className="conversion-content">
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
      <div className="collateralized-conversion-content">
        <div className="list-body">
          {sliced.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
          <Table striped={true} bordered={true} hover={true}>
            <thead>
              <tr>
                <th>{_t("collateralized-conversion-requests.request-id")}</th>
                <th>{_t("collateralized-conversion-requests.collateral_amount")}</th>
                <th>{_t("collateralized-conversion-requests.converted_amount")}</th>
                <th>{_t("collateralized-conversion-requests.pending")}</th>
              </tr>
            </thead>
            <tbody>
              {sliced.map((x) => {
                const { requestid } = x;
                return (
                  <tr key={requestid}>
                    <td>{requestid}</td>
                    <td>
                      <Tooltip content={x.collateral_amount}>
                        <span>{formattedNumber(x.collateral_amount, { suffix: "HIVE" })}</span>
                      </Tooltip>
                    </td>
                    <td>
                      <Tooltip content={x.converted_amount}>
                        <span>{formattedNumber(x.converted_amount, { prefix: "$" })}</span>
                      </Tooltip>
                    </td>
                    <td>
                      <div className="date" title={dateToFormatted(x.conversion_date)}>
                        {dateToFullRelative(x.conversion_date)}
                      </div>
                    </td>
                  </tr>
                );
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

export default class CollateralizedConversionRequests extends Component<Props> {
  render() {
    const { onHide } = this.props;

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <ModalHeader closeButton={true}>
            <ModalTitle>{_t("collateralized-conversion-requests.title")}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <List {...this.props} />
          </ModalBody>
        </Modal>
      </>
    );
  }
}
