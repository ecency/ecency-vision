"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { PrivateKey } from "@hiveio/dhive";
import { error } from "../feedback";
import { SearchByUsername } from "../search-by-username";
import { isAfter } from "date-fns";
import { getBoostPlusPricesQuery, useGetBoostPlusAccountPricesQuery } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { boostPlus, boostPlusHot, boostPlusKc, formatError } from "@/api/operations";
import { KeyOrHot, LinearProgress } from "@/features/shared";
import { checkAllSvg } from "@ui/svg";

interface Props {
  onHide: () => void;
}

export function BoostDialog({ onHide }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: prices } = getBoostPlusPricesQuery(activeUser).useClientQuery();

  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState(0);
  const [account, setAccount] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const { data: alreadyBoostAccount } = useGetBoostPlusAccountPricesQuery(account);

  const price = useMemo(
    () => prices?.find((x) => x.duration === duration)?.price ?? 0,
    [prices, duration]
  );
  const balanceError = useMemo(
    () =>
      parseFloat(activeUser?.points.points ?? "0") < price
        ? i18next.t("trx-common.insufficient-funds")
        : "",
    [activeUser, price]
  );
  const isAlreadyBoosted = useMemo(
    () =>
      alreadyBoostAccount && alreadyBoostAccount.expires
        ? isAfter(alreadyBoostAccount.expires, new Date())
        : false,
    [alreadyBoostAccount]
  );
  const canSubmit = useMemo(
    () => !balanceError || !isAlreadyBoosted,
    [balanceError, isAlreadyBoosted]
  );

  useEffect(() => {
    if (prices!.length > 0) {
      setDuration(prices![0].duration);
    }
  }, [prices]);

  const next = () => setStep(step + 1);

  const sign = async (key: PrivateKey) => {
    setInProgress(true);
    try {
      await boostPlus(key, activeUser!.username, account, duration);
      setStep(3);
    } catch (e) {
      error(...formatError(e));
    } finally {
      setInProgress(false);
    }
  };

  const signKc = async () => {
    setInProgress(true);

    try {
      await boostPlusKc(activeUser!.username, account, duration);
      setStep(3);
    } catch (e) {
      error(...formatError(e));
    } finally {
      setInProgress(false);
    }
  };

  const hotSign = () => {
    boostPlusHot(activeUser!.username, account, duration);
    onHide();
  };

  const finish = () => onHide();

  return (
    <Modal
      animation={false}
      show={true}
      centered={true}
      onHide={onHide}
      className="boost-dialog"
      size="lg"
    >
      <ModalHeader thin={true} closeButton={true} />
      <ModalBody>
        <div className="promote-dialog-content">
          {step === 1 && (
            <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
              <div className="transaction-form-header">
                <div className="step-no">1</div>
                <div className="box-titles">
                  <div className="main-title">{i18next.t("boost-plus.title")}</div>
                  <div className="sub-title">{i18next.t("boost-plus.sub-title")}</div>
                </div>
              </div>
              {inProgress && <LinearProgress />}
              <div className="transaction-form-body flex flex-col">
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center">
                    <label>{i18next.t("redeem-common.balance")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <FormControl
                      type="text"
                      className={`balance-input ${balanceError ? "is-invalid" : ""}`}
                      plaintext={true}
                      readOnly={true}
                      value={`${activeUser?.points.points} POINTS`}
                    />
                    {balanceError && <small className="pl-3 text-red">{balanceError}</small>}
                    {isAlreadyBoosted && (
                      <div>
                        <small className="pl-3 text-red">
                          {i18next.t("boost-plus.already-boosted-account")}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center">
                    <label>{i18next.t("redeem-common.account")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <SearchByUsername setUsername={(value: string) => setAccount(value)} />
                  </div>
                </div>
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center">
                    <label>{i18next.t("promote.duration")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <FormControl
                      type="select"
                      value={duration}
                      onChange={(e: ChangeEvent<any>) => setDuration(+e.target.value)}
                      disabled={inProgress}
                    >
                      {prices?.map(({ price, duration }) => (
                        <option value={duration} key={duration}>
                          {`${duration} ${
                            duration === 1 ? i18next.t("g.day") : i18next.t("g.days")
                          } - ${price} POINTS`}
                        </option>
                      ))}
                    </FormControl>
                  </div>
                </div>
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center" />
                  <div className="col-span-12 sm:col-span-10">
                    <Button onClick={next} disabled={!canSubmit || inProgress}>
                      {i18next.t("g.next")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
              <div className="transaction-form-header">
                <div className="step-no">2</div>
                <div className="box-titles">
                  <div className="main-title">{i18next.t("trx-common.sign-title")}</div>
                  <div className="sub-title">{i18next.t("trx-common.sign-sub-title")}</div>
                </div>
              </div>
              {inProgress && <LinearProgress />}
              <div className="transaction-form-body">
                <KeyOrHot inProgress={inProgress} onKey={sign} onHot={hotSign} onKc={signKc} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
              <div className="transaction-form-header">
                <div className="step-no">3</div>
                <div className="box-titles">
                  <div className="main-title">{i18next.t("trx-common.success-title")}</div>
                  <div className="sub-title">{i18next.t("trx-common.success-sub-title")}</div>
                </div>
              </div>
              {inProgress && <LinearProgress />}
              <div className="transaction-form-body">
                <p className="flex justify-center align-content-center">
                  <span className="svg-icon text-green">{checkAllSvg}</span>{" "}
                  {i18next.t("redeem-common.success-message")}
                </p>
                <div className="flex justify-center">
                  <Button onClick={finish}>{i18next.t("g.finish")}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
