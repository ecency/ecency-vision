import React from "react";
import { MarketSwapActiveOrders } from "./market-swap-active-orders";
import "./_swap-mode.scss";
import { Button } from "@ui/button";
import i18next from "i18next";
import Link from "next/link";
import { useGlobalStore } from "@/core/global-store";
import { MarketSwapForm } from "@/features/market";

interface Props {
  inline?: boolean;
}

export const SwapMode = ({ inline = false }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);

  const form = (
    <>
      {activeUser ? <MarketSwapActiveOrders /> : <></>}

      <MarketSwapForm padding={inline ? "p-0" : undefined} />
      {!activeUser && (
        <div className="auth-required flex justify-center items-center flex-col">
          <div className="font-bold mb-3">{i18next.t("market.auth-required-title")}</div>
          <div className="mb-3">{i18next.t("market.auth-required-desc")}</div>
          <div className="flex">
            <Button outline={true} className="mr-2" onClick={() => toggleUIProp("login")}>
              {i18next.t("g.login")}
            </Button>
            <Link href="/signup">
              <Button>{i18next.t("g.signup")}</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );

  return inline ? (
    <div className={"swap-form-container " + (inline ? "inline" : "")}>{form}</div>
  ) : (
    <div className="grid grid-cols-12 pb-5">
      <div className="col-span-12 md:col-start-2 md:col-span-10 lg:col-start-3 lg:col-span-8 xl:col-start-4 xl:col-span-6 relative">
        {form}
      </div>
    </div>
  );
};
