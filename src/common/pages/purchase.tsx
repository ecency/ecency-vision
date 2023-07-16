import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { connect } from "react-redux";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import React, { useEffect, useState } from "react";
import NavBarElectron from "../../desktop/app/components/navbar";
import NavBar from "../components/navbar";
import { PurchaseQrBuilder } from "../components/purchase-qr";
import queryString from "query-string";
import { ActiveUser } from "../store/active-user/types";
import { PurchaseTypes } from "../components/purchase-qr/purchase-types";

const Purchase = (props: PageProps) => {
  const [username, setUsername] = useState("");
  const [type, setType] = useState(PurchaseTypes.BOOST);
  const [productId, setProductId] = useState("999points");

  const getNavBar = () => {
    return props.global.isElectron ? (
      NavBarElectron({ ...props })
    ) : (
      <NavBar history={props.history} />
    );
  };

  const getMetaProps = () => {
    const account = props.activeUser?.data;
    return account?.__loaded
      ? {
          title: `Boost ${account.profile?.name || account.name}`,
          description: `Boost ${account.profile?.name || account.name}`,
          url: `/purchase?username=${props.activeUser?.username}&type=boost`,
          canonical: `/purchase?username=${props.activeUser?.username}&type=boost`
        }
      : {};
  };

  useEffect(() => {
    const params = queryString.parse(props.location.search);
    if (params.username) {
      setUsername(params.username as string);
    }
    if (params.type) {
      setType(params.type as PurchaseTypes);
    }
    if (params.product_id) {
      setProductId(params.product_id as string);
    }
  }, [props.location]);

  return (
    <>
      <Meta {...getMetaProps()} />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      {getNavBar()}

      <div
        className={
          props.global.isElectron ? "app-content container mt-0 pt-6" : "app-content container"
        }
      >
        <div className="flex items-center w-full justify-center">
          <div className="w-50 border border-[--border-color] rounded-2xl p-4">
            <PurchaseQrBuilder
              activeUser={username ? ({ username } as ActiveUser) : props.activeUser}
              location={props.location}
              queryType={type}
              queryProductId={productId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Purchase);
