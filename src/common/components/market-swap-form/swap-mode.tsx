import React from "react";
import { MarketSwapForm } from "./index";
import { _t } from "../../i18n";
import { Link } from "react-router-dom";
import { MarketSwapActiveOrders } from "./market-swap-active-orders";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_swap-mode.scss";
import { Button } from "@ui/button";

interface Props {
  inline?: boolean;
}

export const SwapMode = ({ inline = false }: Props) => {
  const {
    activeUser,
    global,
    addAccount,
    updateActiveUser,
    signingKey,
    setSigningKey,
    toggleUIProp
  } = useMappedStore();

  const form = (
    <>
      {activeUser ? <MarketSwapActiveOrders global={global} activeUser={activeUser} /> : <></>}

      <MarketSwapForm
        padding={inline ? "p-0" : undefined}
        activeUser={activeUser}
        global={global}
        addAccount={addAccount}
        updateActiveUser={updateActiveUser}
        signingKey={signingKey}
        setSigningKey={setSigningKey}
      />
      {!activeUser && (
        <div className="auth-required flex justify-center items-center flex-col">
          <div className="font-bold mb-3">{_t("market.auth-required-title")}</div>
          <div className="mb-3">{_t("market.auth-required-desc")}</div>
          <div className="flex">
            <Button outline={true} className="mr-2" onClick={() => toggleUIProp("login")}>
              {_t("g.login")}
            </Button>
            <Link to="/signup">
              <Button>{_t("g.signup")}</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );

  return inline ? (
    <div className={"swap-form-container " + (inline ? "inline" : "")}>{form}</div>
  ) : (
    <div className="grid grid-cols-12 justify-center pb-5">
      <div className="col-span-12 md:col-span-10 lg:col-span-8 xl:col-span-6">{form}</div>
    </div>
  );
};
