import { Form, InputGroup } from "react-bootstrap";
import { _t } from "../../i18n";
import React from "react";
import { MarketAsset } from "./market-pair";
import numeral from "numeral";

interface Props {
  value: string;
  setValue: (value: string) => void;
  labelKey: string;
  asset: MarketAsset;
  availableAssets: MarketAsset[];
  setAsset: (asset: MarketAsset) => void;
}

export const SwapAmountControl = ({
  value,
  setValue,
  labelKey,
  asset,
  availableAssets,
  setAsset
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
      console.log(integerPart, fractionalPart);
      return (
        numeral(integerPart).format("0,0") +
        (fractionalPart ? "." + fractionalPart.slice(0, 3) : "")
      );
    }
    return value;
  };

  return (
    <Form.Group className="px-3 pt-3 pb-5 mb-0 border">
      <Form.Label>{_t(labelKey)}</Form.Label>
      <div className="d-flex align-items-center">
        <div>
          <Form.Control
            className="amount-control pl-0"
            value={value}
            placeholder="0.000"
            onChange={(e) => setValue(formatValue(e.target.value))}
          />
          <small className="usd-balance bold text-secondary">$0.000</small>
        </div>
        <InputGroup.Append>
          <div className="d-flex flex-column align-items-end">
            <select
              value={asset}
              className="form-control form-control py-2 border-0 h-auto font-weight-bold w-auto mb-2"
              onChange={(e) => setAsset(e.target.value as MarketAsset)}
            >
              {availableAssets.map((pairAsset) => (
                <option key={pairAsset} value={pairAsset}>
                  {pairAsset}
                </option>
              ))}
            </select>
            <small className="balance d-block text-secondary">
              {_t("market.balance")}:
              <span className="text-primary font-weight-bold cursor-pointer ml-1">0.000</span>
            </small>
          </div>
        </InputGroup.Append>
      </div>
    </Form.Group>
  );
};
