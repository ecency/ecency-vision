"use client";

import { MarketObserver } from "@/app/market/advanced/_advanced-mode/pairs";
import { UserBalanceObserver } from "@/app/market/advanced/_advanced-mode/user-balance-observer";
import { AdvancedModeToolbar } from "@/app/market/advanced/_advanced-mode/advanced-mode-toolbar";
import { WidgetLayoutBuilder } from "@/app/market/advanced/_advanced-mode/widget-layout-builder";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "@/utils/local-storage";
import { DEFAULT_LAYOUT } from "./_advanced-mode/consts/default-layouts.const";
import GridLayout from "react-grid-layout";
import { useState } from "react";
import { MarketAsset } from "@/features/market/market-swap-form/market-pair";
import { DAY_CHANGE_DEFAULT } from "./_advanced-mode/consts/day-change.const";
import { DayChange } from "./_advanced-mode/types/day-change.type";
import { OpenOrdersData, OrdersData, Transaction } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { MarketMode } from "@/app/market/_enums/market-mode";
import { useRouter } from "next/navigation";
import "../index.scss";
import { Feedback, Navbar } from "@/features/shared";

export default function MarketAdvancedPage() {
  const router = useRouter();

  const activeUser = useGlobalStore((s) => s.activeUser);

  // AMM – advanced mode market
  // AMML – advanced mode market layout
  const [lsLayout, setLsLayout] = useLocalStorage<GridLayout.Layouts>(PREFIX + "_amml");
  const [updateRate, setUpdateRate] = useLocalStorage<number>(PREFIX + "_amm_ur", 10000);

  const [layout, setLayout] = useState<GridLayout.Layouts>(lsLayout ?? DEFAULT_LAYOUT);
  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);
  const [dayChange, setDayChange] = useState<DayChange>(DAY_CHANGE_DEFAULT);
  const [price, setPrice] = useState(0);
  const [usdPrice, setUsdPrice] = useState(0);
  const [history, setHistory] = useState<OrdersData | null>(null);
  const [buyBalance, setBuyBalance] = useState<string>("0");
  const [sellBalance, setSellBalance] = useState<string>("0");
  const [amount, setAmount] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [openOrdersData, setOpenOrdersData] = useState<OpenOrdersData[]>([]);
  const [openOrdersDataLoading, setOpenOrdersDataLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<Transaction[]>([]);

  return (
    <>
      <Feedback />
      <div className={"flex justify-center market-page " + MarketMode.ADVANCED}>
        <div className="w-full">
          <div style={{ marginBottom: "6rem" }}>
            <Navbar />
          </div>
          <div className="advanced-mode">
            <MarketObserver
              updateRate={updateRate!}
              setAllOrders={setAllOrders}
              refresh={refresh}
              setRefresh={setRefresh}
              fromAsset={fromAsset}
              toAsset={toAsset}
              onDayChange={(dayChange) => setDayChange(dayChange)}
              onHistoryChange={(history) => setHistory(history)}
              onUsdChange={(usdPrice) => setUsdPrice(usdPrice)}
              setOpenOrdersDataLoading={setOpenOrdersDataLoading}
              setOpenOrders={setOpenOrdersData}
            />
            <UserBalanceObserver
              fromAsset={fromAsset}
              setBuyBalance={(v) => setBuyBalance(v)}
              setSellBalance={(v) => setSellBalance(v)}
            />
            <AdvancedModeToolbar
              fromAsset={fromAsset}
              toAsset={toAsset}
              dayChange={dayChange}
              price={price}
              usdPrice={usdPrice}
              mode={MarketMode.ADVANCED}
              setMode={(mode) => {
                switch (mode) {
                  case MarketMode.SWAP:
                    router.push("/market/swap");
                    break;
                  case MarketMode.LIMIT:
                    router.push("/market/limit");
                    break;
                  default:
                    break;
                }
              }}
              updateRate={updateRate!}
              setUpdateRate={setUpdateRate}
            />
            <div className="advanced-mode-layout">
              <WidgetLayoutBuilder
                allOrders={allOrders}
                usdPrice={usdPrice}
                layout={layout}
                price={price}
                amount={amount}
                toAsset={toAsset}
                fromAsset={fromAsset}
                sellBalance={sellBalance}
                buyBalance={buyBalance}
                history={history}
                dayChange={dayChange}
                setPrice={setPrice}
                setAmount={setAmount}
                setLayout={(layout) => {
                  setLayout(layout);
                  setLsLayout(layout);
                }}
                onSuccessTrade={() => setRefresh(true)}
                openOrdersData={openOrdersData}
                openOrdersDataLoading={openOrdersDataLoading}
                setOpenOrders={setOpenOrdersData}
                setRefresh={setRefresh}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
