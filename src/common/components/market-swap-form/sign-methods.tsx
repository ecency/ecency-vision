import { MarketSwappingMethods, SwappingMethod } from "./api/swapping";
import { _t } from "../../i18n";
import { Button } from "react-bootstrap";
import React from "react";
import { MarketAsset } from "./market-pair";
import { Global } from "../../store/global/types";
import { hsLogoSvg, kcLogoSvg } from "../../img/svg";

interface Props {
  disabled: boolean;
  asset: MarketAsset;
  global: Global;
}

export const SignMethods = ({ disabled, asset, global }: Props) => {
  const hsLogo = global.isElectron ? "./img/hive-signer.svg" : require("../../img/hive-signer.svg");
  const keyChainLogo = global.isElectron ? "./img/keychain.png" : require("../../img/keychain.png");

  return (
    <div>
      {MarketSwappingMethods[asset].includes(SwappingMethod.KEY) ? (
        <Button block={true} disabled={disabled} variant="outline-primary" className="py-3 mt-4">
          {_t("market.swap-by", { method: "key" })}
        </Button>
      ) : (
        <></>
      )}
      {MarketSwappingMethods[asset].includes(SwappingMethod.HS) ? (
        <Button block={true} disabled={disabled} className="py-3 mt-4 hs-button">
          <i className="sign-logo mr-3">{hsLogoSvg}</i>
          {_t("market.swap-by", { method: "Hivesigner" })}
        </Button>
      ) : (
        <></>
      )}
      {MarketSwappingMethods[asset].includes(SwappingMethod.KC) ? (
        <Button block={true} disabled={disabled} className="py-3 mt-4 kc-button">
          <i className="sign-logo mr-3">{kcLogoSvg}</i>
          {_t("market.swap-by", { method: "Keychain" })}
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
