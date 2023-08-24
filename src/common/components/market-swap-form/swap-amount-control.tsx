import { Form } from "react-bootstrap";
import { _t } from "../../i18n";
import React from "react";
import { MarketAsset } from "./market-pair";
import numeral from "numeral";

export interface Props {
  className?: string;
  balance?: string;
  value: string;
  setValue: (value: string) => void;
  labelKey: string;
  asset: MarketAsset;
  availableAssets: MarketAsset[];
  setAsset: (asset: MarketAsset) => void;
  usdRate: number;
  disabled: boolean;
  elementAfterBalance?: JSX.Element;
  showBalance?: boolean;
  hideChevron?: boolean;
}

export const SwapAmountControl = ({
  value,
  setValue,
  labelKey,
  asset,
  availableAssets,
  setAsset,
  balance,
  usdRate,
  disabled,
  className,
  elementAfterBalance,
  showBalance,
  hideChevron
}: Props) => {
  // Format to x,xxx.xxx
  const formatValue = (newValue: string) => {
    const isInt = /[0-9.]*/.test(newValue);
    if (isInt) {
      const isFirstPoint = newValue[0] === ".";
      if (isFirstPoint) {
        return "";
      }

      const isLastPoint = newValue[newValue.length - 1] === ".";
      if (isLastPoint) {
        return newValue;
      }

      const [integerPart, fractionalPart] = newValue.split(".");
      return (
        numeral(integerPart).format("0,0") +
        (fractionalPart ? "." + fractionalPart.slice(0, 3) : "")
      );
    }
    return value;
  };

  return (
    <Form.Group className={"px-3 pt-3 pb-5 mb-0 border " + className}>
      <Form.Label>{_t(labelKey)}</Form.Label>
      <div className="d-flex align-items-center w-100">
        <div className="w-100">
          <Form.Control
            className="amount-control pl-0"
            value={formatValue(value)}
            disabled={disabled}
            placeholder="0.000"
            onChange={(e) => setValue(formatValue(e.target.value))}
          />
          <small className="usd-balance bold text-secondary">
            ${formatValue(+value.replace(/,/gm, "") * usdRate + "")}
          </small>
        </div>
        <div className="d-flex flex-column align-items-end">
          <select
            disabled={disabled}
            value={asset}
            className={
              "form-control form-control py-2 border-0 h-auto font-weight-bold w-auto mb-2 " +
              (hideChevron ? "hide-chevron" : "")
            }
            onChange={(e) => setAsset(e.target.value as MarketAsset)}
          >
            {availableAssets.map((pairAsset) => (
              <option key={pairAsset} value={pairAsset}>
                {pairAsset}
              </option>
            ))}
          </select>
          {balance && showBalance ? (
            <small className="balance d-block text-secondary text-nowrap">
              {_t("market.balance")}:
              <span
                className="text-primary font-weight-bold cursor-pointer ml-1"
                onClick={() => (disabled ? null : setValue(balance.split(" ")[0]))}
              >
                {balance}
              </span>
            </small>
          ) : (
            <></>
          )}
        </div>
      </div>
      {elementAfterBalance}
    </Form.Group>
  );
};
