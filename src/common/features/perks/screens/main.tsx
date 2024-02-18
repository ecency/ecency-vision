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
import { rocketSvg } from "../../../img/svg";
import { walletIconSvg } from "../../../components/decks/icons";
import { PurchaseQrDialog } from "../../../components/purchase-qr";
import { useLocation } from "react-router";
import { PurchaseTypes } from "../../../components/purchase-qr/purchase-types";
import Promote from "../../../components/promote";
import Boost from "../../../components/boost";

interface Props {
  history: History;
}

export function EcencyPerks({ history }: Props) {
  const { activeUser, global, setSigningKey, signingKey, updateActiveUser, dynamicProps } =
    useMappedStore();
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
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <PerksHeader />
          </div>
          <div className="col-span-6">
            <MajorPerkCard
              title="Account boosting"
              actionText="Boost now!"
              subtitle="Be first"
              img={require("../../../img/writer.png")}
              icon={rocketSvg}
              onClick={() => setShowPurchaseDialog(true)}
            />
          </div>
          <div className="col-span-6">
            <MajorPerkCard
              title="Buy points"
              actionText="Buy"
              subtitle="Buy points"
              img={require("../../../img/writer.png")}
              icon={walletIconSvg}
              onClick={() => setShowBuyPointsDialog(true)}
            />
          </div>
          <div className="col-span-6">
            <MajorPerkCard
              title="Promote your post"
              img={require("../../../img/writer.png")}
              actionText="Promote"
              subtitle="Boost your post"
              onClick={() => setShowBoostDialog(true)}
            />
          </div>
          <div className="col-span-6">
            <MajorPerkCard
              title="Boost your post"
              actionText="Boost"
              subtitle="Promote your post"
              img={require("../../../img/writer.png")}
              onClick={() => setShowPromoteDialog(true)}
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
      {showBoostDialog && (
        <Boost
          global={global}
          setSigningKey={setSigningKey}
          signingKey={signingKey}
          updateActiveUser={updateActiveUser}
          activeUser={activeUser!}
          onHide={() => setShowBoostDialog(false)}
          dynamicProps={dynamicProps}
        />
      )}
    </div>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(EcencyPerks);
