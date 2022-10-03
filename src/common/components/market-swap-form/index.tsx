import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { swapSvg } from "../../img/svg";
import { SwapAmountControl } from "./swap-amount-control";
import { MarketInfo } from "./market-info";

export const MarketSwapForm = () => {
  const [from, setFrom] = useState("");
  const [fromAsset, setFromAsset] = useState("HIVE");
  const [to, setTo] = useState("");
  const [toAsset, setToAsset] = useState("HBD($)");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="market-swap-form p-4">
      <div className="text-primary font-weight-bold mb-4">{_t("market.swap-title")}</div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <SwapAmountControl labelKey="market.from" value={from} setValue={(v) => setFrom(v)} />
        <div className="swap-button-container">
          <div className="overlay">
            <Button variant="" className="swap-button border">
              {swapSvg}
            </Button>
          </div>
        </div>
        <SwapAmountControl labelKey="market.to" value={to} setValue={(v) => setTo(v)} />
        <MarketInfo className="mt-4" />
        <Button block={true} type="submit" disabled={disabled || loading} className="py-3 mt-4">
          {loading ? _t("market.swapping") : _t("market.continue")}
        </Button>
      </Form>
    </div>
  );
};
