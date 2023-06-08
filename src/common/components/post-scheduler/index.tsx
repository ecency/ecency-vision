import React, { Component, useEffect, useState } from "react";

import Datetime from "react-datetime";

import moment, { Moment } from "moment";

import { Button, Modal } from "react-bootstrap";

import BaseComponent from "../base";

import { _t } from "../../i18n";

import { closeSvg, timeSvg } from "../../img/svg";
import "./_index.scss";

interface Props {
  date: Moment | null;
  onChange: (date: Moment | null) => void;
}

interface DialogBodyProps extends Props {
  onHide: () => void;
}

export const DialogBody = (props: DialogBodyProps) => {
  const [date, setDate] = useState<Moment>(
    props.date || moment(moment().add(2, "hour").toISOString(true))
  );
  const todayTs = moment().hour(0).minute(0).second(0).milliseconds(0).format("x");

  const rend = () => {
    return (
      <>
        <div className="picker">
          <Datetime
            open={true}
            input={false}
            initialValue={date}
            timeFormat="HH:mm"
            isValidDate={(d) => {
              return d.format("x") >= todayTs;
            }}
            onChange={(date) => {
              setDate(date as Moment);
            }}
          />
        </div>
        <div className="text-center">
          <Button
            onClick={() => {
              const { onChange, onHide } = props;
              onChange(date);
              onHide();
            }}
          >
            {_t("g.apply")}
          </Button>
        </div>
      </>
    );
  };

  return rend();
};

export const PostSchedulerDialog = (props: Props) => {
  const [visible, setVisible] = useState<boolean>(false);
  const toggle = () => {
    setVisible((visible) => !visible);
  };

  const reset = () => {
    props.onChange(null);
  };

  return (
    <>
      {props.date ? (
        <div className="post-scheduler-scheduled">
          <span className="date" onClick={toggle}>
            {props.date.format("YYYY-MM-DD HH:mm")}
          </span>
          <span className="reset-date" onClick={reset}>
            {closeSvg}
          </span>
        </div>
      ) : (
        <Button className="d-inline-flex align-items-center" size="sm" onClick={toggle}>
          {_t("post-scheduler.btn-label")}
          <span style={{ marginLeft: "6px" }}>{timeSvg}</span>
        </Button>
      )}
      {visible && (
        <Modal
          onHide={toggle}
          show={true}
          centered={true}
          animation={false}
          className="post-scheduler-dialog"
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>{_t("post-scheduler.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DialogBody {...props} onHide={toggle} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default (p: Props) => {
  const props: Props = {
    date: p.date,
    onChange: p.onChange
  };

  return <PostSchedulerDialog {...props} />;
};
