import React from "react";
import { Button } from "@ui/button";
import { arrowRightSvg } from "@ui/svg";
import { dateToFullRelative } from "@/utils";
import i18next from "i18next";

interface Props {
  from: string;
  to: string;
  createdAt: string;
  onCancel: () => void;
}

export const GenericOrderItem = ({ from, to, createdAt, onCancel }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center price font-bold">
          {from}
          <i className="mx-1">{arrowRightSvg}</i>
          {to}
        </div>
        <small className="created-date">{dateToFullRelative(createdAt)}</small>
      </div>
      <Button appearance="link" onClick={onCancel}>
        {i18next.t("g.cancel")}
      </Button>
    </div>
  );
};
