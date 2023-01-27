import React, { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";
import { findRcAccounts, powerRechargeTime, rcPower } from "../../api/hive";
import { _t } from "../../i18n";
import moment, { Moment } from "moment";
import useDebounce from "react-use/lib/useDebounce";
import { RcOperation } from "../../api/bridge";

interface Props {
  username: string;
  operation: RcOperation;
  className?: string;
  width?: number;
  height?: number;
}

export const AvailableCredits = ({ username, className, width, height, operation }: Props) => {
  const [rcpFixed, setRcpFixed] = useState(0);
  const [rcpRechargeDate, setRcpRechargeDate] = useState<Moment>(moment());

  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const [isShow, setIsShow] = useState(false);

  const progressRef = useRef<any>();

  const popper = usePopper(host, popperElement);

  useDebounce(
    () => {
      const percentageComplete = +rcpFixed;
      progressRef.current.style.strokeDashoffset = 100 - percentageComplete;
    },
    200,
    [rcpFixed]
  );

  useEffect(() => {
    fetchRc();
  }, [username]);

  const fetchRc = async () => {
    const response = await findRcAccounts(username);
    const account = response[0];

    setRcpFixed(Math.floor(+rcPower(account)));
    setRcpRechargeDate(moment().add(powerRechargeTime(rcPower(account)), "seconds"));
  };

  const show = () => {
    setIsShow(true);
    popper.update?.();
  };

  const hide = () => {
    setIsShow(false);
    popper.update?.();
  };

  return (
    <>
      <div
        ref={setHost}
        className={
          "available-credits-bar " +
          className +
          (rcpFixed <= 10 ? " danger" : rcpFixed <= 25 ? " warning" : "")
        }
        onMouseOver={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <svg width={width ?? 32} height={height ?? 32} viewBox="-3 -3 38 38">
          <circle cx="16" cy="16" r="15.9155" className="progress-bar__background" />
          <circle
            ref={progressRef}
            cx="16"
            cy="16"
            r="15.9155"
            className="progress-bar__progress js-progress-bar"
          />
        </svg>
        <span className={rcpFixed === 100 ? "small" : ""}>{rcpFixed}</span>
      </div>
      <div
        ref={setPopperElement}
        className={"available-credits-bar-popper " + (isShow ? "show" : "")}
        style={popper.styles.popper}
        {...popper.attributes.popper}
      >
        <div className="p-2">
          {_t("profile-info.rc-power", { n: rcpFixed })}
          <div>
            {rcpFixed !== 100 && (
              <small>{_t("profile-info.recharge-time", { n: rcpRechargeDate.fromNow() })}</small>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
