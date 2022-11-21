import React from "react";
import { arrowRightSvg } from "../../img/svg";
import { dateToFullRelative } from "../../helper/parse-date";
import { Button } from "react-bootstrap";
import { _t } from "../../i18n";

interface Props {
  from: string;
  to: string;
  createdAt: string;
  onCancel: () => void;
}

export const GenericOrderItem = ({ from, to, createdAt, onCancel }: Props) => {
  return (
    <div className="d-flex align-items-center justify-content-between">
      <div>
        <div className="d-flex align-items-center price font-weight-bold">
          {from}
          <i className="mx-1">{arrowRightSvg}</i>
          {to}
        </div>
        <small className="created-date">{dateToFullRelative(createdAt)}</small>
      </div>
      <Button variant="link" onClick={onCancel}>
        {_t("g.cancel")}
      </Button>
    </div>
  );
};
