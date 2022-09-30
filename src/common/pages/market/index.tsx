import React, { useState } from "react";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { LimitMarketMode } from "./limit-mode";
import { MARKET_MODE_LS_TOKEN, MarketMode } from "./market-mode";
import { get, set } from "../../util/local-storage";
import Feedback from "../../components/feedback";
import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";
import NavBarElectron from "../../../desktop/app/components/navbar";
import { NavBar } from "../../components/navbar";
import Meta from "../../components/meta";
import { ModeSelector } from "./mode-selector";

const MarketPage = (props: PageProps) => {
  const [mode, setMode] = useState<MarketMode>(get(MARKET_MODE_LS_TOKEN, MarketMode.SWAP));
  const [title, setTitle] = useState(_t("market.title"));
  const [description, setDescription] = useState(_t("market.description"));

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
      <div className="d-flex justify-content-center">
        <div className="w-sm-75 p-3 p-sm-0">
          <div style={{ marginBottom: "6rem" }}>{navbar}</div>
          <div className="mb-5 text-center">
            <h2>{_t("market.title")}</h2>
            <Tsx k="market.description">
              <div className="header-description" />
            </Tsx>
          </div>
          <ModeSelector
            mode={mode}
            onSelect={(mode) => {
              setMode(mode);
              set(MARKET_MODE_LS_TOKEN, mode);
            }}
          />
          {mode === MarketMode.LIMIT && <LimitMarketMode {...props} />}
        </div>
      </div>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(MarketPage as any);
