"use client";

import { MarketMode } from "@/app/market/_enums/market-mode";
import { ModeSelector } from "@/app/market/_components/mode-selector";
import React from "react";
import { Feedback, Navbar } from "@/features/shared";
import { Tsx } from "@/features/i18n/helper";
import { SwapMode } from "@/features/market";
import i18next from "i18next";
import { useRouter } from "next/navigation";

export default function MarketSwapPage() {
  const router = useRouter();

  return (
    <>
      <Feedback />
      <div className={"flex justify-center market-page " + MarketMode.SWAP}>
        <div className="sm:w-[75%] p-3 sm:p-0">
          <div style={{ marginBottom: "6rem" }}>
            <Navbar />
          </div>
          <div className="mb-5 flex flex-col gap-3 text-center">
            <h2 className="text-3xl font-bold">{i18next.t("market.title")}</h2>
            <Tsx k="market.description">
              <div className="header-description" />
            </Tsx>
          </div>
          <ModeSelector
            className="mb-5 mx-auto equal-widths max-w-[600px]"
            mode={MarketMode.SWAP}
            onSelect={(mode) => {
              switch (mode) {
                case MarketMode.ADVANCED:
                  router.push("/market/advanced");
                  break;
                case MarketMode.LIMIT:
                  router.push("/market/limit");
                  break;
                default:
                  break;
              }
            }}
          />
          <SwapMode />
        </div>
      </div>
    </>
  );
}
