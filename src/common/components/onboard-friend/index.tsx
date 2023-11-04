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
import { createHiveAccount, createAccountWithCredit } from "../../api/operations";
import { hexDec } from "../../util/b64";
import { ActiveUser } from "../../store/active-user/types";
import { Link } from "react-router-dom";
import { createBreakawayUser } from "../../api/breakaway";
import { getAccounts } from "../../api/hive";

interface Props {
  activeUser: ActiveUser
  global: Global
  communities: Community[]
}

interface AccountInfo {
  username: string;
  referral: string;
  email: string;
  keys: {
    postingPubKey: string;
    ownerPubKey: string;
    activePubKey: string;
    memoPubKey: string;
  }
}

const OnboardFriend = (props: Props | any) => {
  const { global, communities, activeUser } = props;

  const [urlInfo, seturlInfo] = useState<AccountInfo | null>(null)
  const [community, setCommunity] = useState<Community | null>(null);
  const [step, setStep] = useState("confirm");
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState(0)

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
    getAccountTokens();
  }, []);
  
  const getAccountTokens = async ()=>{
    const acc = await getAccounts([activeUser?.username!]);
      setToken(acc[0]?.pending_claimed_accounts)
  }

  const accountWithCredit = async () => {
    try {
      const response: any = await createAccountWithCredit({
        username: urlInfo?.username,
        keys: urlInfo?.keys
      }, 
      activeUser?.username
      )
      if (response.success === true) {
        setStep("success");
        await createBreakawayUser(urlInfo!.username, props.global.hive_id, urlInfo!.referral, urlInfo!.email)
        setMsg(response.message)
      } else {
        setStep("fail")
        setMsg(response.message)
      }
    } catch (error) {
      
    }
  }

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
        await createBreakawayUser(urlInfo!.username, props.global.hive_id, urlInfo!.referral, urlInfo!.email)
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
        { !activeUser ? <h3>{_t("onboard.login-warning")}</h3> : 
        <div className="onboard">
          {step=== "confirm" && <>
            <h5>{_t("onboard.creating-for-a-friend")}</h5>
            <div className="friend-details">
            {urlInfo && (
              <div className="friend-details">
                <span>{_t("onboard.username")} {urlInfo.username}</span>
                <span>{_t("onboard.public-posting")} {urlInfo.keys.postingPubKey}</span>
                <span>{_t("onboard.public-owner")} {urlInfo.keys.ownerPubKey}</span>
                <span>{_t("onboard.public-active")} {urlInfo.keys.activePubKey}</span>
                <span>{_t("onboard.public-memo")} {urlInfo.keys.memoPubKey}</span>
              </div>
            )}
            </div>
            <div className="create-buttons w-100">
                <Button onClick={()=> createAccount()} className="w-100">Pay with (3Hive)</Button>   
                <Button  
                disabled={token <= 0}
                onClick={()=> accountWithCredit()} 
                className="w-100"
                >
                  Pay with credits
                </Button>   
            </div>
          </>} 
          {step === "success" &&
          <>
            <h4 className="text-success">{msg}</h4>
            <Link to={`/@${urlInfo?.username}`}>Visist @{urlInfo?.username}'s profile</Link>
          </>} 
          {step === "fail" && <>
            <h4 className="text-danger">{msg}</h4>
            <Button onClick={()=> setStep("confirm")}>{_t("onboard.try-again")}</Button>
          </>}
        </div>}
      </div> 
    </>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(OnboardFriend);
