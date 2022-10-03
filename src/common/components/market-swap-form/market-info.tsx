import React from "react";
import { _t } from "../../i18n";
import { ListGroup, ListGroupItem } from "react-bootstrap";

interface Props {
  className: string;
}

export const MarketInfo = ({ className }: Props) => {
  return (
    <div>
      <small className={"market-info font-weight-bold d-block mb-4 " + className}>
        1 HIVE = 0.023 HBD
        <span className="text-secondary ml-1">($0.123)</span>
      </small>

      <ListGroup>
        <ListGroupItem className="border-bottom-0">
          <div className="d-flex justify-content-between">
            <span>{_t("market.fee")}</span>
            <span className="badge badge-success text-white">{_t("market.fee-free")}</span>
          </div>
        </ListGroupItem>
        <ListGroupItem>
          <div className="d-flex justify-content-between">
            <span>{_t("market.order-book-impact")}</span>
            <span className="font-weight-bold">0.032%</span>
          </div>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
};
