import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { swapSvg } from "../../img/svg";
import { SwapAmountControl } from "./swap-amount-control";

export const MarketSwapForm = () => {
  const [from, setFrom] = useState("");
  const [fromAsset, setFromAsset] = useState("HIVE");
  const [to, setTo] = useState("");
  const [toAsset, setToAsset] = useState("HBD($)");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="market-swap-form p-3">
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
        <Button
          size="lg"
          block={true}
          type="submit"
          disabled={disabled || loading}
          className="mt-4"
        >
          {loading ? _t("market.swapping") : _t("market.continue")}
        </Button>
      </Form>
    </div>
  );
};
