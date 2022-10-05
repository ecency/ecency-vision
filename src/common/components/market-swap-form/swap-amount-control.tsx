import { Form, InputGroup } from "react-bootstrap";
import { _t } from "../../i18n";
import React, { useEffect, useState } from "react";
import { MarketAsset, MarketPairs } from "./market-pair";

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
  return (
    <Form.Group className="px-3 pt-3 pb-5 mb-0 border">
      <Form.Label>{_t(labelKey)}</Form.Label>
      <div className="d-flex align-items-center">
        <div>
          <Form.Control
            className="amount-control pl-0"
            value={value}
            placeholder="0.0"
            onChange={(e) => setValue(e.target.value)}
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
