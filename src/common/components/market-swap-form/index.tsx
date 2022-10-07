import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { swapSvg } from "../../img/svg";
import { SwapAmountControl } from "./swap-amount-control";
import { MarketInfo } from "./market-info";
import { MarketAsset, MarketPairs } from "./market-pair";
import { ActiveUser } from "../../store/active-user/types";
import { getBalance } from "./get-balance";

interface Props {
  activeUser: ActiveUser | null;
}

export const MarketSwapForm = ({ activeUser }: Props) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);

  const [balance, setBalance] = useState("");

  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<MarketAsset[]>([]);

  useEffect(() => {
    const nextAvailableAssets = MarketPairs[toAsset].filter((asset) => asset !== fromAsset);
    if (!nextAvailableAssets.includes(toAsset)) {
      setToAsset(nextAvailableAssets[0]);
    }
    setAvailableAssets(nextAvailableAssets);
    if (activeUser) {
      setBalance(getBalance(fromAsset, activeUser));
    }
  }, [fromAsset]);

  const swap = () => {
    setFromAsset(toAsset);
    setTo(from);
    setFrom(to);
  };

  return (
    <div className="market-swap-form p-4">
      <div className="text-primary font-weight-bold mb-4">{_t("market.swap-title")}</div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <SwapAmountControl
          asset={fromAsset}
          balance={balance}
          availableAssets={MarketPairs[fromAsset]}
          labelKey="market.from"
          value={from}
          setValue={(v) => setFrom(v)}
          setAsset={(v) => setFromAsset(v)}
        />
        <div className="swap-button-container">
          <div className="overlay">
            <Button variant="" className="swap-button border" onClick={swap}>
              {swapSvg}
            </Button>
          </div>
        </div>
        <SwapAmountControl
          asset={toAsset}
          availableAssets={availableAssets}
          labelKey="market.to"
          value={to}
          setValue={(v) => setTo(v)}
          setAsset={(v) => setToAsset(v)}
        />
        <MarketInfo className="mt-4" />
        <Button block={true} type="submit" disabled={disabled || loading} className="py-3 mt-4">
          {loading ? _t("market.swapping") : _t("market.continue")}
        </Button>
      </Form>
    </div>
  );
};
