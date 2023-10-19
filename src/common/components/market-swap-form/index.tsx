import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { SwapAmountControl } from "./swap-amount-control";
import { MarketInfo } from "./market-info";
import { MarketAsset, MarketPairs } from "./market-pair";
import { ActiveUser } from "../../store/active-user/types";
import { getBalance } from "./api/get-balance";
import { getHiveMarketRate, HiveMarketRateListener } from "./api/hive";
import { MarketSwapFormStep } from "./form-step";
import { SignMethods } from "./sign-methods";
import { Global } from "../../store/global/types";
import { MarketSwapFormHeader } from "./market-swap-form-header";
import { checkSvg, swapSvg } from "../../img/svg";
import { MarketSwapFormSuccess } from "./market-swap-form-success";
import "./index.scss";
import { classNameObject } from "../../helper/class-name-object";
import { useCurrencyRateQuery } from "./api/currency-rate-query";
import { useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../core";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { Alert } from "@ui/alert";

export interface Props {
  activeUser: ActiveUser | null;
  global: Global;
  addAccount: any;
  updateActiveUser: any;
  signingKey: string;
  setSigningKey: (key: string) => void;
  padding?: string;
}

export const MarketSwapForm = ({
  activeUser,
  global,
  addAccount,
  updateActiveUser,
  signingKey,
  setSigningKey,
  padding = "p-4"
}: Props) => {
  const [step, setStep] = useState(MarketSwapFormStep.FORM);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isInvalidFrom, setIsInvalidFrom] = useState(false);

  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);

  const [balance, setBalance] = useState("");

  const [marketRate, setMarketRate] = useState(0);

  /**
   * These rates use for showing from asset = to asset in account currency(see account settings)
   */
  const [accountFromMarketRate, setAccountFromMarketRate] = useState(0);
  const [accountToMarketRate, setAccountToMarketRate] = useState(0);

  const [disabled, setDisabled] = useState(false);
  const [isAmountMoreThanBalance, setIsAmountMoreThanBalance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<MarketAsset[]>([]);

  const [tooMuchSlippage, setTooMuchSlippage] = useState(false);

  const { data } = useCurrencyRateQuery(fromAsset, toAsset);
  const query = useQueryClient();

  useEffect(() => {
    fetchMarket();
  }, []);

  useEffect(() => {
    fetchMarket();
  }, [global.currency]);

  useEffect(() => {
    query.invalidateQueries([
      QueryIdentifiers.SWAP_FORM_CURRENCY_RATE,
      global.currency,
      fromAsset,
      toAsset
    ]);
  }, [fromAsset, toAsset, global.currency]);

  useEffect(() => {
    if (data) {
      setAccountFromMarketRate(data[0]);
      setAccountToMarketRate(data[1]);
    }
  }, [data]);

  useEffect(() => {
    if (activeUser) setBalance(getBalance(fromAsset, activeUser));
  }, [activeUser]);

  useEffect(() => {
    validateBalance();
  }, [from, balance]);

  useEffect(() => {
    const nextAvailableAssets = MarketPairs[toAsset];
    if (!nextAvailableAssets.includes(toAsset)) {
      setToAsset(nextAvailableAssets[0]);
      fetchMarket();
    }

    setAvailableAssets(nextAvailableAssets);
    setToAsset(nextAvailableAssets.filter((asset) => asset !== fromAsset)[0]);
    getHiveMarketRate(fromAsset).then((rate) => setMarketRate(rate));
    if (activeUser) setBalance(getBalance(fromAsset, activeUser));

    setAccountFromMarketRate(accountToMarketRate);
    setAccountToMarketRate(accountFromMarketRate);
  }, [fromAsset]);

  const swap = () => {
    setToAsset(fromAsset);
    setFromAsset(toAsset);
    setTo(from);
    setFrom(to);
    setMarketRate(1 / marketRate);
  };

  const fetchMarket = async () => {
    setDisabled(true);
    setMarketRate(await getHiveMarketRate(fromAsset));
    setDisabled(false);
  };

  const submit = () => {
    if (step === MarketSwapFormStep.FORM) setStep(MarketSwapFormStep.SIGN);
  };

  const stepBack = () => {
    if (step === MarketSwapFormStep.SIGN) setStep(MarketSwapFormStep.FORM);
  };

  const numberAmount = (v: string) => +v.replace(/,/gm, "");

  const validateBalance = () => {
    if (balance) {
      let [availableBalance] = balance.split(" ");
      const amount = numberAmount(from);
      const availableBalanceAmount = +availableBalance;

      if (!isNaN(availableBalanceAmount)) {
        setIsAmountMoreThanBalance(amount > availableBalanceAmount);
      }
    }
  };

  const reset = () => {
    setFrom("0");
    setTo("0");
    fetchMarket();
    setStep(MarketSwapFormStep.FORM);
  };

  return (
    <div
      className={classNameObject({
        "market-swap-form": true,
        [padding]: true
      })}
    >
      <HiveMarketRateListener
        amount={from}
        asset={fromAsset}
        setToAmount={(v) => setTo(v)}
        loading={disabled}
        setLoading={(v) => setDisabled(v)}
        setInvalidAmount={(v) => setIsInvalidFrom(v)}
        setTooMuchSlippage={(v) => setTooMuchSlippage(v)}
      />
      <MarketSwapFormHeader
        className={step === MarketSwapFormStep.SUCCESS ? "blurred" : ""}
        step={step}
        loading={loading || disabled}
        onBack={stepBack}
      />
      <Form
        className={step === MarketSwapFormStep.SUCCESS ? "blurred" : ""}
        onSubmit={(e) => submit()}
      >
        <SwapAmountControl
          className={step === MarketSwapFormStep.SIGN ? "mb-3" : ""}
          asset={fromAsset}
          balance={balance}
          availableAssets={MarketPairs[fromAsset]}
          labelKey="market.from"
          value={from}
          setValue={(v) => setFrom(v)}
          setAsset={(v) => setFromAsset(v)}
          usdRate={accountFromMarketRate}
          disabled={
            step === MarketSwapFormStep.SIGN ||
            step === MarketSwapFormStep.SUCCESS ||
            disabled ||
            loading
          }
          showBalance={[MarketSwapFormStep.FORM, MarketSwapFormStep.SIGN].includes(step)}
          elementAfterBalance={
            isAmountMoreThanBalance && step === MarketSwapFormStep.FORM ? (
              <small className="usd-balance bold text-secondary block text-red mt-3">
                {_t("market.more-than-balance")}
              </small>
            ) : (
              <></>
            )
          }
        />
        {[MarketSwapFormStep.FORM, MarketSwapFormStep.SUCCESS].includes(step) ? (
          <div className="swap-button-container">
            <div className="overlay">
              {step === MarketSwapFormStep.FORM ? (
                <Button
                  outline={true}
                  disabled={disabled || loading}
                  className="swap-button !border"
                  onClick={swap}
                  icon={swapSvg}
                />
              ) : (
                <></>
              )}
              {step === MarketSwapFormStep.SUCCESS ? (
                <Button
                  className="swap-button border dark:border-dark-200 text-green"
                  icon={checkSvg}
                />
              ) : (
                <></>
              )}
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
          setValue={(v) => setTo(v)}
          setAsset={(v) => setToAsset(v)}
          usdRate={accountToMarketRate}
          disabled={true}
          hideChevron={true}
        />
        <MarketInfo
          className="mt-4"
          marketRate={marketRate}
          toAsset={toAsset}
          fromAsset={fromAsset}
          usdFromMarketRate={accountFromMarketRate}
        />
        <div>
          {isInvalidFrom ? (
            <Alert appearance="warning" className="mt-4">
              {_t("market.invalid-amount")}
            </Alert>
          ) : (
            <></>
          )}
          {tooMuchSlippage ? (
            <Alert appearance="warning" className="mt-4">
              {_t("market.too-much-slippage")}
            </Alert>
          ) : (
            <></>
          )}
          {step === MarketSwapFormStep.FORM ? (
            <Button
              disabled={disabled || loading || numberAmount(from) === 0 || isAmountMoreThanBalance}
              className="w-full mt-4"
              onClick={() => submit()}
            >
              {_t("market.continue")}
            </Button>
          ) : (
            <></>
          )}
          {step === MarketSwapFormStep.SIGN ? (
            <SignMethods
              global={global}
              disabled={disabled || loading || numberAmount(from) === 0}
              asset={fromAsset}
              activeUser={activeUser}
              loading={loading}
              setLoading={setLoading}
              updateActiveUser={updateActiveUser}
              addAccount={addAccount}
              fromAmount={from}
              toAmount={to}
              marketRate={marketRate}
              onSuccess={() => setStep(MarketSwapFormStep.SUCCESS)}
              signingKey={signingKey}
              setSigningKey={(key) => setSigningKey(key)}
            />
          ) : (
            <></>
          )}
        </div>
      </Form>
      {step === MarketSwapFormStep.SUCCESS ? (
        <MarketSwapFormSuccess
          from={from}
          to={to}
          fromAsset={fromAsset}
          toAsset={toAsset}
          onReset={() => reset()}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
