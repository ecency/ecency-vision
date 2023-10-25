import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { Button, Spinner } from "react-bootstrap";
import { pageMapStateToProps, pageMapDispatchToProps, PageProps } from "../../pages/common";
import Meta from "../meta";
import Theme from "../theme/index";
import NavBar from "../navbar/index";
import NavBarElectron from "../../../desktop/app/components/navbar";
import Feedback, { error } from "../feedback";
import ScrollToTop from "../scroll-to-top";
import { _t } from "../../i18n";
import { Global } from "../../store/global/types";
import { Community } from "../../store/communities/types";
import { createHiveAccount } from "../../api/operations";
import { hexDec } from "../../util/b64";
import { ActiveUser } from "../../store/active-user/types";
import { Link } from "react-router-dom";
import { createBreakawayUser } from "../../api/breakaway";

interface Props {
  activeUser: ActiveUser
 global: Global
 communities: Community[]
}

interface AccountInfo {
  username: string;
  keys: {
    postingPubKey: string;
    ownerPubKey: string;
    activePubKey: string;
    memoPubKey: string;
  }
}

const OnboardFriend = (props: Props | any) => {
  const form = useRef(null);
  const { global, communities, activeUser } = props;

  const [urlInfo, seturlInfo] = useState<AccountInfo | null>(null)
  const [community, setCommunity] = useState<Community | null>(null);
  const [step, setStep] = useState("confirm");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let decodedObj;
    try {
      if (props.match.params.hash) {
        const decodedHash = hexDec(props.match.params.hash);
        decodedObj = JSON.parse(decodedHash);
      }
    } catch (error) {
      console.log(error);
    }
    seturlInfo(decodedObj);
  }, []);

  const createAccount = async ()=> {
    try {
      const response: any = await createHiveAccount({
        username: urlInfo?.username,
        keys: urlInfo?.keys
      }, 
      activeUser?.username
      );
      if (response.success === true) {
        setStep("success");
        await createBreakawayUser(urlInfo!.username, "Rally")
        setMsg(response.message)
      } else {
        setStep("fail")
        setMsg(response.message)
      }
    } catch (error) {
      console.log(error)
    };
  };

  const metaProps = {
    title: `Welcome to ${community?.title}`,
  };

  let containerClasses = global.isElectron
    ? "app-content sign-up-page mb-lg-0 mt-0 pt-6"
    : "app-content sign-up-page mb-lg-0";

  return (
    <>
      <Meta {...metaProps} />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback />
      {global.isElectron
        ? NavBarElectron({
            ...props,
          })
        : NavBar({ ...props })}
      <div className={containerClasses}>
        { !activeUser ? <h3>You must be logged in to create an account</h3> : 
        <div className="onboard">
          {step=== "confirm" && <>
            <h5>You are creating an account for a friend</h5>
            <div className="friend-details">
            {urlInfo && (
              <div className="friend-details">
                <span>Username: {urlInfo.username}</span>
                <span>Public posting: {urlInfo.keys.postingPubKey}</span>
                <span>Public Owner: {urlInfo.keys.ownerPubKey}</span>
                <span>Public active: {urlInfo.keys.activePubKey}</span>
                <span>Memo active: {urlInfo.keys.memoPubKey}</span>
              </div>
            )}
            </div>
            <div className="button">
                <Button onClick={()=> createAccount()} className="w-100">Proceed</Button>   
            </div>
          </>} 
          {step === "success" &&
          <>
            <h4 className="text-success">{msg}</h4>
            <Link to={`/@${urlInfo?.username}`}>Visist @{urlInfo?.username}'s profile</Link>
          </>} 
          {step === "fail" && <>
            <h4 className="text-danger">{msg}</h4>
            <Button onClick={()=> setStep("confirm")}>Try again</Button>
          </>}
        </div>}
      </div> 
    </>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(OnboardFriend);
