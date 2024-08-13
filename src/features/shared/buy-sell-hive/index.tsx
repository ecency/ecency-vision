"use client";

import React, { useState } from "react";
import { error } from "../feedback";
import {
  formatError,
  limitOrderCancel,
  limitOrderCancelHot,
  limitOrderCancelKc,
  limitOrderCreate,
  limitOrderCreateHot,
  limitOrderCreateKc
} from "@/api/operations";
import { PrivateKey } from "@hiveio/dhive";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Button } from "@ui/button";
import i18next from "i18next";
import { KeyOrHot } from "@/features/shared/key-or-hot";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFull } from "@/api/hive";
import { BuySellHiveTransactionType } from "@/enums";

interface Props {
  type: BuySellHiveTransactionType;
  onHide: () => void;
  values?: { total: number; amount: number; price: number; available: number };
  onTransactionSuccess: () => void;
  orderid?: any;
}

export function BuySellHiveDialog({
  onHide,
  type,
  orderid,
  values: { amount, price, total, available } = {
    amount: 0,
    price: 0,
    total: 0,
    available: 0
  },
  onTransactionSuccess
}: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);

  const [step, setStep] = useState(1);
  const [inProgress, setInProgress] = useState(false);

  const updateAll = (a: any) => {
    // update active
    updateActiveUser(a);
    setInProgress(false);
    setStep(3);
    onTransactionSuccess();
  };

  const promiseCheck = (p: any) => {
    p &&
      p
        .then(() => getAccountFull(activeUser!.username))
        .then((a: any) => updateAll(a))
        .catch((err: any) => {
          error(...formatError(err));
          setInProgress(false);
          onHide();
        });
  };

  const sign = (key: PrivateKey) => {
    setInProgress(true);
    if (type === BuySellHiveTransactionType.Cancel && orderid) {
      promiseCheck(limitOrderCancel(activeUser!.username, key, orderid));
    } else {
      promiseCheck(limitOrderCreate(activeUser!.username, key, total, amount, type));
    }
  };

  const signHs = () => {
    setInProgress(true);
    if (type === BuySellHiveTransactionType.Cancel && orderid) {
      promiseCheck(limitOrderCancelHot(activeUser!.username, orderid));
    } else {
      promiseCheck(limitOrderCreateHot(activeUser!.username, total, amount, type));
    }
  };

  const signKc = () => {
    setInProgress(true);
    if (type === BuySellHiveTransactionType.Cancel && orderid) {
      promiseCheck(limitOrderCancelKc(activeUser!.username, orderid));
    } else {
      promiseCheck(limitOrderCreateKc(activeUser!.username, total, amount, type));
    }
  };

  const finish = () => {
    onTransactionSuccess();
    onHide();
  };

  const formHeader1 = (
    <div className="flex items-center border-b border-[--border-color] pb-3">
      <div className="step-no ml-3">{step}</div>
      <div className="grow">
        <div className="main-title">{i18next.t("transfer.confirm-title")}</div>
        <div className="sub-title">{i18next.t("transfer.confirm-sub-title")}</div>
      </div>
    </div>
  );

  const formHeader4 = (
    <div className="transaction-form-header">
      <div className="step-no">{step}</div>
      <div className="box-titles">
        <div className="main-title">{i18next.t("trx-common.success-title")}</div>
        <div className="sub-title">{i18next.t("trx-common.success-sub-title")}</div>
      </div>
    </div>
  );

  return (
    <Modal show={true} centered={true} onHide={onHide} className="transfer-dialog" size="lg">
      <ModalHeader closeButton={true} />
      <ModalBody>
        {step === 1 && (
          <div className="mb-3">
            {formHeader1}
            <div className="flex justify-center">
              {type === BuySellHiveTransactionType.Cancel ? (
                <div className="mt-5 w-75 text-center sub-title whitespace-pre-wrap">
                  {i18next.t("market.confirm-cancel", { orderid: orderid })}
                </div>
              ) : (
                <div className="mt-5 w-75 text-center sub-title whitespace-pre-wrap">
                  {available < (type === BuySellHiveTransactionType.Buy ? total : amount)
                    ? i18next.t("market.transaction-low")
                    : i18next.t("market.confirm-buy", {
                        amount,
                        price,
                        total,
                        balance: parseFloat((available - total) as any).toFixed(3)
                      })}
                </div>
              )}
            </div>
            {available < (type === BuySellHiveTransactionType.Buy ? total : amount) ? (
              <></>
            ) : (
              <div className="flex justify-end mt-5">
                <div className="flex">
                  <Button appearance="secondary" className="mr-3" onClick={onHide}>
                    {i18next.t("g.cancel")}
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    appearance={type === BuySellHiveTransactionType.Cancel ? "danger" : "primary"}
                  >
                    {i18next.t("g.continue")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="transaction-form">
            {formHeader1}
            <div className="transaction-form">
              <KeyOrHot inProgress={inProgress} onKey={sign} onHot={signHs} onKc={signKc} />
              <p className="text-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();

                    setStep(1);
                  }}
                >
                  {i18next.t("g.back")}
                </a>
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="transaction-form">
            {formHeader4}
            <div className="transaction-form-body flex flex-col items-center">
              <div className="my-5 w-75 text-center sub-title whitespace-pre-wrap">
                {i18next.t("market.transaction-succeeded")}
              </div>
              <div className="flex justify-center">
                <span className="hr-6px-btn-spacer" />
                <Button onClick={finish}>{i18next.t("g.finish")}</Button>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
