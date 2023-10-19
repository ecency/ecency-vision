import React, { useState } from "react";
import Datetime from "react-datetime";
import moment, { Moment } from "moment";
import { _t } from "../../i18n";
import { closeSvg, timeSvg } from "../../img/svg";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Button } from "@ui/button";

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
  const [error, setError] = useState(false);
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
              if ((date as Moment).format("x") <= moment().format("x")) {
                setError(true);
              } else {
                setError(false);
                setDate(date as Moment);
              }
            }}
          />
        </div>
        {error && (
          <div className="error">
            <small className="error-info">{_t("post-scheduler.error-message")}</small>
          </div>
        )}
        <div className="text-center">
          <Button
            disabled={error}
            onClick={() => {
              if (error) {
                return;
              }
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
        <Button className="inline-flex items-center" size="sm" onClick={toggle} icon={timeSvg}>
          {_t("post-scheduler.btn-label")}
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
          <ModalHeader closeButton={true}>
            <ModalTitle>{_t("post-scheduler.title")}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <DialogBody {...props} onHide={toggle} />
          </ModalBody>
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
