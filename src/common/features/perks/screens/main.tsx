import React, { useState } from "react";
import Feedback from "../../../components/feedback";
import NavBar from "../../../components/navbar";
import Meta from "../../../components/meta";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps } from "../../../pages/common";
import { MajorPerkCard, PerksHeader } from "../components";
import { PurchaseQrDialog } from "../../../components/purchase-qr";
import { useLocation } from "react-router";
import { PurchaseTypes } from "../../../components/purchase-qr/purchase-types";
import Promote from "../../../components/promote";
import Boost from "../../../components/boost";
import { UilChart, UilFire, UilMoneyWithdraw, UilRocket } from "@iconscout/react-unicons";

interface Props {
  history: History;
}

export function EcencyPerks({ history }: Props) {
  const { activeUser, global, setSigningKey, signingKey, updateActiveUser } = useMappedStore();
  const location = useLocation();

  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showBuyPointsDialog, setShowBuyPointsDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showBoostDialog, setShowBoostDialog] = useState(false);

  return (
    <div className="bg-blue-duck-egg dark:bg-transparent pt-[63px] md:pt-[69px] min-h-[100vh] pb-16">
      <Feedback activeUser={activeUser} />
      <NavBar history={history} />
      <Meta title={_t("perks.page-title")} />

      <div className="container mx-auto">
        <div className="grid grid-cols-12 items-stretch gap-6">
          <div className="col-span-12">
            <PerksHeader />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title="Buy points"
              actionText="Buy"
              subtitle="Jump start to improve engagement on your content by purchasing Points with Ecency Mobile"
              img={require("../../../img/reward.png")}
              icon={<UilMoneyWithdraw />}
              onClick={() => setShowBuyPointsDialog(true)}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title="Account boosting"
              actionText="Boost now!"
              subtitle="Use Points or In-App purchase to acquire extra powers"
              img={require("../../../img/like.png")}
              icon={<UilRocket />}
              onClick={() => setShowPurchaseDialog(true)}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title="Promote your post"
              img={require("../../../img/writer.png")}
              icon={<UilChart />}
              actionText="Promote"
              subtitle="Impressions boost that will increase eyeballs on your content"
              onClick={() => setShowPromoteDialog(true)}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <MajorPerkCard
              title="Boost+"
              actionText="Boost+"
              subtitle="Boost your account with your points in few clicks"
              img={require("../../../img/writer-thinking.png")}
              icon={<UilFire />}
              onClick={() => setShowBoostDialog(true)}
            />
          </div>
        </div>
      </div>
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={setShowPurchaseDialog}
        activeUser={activeUser}
        location={location}
      />
      <PurchaseQrDialog
        type={PurchaseTypes.POINTS}
        show={showBuyPointsDialog}
        setShow={setShowBuyPointsDialog}
        activeUser={activeUser}
      />
      {showPromoteDialog && (
        <Promote
          activeUser={activeUser!}
          onHide={() => setShowPromoteDialog(false)}
          global={global}
          setSigningKey={setSigningKey}
          signingKey={signingKey}
          updateActiveUser={updateActiveUser}
        />
      )}
      {showBoostDialog && <Boost onHide={() => setShowBoostDialog(false)} />}
    </div>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(EcencyPerks);
