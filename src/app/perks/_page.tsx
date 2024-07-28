"use client";

import React, { useState } from "react";
import {
  BoostDialog,
  Feedback,
  Navbar,
  Promote,
  PurchaseQrDialog,
  PurchaseTypes
} from "@/features/shared";
import Head from "next/head";
import i18next from "i18next";
import { MajorPerkCard, PerksHeader } from "@/app/perks/components";
import { UilChart, UilFire, UilMoneyWithdraw, UilRocket } from "@iconscout/react-unicons";

export function PerksPage() {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showBuyPointsDialog, setShowBuyPointsDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showBoostDialog, setShowBoostDialog] = useState(false);

  return (
    <div className="bg-blue-duck-egg dark:bg-transparent pt-[63px] md:pt-[69px] min-h-[100vh] pb-16">
      <Feedback />
      <Navbar />
      <Head>
        <title>{i18next.t("perks.page-title")}</title>
      </Head>

      <div className="container mx-auto">
        <div className="grid grid-cols-12 items-stretch gap-6">
          <div className="col-span-12">
            <PerksHeader />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title={i18next.t("perks.points-title")}
              actionText={i18next.t("perks.points-action")}
              subtitle={i18next.t("perks.points-description")}
              img="/assets/reward.png"
              icon={<UilMoneyWithdraw />}
              onClick={() => setShowBuyPointsDialog(true)}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title={i18next.t("perks.account-boost-title")}
              actionText={i18next.t("perks.account-boost-action")}
              subtitle={i18next.t("perks.account-boost-description")}
              img="/assets/like.png"
              icon={<UilRocket />}
              onClick={() => setShowPurchaseDialog(true)}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title={i18next.t("perks.promote-title")}
              img="/assets/writer.png"
              icon={<UilChart />}
              actionText={i18next.t("perks.promote-action")}
              subtitle={i18next.t("perks.promote-description")}
              onClick={() => setShowPromoteDialog(true)}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title={i18next.t("perks.boost-plus-title")}
              actionText={i18next.t("perks.boost-plus-action")}
              subtitle={i18next.t("perks.boost-plus-description")}
              img="/assets/writer-thinking.png"
              icon={<UilFire />}
              onClick={() => setShowBoostDialog(true)}
            />
          </div>
        </div>
      </div>
      <PurchaseQrDialog show={showPurchaseDialog} setShow={setShowPurchaseDialog} />
      <PurchaseQrDialog
        type={PurchaseTypes.POINTS}
        show={showBuyPointsDialog}
        setShow={setShowBuyPointsDialog}
      />
      {showPromoteDialog && <Promote onHide={() => setShowPromoteDialog(false)} />}
      {showBoostDialog && <BoostDialog onHide={() => setShowBoostDialog(false)} />}
    </div>
  );
}
