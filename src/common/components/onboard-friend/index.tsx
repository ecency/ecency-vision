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
import { createHiveAccount, createAccountWithCredit, delegateRcKc, delegateRC } from "../../api/operations";
import { hexDec } from "../../util/b64";
import { ActiveUser } from "../../store/active-user/types";
import { Link } from "react-router-dom";
import { createBreakawayUser } from "../../api/breakaway";
import { getAccounts } from "../../api/hive";
import { FormControl, InputGroup } from "react-bootstrap";
import { getRcOperationStats } from "../../api/hive";

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
  const [rcAmount, setRcAmount] = useState(30)
  const [isChecked, setChecked] = useState(true);
  const [commentAmount, setCommentAmount] = useState(0);
  const [voteAmount, setVoteAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [customJsonAmount, setCustomJsonAmount] = useState(0);
  const [rcError, setRcError] = useState("");

  useEffect(() => {
    console.log(global)
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
  
  useEffect(() => {
    getAccountTokens();
  }, [token])

  useEffect(() => {
    rcOperationsCost();
  }, [rcAmount])

  useEffect(() => {
    if (!isChecked) {
      setRcAmount(0);
    }
  }, [isChecked])
  
  const getAccountTokens = async ()=>{
    const acc = await getAccounts([activeUser?.username!]);
      setToken(acc[0]?.pending_claimed_accounts)
  }

  const accountWithCredit = async () => {
    setStep("creating")
    try {
      const response: any = await createAccountWithCredit({
        username: urlInfo?.username,
        keys: urlInfo?.keys
      }, 
      activeUser?.username
      )
      if (response.success === true) {
        if(isChecked){
          await delegateRC(activeUser?.username, urlInfo!.username, rcAmount * 1e9)
        }
        await createBreakawayUser(urlInfo!.username, props.global.hive_id, urlInfo!.referral, urlInfo!.email)
        setStep("success");
        setMsg("Account created successfully")
      } else {
        setStep("fail")
        setMsg("Unable to create account")
      }
    } catch (error) {
      
    }
  }

  const createAccountNoUserKcCredit = async () => {
    setStep("creating")
    try {
      const response: any = await createAccountWithCredit({
        username: urlInfo?.username,
        keys: urlInfo?.keys
      }, 
      urlInfo!.referral
      )
      if (response.success === true) {
        if(isChecked){
          await delegateRcKc(urlInfo!.referral, urlInfo!.username, rcAmount * 1e9)
        }
        await createBreakawayUser(urlInfo!.username, props.global.hive_id, urlInfo!.referral, urlInfo!.email)
        setStep("success");
        setMsg("Account created successfully")
      } else {
        setStep("fail")
        setMsg("Unable to create account")
      }
    } catch (error) {
      
    }
  }  

  const createAccount = async ()=> {
    setStep("creating")
    try {
      const response: any = await createHiveAccount({
        username: urlInfo?.username,
        keys: urlInfo?.keys
      }, 
      activeUser?.username || null
      );
      if (response.success === true) {
        if(isChecked){
          await delegateRC(urlInfo!.referral, urlInfo!.username, rcAmount * 1e9)
        }
        await createBreakawayUser(urlInfo!.username, props.global.hive_id, urlInfo!.referral, urlInfo!.email)
        setStep("success");
        setMsg("Account created successfully")
      } else {
        setStep("fail")
        setMsg("Unable to create acount")
      }
    } catch (error) {
      console.log(error)
    };
  };

  const createAccountNoUser = async ()=> {
    setStep("creating")
    try {
      const response: any = await createHiveAccount({
        username: urlInfo?.username,
        keys: urlInfo?.keys
      }, 
      urlInfo!.referral
      );
      
      if (response.success === true) {
        if(isChecked){
          await delegateRcKc(urlInfo!.referral, urlInfo!.username, rcAmount * 1e9)
        }
        await createBreakawayUser(urlInfo!.username, props.global.hive_id, urlInfo!.referral, urlInfo!.email)
        setStep("success");
        setMsg("Account created successfully")
      } else {
        setStep("fail")
        setMsg("Unable to create acount")
      }
    } catch (error) {
      console.log(error)
    };
  };

  const metaProps = {
    title: `Welcome to ${community?.title}`,
  };

  const rcOperationsCost = async () => {
    const rcStats: any = await getRcOperationStats();
    const operationCosts = rcStats.rc_stats.ops;
    const commentCost = operationCosts.comment_operation.avg_cost;
    const transferCost = operationCosts.transfer_operation.avg_cost;
    const voteCost = operationCosts.vote_operation.avg_cost;
    const customJsonOperationsCosts = operationCosts.custom_json_operation.avg_cost;
    const createClaimAccountCost = Number(operationCosts.claim_account_operation.avg_cost);
    if(Number(rcAmount * 1e9) < 5000000000) {
      console.log("too low rc")
      setRcError("You can not delegate below 5bn Rc")
    } else {
      setRcError("")
    }

    const commentCount: number = Math.ceil(Number(rcAmount * 1e9) / commentCost);
    const votetCount: number = Math.ceil(Number(rcAmount * 1e9) / voteCost);
    const transferCount: number = Math.ceil(Number(rcAmount * 1e9) / transferCost);
    const customJsonCount: number = Math.ceil(Number(rcAmount * 1e9) / customJsonOperationsCosts);
   
    setCommentAmount(commentCount);
    setVoteAmount(votetCount);
    setTransferAmount(transferCount);
    setCustomJsonAmount(customJsonCount);
    // setClaimAccountAmount(createClaimAccountCount);
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
      <div className={`${containerClasses} d-flex align-items-center justify-content-center mt-5`}>
        { !activeUser ? <div className="d-flex justify-content-center">
          <div className="onboard w-100">
          {step === "creating" &&
            <div className="animation-container">
              <h4>Creating Account</h4>
              <h5 className="text-success animation-text">Please wait...</h5>
            </div>
          } 
          {step=== "confirm" && <>
            <h5 className="text-center">{_t("onboard.creating-for-a-friend")}</h5>
            <div className="friend-details">
            {urlInfo && (
              <div className="friend-details">
                <span>{_t("onboard.username")} {urlInfo.username}</span>
              </div>
            )}
            </div>
            <div className="delegate-rc">
              <div className="col-span-12 sm:col-span-10">
                <div className="check mb-2">
                  <input 
                    type="checkbox" 
                    className="checkbox" 
                    checked={isChecked} 
                    onChange={() => {setChecked(!isChecked)}}
                    />
                      <span className="blinking-text">Delegate some resource credits to @{urlInfo!?.username} (Minimum Rc is 5Bn)</span>
                </div>
                    {rcError ? <span className="text-danger mt-3">{rcError}</span> : ""}
                {isChecked &&
                <div className="mt-3">
                  <InputGroup>
                    <FormControl
                      type="text"
                      placeholder={"Enter amount to delegate(Bn)"}
                      value={rcAmount}
                      onChange={(e: any) => {
                        setRcAmount(Number(e.target.value))
                      }}
                    />
                  </InputGroup>
                  <div className="operation-amount d-flex mt-3">
                    <span className="operations">Posts/Comment: {commentAmount} |</span>
                    <span className="operations">Votes: {voteAmount} |</span>
                    <span className="operations">Transfers: {transferAmount} |</span>
                    <span className="operations">Reblogs/ Follows: {customJsonAmount}</span>
                  </div>
                </div>
                }
              </div>
            </div>
            <div className="pay-wrapper">
              <span>Pay with:</span>
              <div className="create-buttons w-100">
                  <Button
                  disabled={rcError !== ""} 
                  onClick={()=> createAccountNoUser()} 
                  className="w-100"
                  >
                    3Hive
                  </Button>   
                  <Button  
                  disabled={token <= 0 || rcError !== ""}
                  onClick={()=> createAccountNoUserKcCredit()} 
                  className="w-100"
                  >
                  Account token
                  </Button>   
              </div>
            </div>
            <div className="friend-details">
            {urlInfo && (
              <div className="friend-details">
                <span>Account public keys</span>
                <span>{_t("onboard.public-posting")} {urlInfo.keys.postingPubKey}</span>
                <span>{_t("onboard.public-owner")} {urlInfo.keys.ownerPubKey}</span>
                <span>{_t("onboard.public-active")} {urlInfo.keys.activePubKey}</span>
                <span>{_t("onboard.public-memo")} {urlInfo.keys.memoPubKey}</span>
              </div>
            )}
            </div>
          </>} 
          {step === "success" &&
          <>
            <h4 className="text-success">{msg}</h4>
            <Link to={`/@${urlInfo?.username}`}>Visit @{urlInfo?.username}'s profile</Link>
          </>
          } 
          {step === "fail" && <>
            <h4 className="text-danger">{msg}</h4>
            <Button onClick={()=> setStep("confirm")}>{_t("onboard.try-again")}</Button>
          </>}
        </div>
        </div> :
        <div className="onboard">
          {step === "creating" &&
            <div className="animation-container">
              <h4>Creating Account</h4>
              <span className="text-success animation-text">Please wait...</span>
            </div>
          } 
          {step=== "confirm" && <>
            <h5>{_t("onboard.creating-for-a-friend")}</h5>
            <div className="friend-details">
            {urlInfo && (
              <div className="friend-details">
                <span>{_t("onboard.username")} {urlInfo.username}</span>
              </div>
            )}
            </div>

            <div className="delegate-rc">
              <div className="col-span-12 sm:col-span-10">
                <div className="check mb-2">
                  <input 
                    type="checkbox" 
                    className="checkbox" 
                    checked={isChecked} 
                    onChange={() => {
                      setChecked(!isChecked)
                    }}
                  />
                  <span className="blinking-text">Delegate some resource credits to @{urlInfo!?.username} (Minimum Rc is 5Bn)</span>
                </div>
                  {rcError ? <span className="text-danger mt-3">{rcError}</span> : ""}
                {isChecked &&
                <div className="mt-3">
                  <InputGroup>
                    <FormControl
                      type="text"
                      placeholder={"Enter amount to delegate(Bn)"}
                      value={rcAmount}
                      onChange={(e: any) => setRcAmount(Number(e.target.value))}
                    />
                  </InputGroup>
                  <div className="operation-amount">
                    <span className="operations">Posts/Comment: {commentAmount} |</span>
                    <span className="operations">Votes: {voteAmount} |</span>
                    <span className="operations">Transfers: {transferAmount} |</span>
                    <span className="operations">Reblogs/ Follows: {customJsonAmount}</span>
                  </div>
                </div>
                }
              </div>
            </div>
            
            <div className="pay-wrapper">
              <span>Pay With:</span>
              <div className="create-buttons">
                  <Button 
                  disabled={rcError !== ""}
                    onClick={()=> createAccount()} 
                    className="w-100"
                  >
                    3Hive
                  </Button>   
                  <Button  
                    disabled={token <= 0 || rcError !== ""}
                    onClick={()=> accountWithCredit()} 
                    className="w-100"
                  >
                    account token
                  </Button>   
              </div>
            </div>
            <div className="friend-details mt-3">
            {urlInfo && (
              <div className="friend-details">
                <span>Account public keys</span>
                <span>{_t("onboard.public-posting")} {urlInfo.keys.postingPubKey}</span>
                <span>{_t("onboard.public-owner")} {urlInfo.keys.ownerPubKey}</span>
                <span>{_t("onboard.public-active")} {urlInfo.keys.activePubKey}</span>
                <span>{_t("onboard.public-memo")} {urlInfo.keys.memoPubKey}</span>
              </div>
            )}
            </div>
          </>}
          
          {step === "success" &&
          <>
            <h4 className="text-success">{msg}</h4>
            <Link to={`/@${urlInfo?.username}`}>Visit @{urlInfo?.username}'s profile</Link>
          </>
          } 
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