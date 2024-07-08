"use client";

import React, { useState } from "react";
import moment from "moment";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";
import { appleSvg, desktopSvg, eyeBoldSvg, eyeSvg, googleSvg } from "@ui/svg";
import i18next from "i18next";
import { Tsx } from "@/features/i18n/helper";
import { Market } from "@/app/_components/market-data/market";
import Link from "next/link";
import { DownloadTrigger } from "@/app/_components/download-trigger";

interface MarketDataProps {
  global: Global;
}

export function MarketData() {
  const theme = useGlobalStore((s) => s.theme);

  const [visible, setVisible] = useState(false);

  const fromTs = moment().subtract(2, "days").format("X");
  const toTs = moment().format("X");

  return (
    <div className="market-data">
      <div className="market-data-header">
        <span className="title flex items-center">
          {i18next.t("market-data.title")}
          <div className="pointer ml-2" onClick={() => setVisible(!visible)}>
            {visible ? eyeSvg : eyeBoldSvg}
          </div>
        </span>
        {visible && (
          <Tsx k="market-data.credits" args={{}}>
            <div className="credits" />
          </Tsx>
        )}
      </div>
      {visible ? (
        <>
          <Market
            label="HIVE"
            coin="hive"
            vsCurrency="usd"
            fromTs={fromTs}
            toTs={toTs}
            formatter="0.000$"
          />
          <Market
            label="HBD"
            coin="hive_dollar"
            vsCurrency="usd"
            fromTs={fromTs}
            toTs={toTs}
            formatter="0.000$"
          />
          <Market
            label="BTC"
            coin="bitcoin"
            vsCurrency="usd"
            fromTs={fromTs}
            toTs={toTs}
            formatter=",$"
          />
          <Market
            label="ETH"
            coin="ethereum"
            vsCurrency="usd"
            fromTs={fromTs}
            toTs={toTs}
            formatter="0.000$"
          />
          <div className="menu-nav">
            <DownloadTrigger>
              <div className="downloads">
                <span className="label">{i18next.t("g.downloads")}</span>
                <span className="icons">
                  <span className="img-apple">{appleSvg}</span>
                  <span className="img-google">{googleSvg}</span>
                  <span className="img-desktop">{desktopSvg}</span>
                </span>
              </div>
            </DownloadTrigger>

            <div className="text-menu">
              <Link className="menu-item" href="/faq">
                {i18next.t("entry-index.faq")}
              </Link>
              <Link className="menu-item" href="/terms-of-service">
                {i18next.t("entry-index.tos")}
              </Link>
              <Link className="menu-item" href="/privacy-policy">
                {i18next.t("entry-index.pp")}
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="p-3 border-l border-[--border-color]">
          <div>
            <Link href="/faq">FAQ</Link>
          </div>
          <div className="my-3">
            <Link href="/terms-of-service">Terms of service</Link>
          </div>
          <div>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </div>
          <div className="mt-3">
            <Link href="/market">Market</Link>
          </div>
        </div>
      )}
    </div>
  );
}
