import React, { Component } from "react";
import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import BaseComponent from "../base";
import Tooltip from "../tooltip";
import LinearProgress from "../linear-progress";
import { _t } from "../../i18n";
import formattedNumber from "../../util/formatted-number";
import MyPagination from "@ui/pagination";
import { ConversionRequest, getConversionRequests } from "../../api/hive";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Table, Td, Th, Tr } from "@ui/table";

interface Props {
  global: Global;
  history: History;
  account: Account;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

interface State {
  loading: boolean;
  data: ConversionRequest[];
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
    return getConversionRequests(account.name)
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
      <div className="conversion-content">
        <div className="list-body">
          {sliced.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
          <Table full={true}>
            <thead>
              <Tr>
                <Th>{_t("conversion-requests.request-id")}</Th>
                <Th>{_t("conversion-requests.amount")}</Th>
                <Th>{_t("conversion-requests.pending")}</Th>
              </Tr>
            </thead>
            <tbody>
              {sliced.map((x) => {
                const { requestid } = x;
                return (
                  <Tr key={requestid}>
                    <Td>{requestid}</Td>
                    <Td>
                      <Tooltip content={x.amount}>
                        <span>{formattedNumber(x.amount, { prefix: "$" })}</span>
                      </Tooltip>
                    </Td>
                    <Td>
                      <div className="date" title={dateToFormatted(x.conversion_date)}>
                        {dateToFullRelative(x.conversion_date)}
                      </div>
                    </Td>
                  </Tr>
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

export default class ConversionRequests extends Component<Props> {
  render() {
    const { onHide } = this.props;

    return (
      <>
        <Modal onHide={onHide} show={true} centered={true} animation={false}>
          <ModalHeader closeButton={true}>
            <ModalTitle>{_t("conversion-requests.title")}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <List {...this.props} />
          </ModalBody>
        </Modal>
      </>
    );
  }
}
