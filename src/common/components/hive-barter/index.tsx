import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { _t } from "../../i18n";
import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import BuySellHiveDialog, { TransactionType } from "../buy-sell-hive";
import { error } from "../feedback";
import { Skeleton } from "../skeleton";

interface Props {
  type: 1 | 2;
  available: string;
  username: string;
  peakValue: number;
  basePeakValue: number;
  loading: boolean;
  activeUser: ActiveUser;
  global: Global;
  onClickPeakValue: (value: any) => void;
  onTransactionSuccess: () => void;
  prefilledAmount?: any;
  prefilledTotal?: any;
  isInline?: boolean;
}

export const HiveBarter = ({
  type,
  available,
  peakValue,
  loading,
  username,
  basePeakValue,
  onClickPeakValue,
  activeUser,
  global,
  onTransactionSuccess,
  prefilledAmount,
  prefilledTotal,
  isInline
}: Props) => {
  const [price, setPrice] = useState(peakValue.toFixed(6));
  const [amount, setAmount] = useState<any>(0.0);
  const [total, setTotal] = useState<any>(0.0);
  const [transaction, setTransaction] = useState<
    TransactionType.Sell | TransactionType.Buy | TransactionType.None
  >(TransactionType.None);

  useEffect(() => {
    if (peakValue) {
      setPrice(peakValue.toFixed(6));
    }
  }, [peakValue]);

  useEffect(() => {
    if (prefilledAmount) {
      setAmountValue((+prefilledAmount).toFixed(3));
    }
    if (prefilledTotal) {
      setTotalValue((+prefilledTotal).toFixed(3));
    }
  }, [prefilledAmount, prefilledTotal]);

  const fixDecimals = (value: string, decimals: number): string => {
    let splittedValue = value.split(".");
    let valueAfterPoints = splittedValue[1];
    if (valueAfterPoints && valueAfterPoints.length > decimals) {
      valueAfterPoints = valueAfterPoints.substring(0, decimals);
      error(_t("market.decimal-error", { decimals }));
      return `${splittedValue[0] + "." + valueAfterPoints}`;
    }
    return value;
  };

  const setTotalValue = (value: any) => {
    setTotal(isNaN(value) ? 0 : value.includes(".") ? fixDecimals(value, 3) : value);
    setAmount(
      isNaN(`${parseFloat(value) / parseFloat(price)}` as any)
        ? 0
        : parseFloat(`${parseFloat(value) / parseFloat(price)}`).toFixed(3)
    );
  };

  const setAmountValue = (value: any) => {
    setAmount(value.includes(".") ? fixDecimals(value, 3) : value);
    let refinedAmount = value ? parseFloat(value) : 0;
    let total = parseFloat(`${(parseFloat(price) * refinedAmount) as any}`).toFixed(3);
    setTotal(total);
  };

  const setPriceValue = (value: any) => {
    setPrice(value.includes(".") ? fixDecimals(value, 6) : value);
    let refinedAmount = amount ? parseFloat(amount) : 0;
    let total = parseFloat(`${(parseFloat(value) * refinedAmount) as any}`).toFixed(3);
    setTotal(total);
  };

  const getAvailable = (value: string) => value.split(" ")[0];

  const prefillFromBalance = () => {
    if (type === 1) {
      setTotalValue(getAvailable(available));
    } else if (type === 2) {
      setAmountValue(getAvailable(available));
    }
  };

  let totalValue = parseFloat(total);
  const disabled = !(totalValue > 0);

  return loading ? (
    <Skeleton className="loading-hive" />
  ) : (
    <div className={"p-2 " + (isInline ? "flex-1" : "border p-3 rounded")}>
      <div
        className={"d-flex justify-content-between align-items-center " + (isInline ? "mb-3" : "")}
      >
        {isInline ? (
          <span className="font-weight-bold">
            {type === 1 ? _t("market.buy") : _t("market.sell")} HIVE
          </span>
        ) : (
          <h3 className="mb-0">{type === 1 ? _t("market.buy") : _t("market.sell")} HIVE</h3>
        )}
        <div>
          <small className="d-flex cursor-pointer" onClick={() => prefillFromBalance()}>
            <div className="mr-1 text-primary">{_t("market.available")}:</div>
            <div>{available}</div>
          </small>
          <small className="d-flex">
            <div className="mr-1 text-primary">
              {type === 1 ? _t("market.lowest-ask") : _t("market.highest-bid")}:
            </div>
            <div onClick={() => onClickPeakValue(basePeakValue.toFixed(3))} className="pointer">
              {basePeakValue.toFixed(3)}
            </div>
          </small>
        </div>
      </div>
      {isInline ? <></> : <hr />}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          setTransaction(type === 1 ? TransactionType.Buy : TransactionType.Sell);
        }}
      >
        <Form.Group>
          <Form.Label className={isInline ? "font-small" : ""}>{_t("market.price")}</Form.Label>
          <InputGroup>
            <Form.Control
              value={price}
              placeholder="0.0"
              onChange={(e) => setPriceValue(e.target.value)}
            />
            <InputGroup.Text className="rounded-l">HBD/HIVE</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group>
          <Form.Label className={isInline ? "font-small" : ""}>{_t("market.amount")}</Form.Label>
          <InputGroup>
            <Form.Control
              placeholder="0.0"
              value={isNaN(amount) ? 0 : amount}
              onChange={(e) => setAmountValue(e.target.value)}
            />
            <InputGroup.Text className="rounded-l">HIVE</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className={isInline ? "font-small" : ""}>{_t("market.total")}</Form.Label>
          <InputGroup>
            <Form.Control
              placeholder="0.0"
              value={isNaN(total) ? 0 : total}
              onChange={(e) => setTotalValue(e.target.value)}
            />
            <InputGroup.Text className="rounded-l">HBD</InputGroup.Text>
          </InputGroup>
        </Form.Group>
        <Button block={true} type="submit" disabled={disabled}>
          {type === 1 ? _t("market.buy") : _t("market.sell")}
        </Button>
      </Form>
      {transaction !== TransactionType.None && (
        <BuySellHiveDialog
          Ttype={transaction}
          onHide={() => setTransaction(TransactionType.None)}
          global={global}
          onTransactionSuccess={onTransactionSuccess}
          activeUser={activeUser}
          values={{
            total: parseFloat(total),
            amount: parseFloat(amount),
            price: parseFloat(price),
            available: parseFloat(available)
          }}
        />
      )}
    </div>
  );
};
