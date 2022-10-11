import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { _t } from "../../i18n";
import { swapSvg, syncSvg } from "../../img/svg";
import { SwapAmountControl } from "./swap-amount-control";
import { MarketInfo } from "./market-info";
import { MarketAsset, MarketPairs } from "./market-pair";
import { ActiveUser } from "../../store/active-user/types";
import { getBalance } from "./api/get-balance";
import { getMarketRate } from "./api/get-market-rate";
import { getCGMarket } from "./api/coingecko-api";
import { MarketSwapFormStep } from "./form-step";
import { SignMethods } from "./sign-methods";
import { Global } from "../../store/global/types";
import { MarketSwapFormHeader } from "./market-swap-form-header";

interface Props {
  activeUser: ActiveUser | null;
  global: Global;
}

export const MarketSwapForm = ({ activeUser, global }: Props) => {
  const [step, setStep] = useState(MarketSwapFormStep.FORM);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);

  const [balance, setBalance] = useState("");

  const [marketRate, setMarketRate] = useState(0);
  const [usdFromMarketRate, setUsdFromMarketRate] = useState(0);
  const [usdToMarketRate, setUsdToMarketRate] = useState(0);

  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<MarketAsset[]>([]);

  let interval: any;

  useEffect(() => {
    fetchMarket();
    // interval = setInterval(() => fetchMarket(), 20000);
    return () => {
      // clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (activeUser) setBalance(getBalance(fromAsset, activeUser));
  }, [activeUser]);

  useEffect(() => {
    const nextAvailableAssets = MarketPairs[toAsset].filter((asset) => asset !== fromAsset);
    if (!nextAvailableAssets.includes(toAsset)) {
      setToAsset(nextAvailableAssets[0]);
      fetchMarket();
    }

    setAvailableAssets(nextAvailableAssets);
    if (activeUser) setBalance(getBalance(fromAsset, activeUser));
  }, [fromAsset]);

  const swap = () => {
    setFromAsset(toAsset);
    setTo(from);
    setFrom(to);
    setUsdFromMarketRate(usdToMarketRate);
    setUsdToMarketRate(usdFromMarketRate);
  };

  const fetchMarket = async () => {
    setDisabled(true);
    setMarketRate(await getMarketRate(fromAsset));
    setDisabled(false);

    const [fromUsdRate, toUsdRate] = await getCGMarket(fromAsset, toAsset);
    setUsdFromMarketRate(fromUsdRate);
    setUsdToMarketRate(toUsdRate);
  };

  const submit = () => {
    if (step === MarketSwapFormStep.FORM) setStep(MarketSwapFormStep.SIGN);
    else if (step === MarketSwapFormStep.SIGN) {
    }
  };

  const back = () => {
    if (step === MarketSwapFormStep.SIGN) setStep(MarketSwapFormStep.FORM);
  };

  return (
    <div className="market-swap-form p-4">
      <MarketSwapFormHeader step={step} loading={loading || disabled} onBack={back} />
      <Form onSubmit={(e) => submit()}>
        <SwapAmountControl
          className={step === MarketSwapFormStep.SIGN ? "mb-3" : ""}
          asset={fromAsset}
          balance={balance}
          availableAssets={MarketPairs[fromAsset]}
          labelKey="market.from"
          value={from}
          setValue={(v) => {
            setFrom(v);
            setTo(marketRate * +v.replace(/,/gm, "") + "");
          }}
          setAsset={(v) => setFromAsset(v)}
          usdRate={usdFromMarketRate}
          disabled={step === MarketSwapFormStep.SIGN}
        />
        {step === MarketSwapFormStep.FORM ? (
          <div className="swap-button-container">
            <div className="overlay">
              <Button variant="" className="swap-button border" onClick={swap}>
                {swapSvg}
              </Button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <SwapAmountControl
          asset={toAsset}
          availableAssets={availableAssets}
          labelKey="market.to"
          value={to}
          setValue={(v) => {
            setTo(v);
            setFrom(+v.replace(/,/gm, "") / marketRate + "");
          }}
          setAsset={(v) => setToAsset(v)}
          usdRate={usdToMarketRate}
          disabled={step === MarketSwapFormStep.SIGN}
        />
        <MarketInfo
          className="mt-4"
          marketRate={marketRate}
          toAsset={toAsset}
          fromAsset={fromAsset}
          usdFromMarketRate={usdFromMarketRate}
        />
        <div>
          {step === MarketSwapFormStep.FORM ? (
            <Button
              block={true}
              disabled={disabled || loading}
              className="py-3 mt-4"
              onClick={() => submit()}
            >
              {loading ? _t("market.swapping") : _t("market.continue")}
            </Button>
          ) : (
            <></>
          )}
          {step === MarketSwapFormStep.SIGN ? (
            <SignMethods global={global} disabled={disabled || loading} asset={fromAsset} />
          ) : (
            <></>
          )}
        </div>
      </Form>
    </div>
  );
};
