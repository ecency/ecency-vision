import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { LimitMarketMode } from "./limit-mode";
import { MARKET_MODE_LS_TOKEN, MarketMode } from "./market-mode";
import * as ls from "../../util/local-storage";
import Feedback from "../../components/feedback";
import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";
import NavBarElectron from "../../../desktop/app/components/navbar";
import NavBar from "../../components/navbar";
import Meta from "../../components/meta";
import { ModeSelector } from "./mode-selector";
import { AdvancedMode } from "./advanced-mode";
import "./index.scss";
import { SwapMode } from "../../components/market-swap-form/swap-mode";

const MarketPage = (props: PageProps) => {
  const [mode, setMode] = useState<MarketMode>(MarketMode.SWAP);
  const [title, setTitle] = useState(_t("market.title"));
  const [description, setDescription] = useState(_t("market.description"));

  useEffect(() => {
    const hash = props.location.hash;
    if (hash === "#swap") setMode(MarketMode.SWAP);
    if (hash === "#limit") setMode(MarketMode.LIMIT);
    if (hash === "#advanced") setMode(MarketMode.ADVANCED);
  }, []);

  const navbar = props.global.isElectron ? (
    NavBarElectron({
      ...props,
      reloadFn: () => {},
      reloading: false
    })
  ) : (
    <NavBar {...props} />
  );

  return (
    <>
      <Meta title={title} description={description} />
      <Feedback activeUser={props.activeUser} />
      <div className={"d-flex justify-content-center market-page " + mode}>
        <div className={mode !== MarketMode.ADVANCED ? "w-sm-75 p-3 p-sm-0" : "w-100"}>
          <div style={{ marginBottom: "6rem" }}>{navbar}</div>
          {mode !== MarketMode.ADVANCED ? (
            <div className="mb-5 text-center">
              <h2>{_t("market.title")}</h2>
              <Tsx k="market.description">
                <div className="header-description" />
              </Tsx>
            </div>
          ) : (
            <></>
          )}
          {mode !== MarketMode.ADVANCED ? (
            <ModeSelector
              className="mb-5 mx-auto equal-widths"
              mode={mode}
              onSelect={(mode) => {
                setMode(mode);
                ls.set(MARKET_MODE_LS_TOKEN, mode);
              }}
            />
          ) : (
            <></>
          )}
          {mode === MarketMode.SWAP && <SwapMode />}
          {mode === MarketMode.LIMIT && <LimitMarketMode {...props} />}
          {mode === MarketMode.ADVANCED && (
            <AdvancedMode {...props} browserHistory={props.history} mode={mode} setMode={setMode} />
          )}
        </div>
      </div>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(MarketPage as any);
