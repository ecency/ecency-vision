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
import { KeyTypes } from "../../helper/onboard";
import { b64uDec, b64uEnc } from "../../util/b64";

interface Props {
 global: Global
 communities: Community[]
}

interface AccountInfo {
  username: string;
  keys: {
    postingpubkey: string;
    ownerpubkey: string;
    activepubkey: string;
    memopubkey: string;
  }
}

const OnboardFriend = (props: Props | any) => {
  const form = useRef(null);
  const { global, communities } = props;

  const [username, setUsername] = useState("")
  const [urlInfo, seturlInfo] = useState<AccountInfo | null>(null)
  const [community, setCommunity] = useState<Community | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let decodedObj;
    try {
      console.log(props.match.params.hash);
      if (props.match.params.hash) {
        const decodedHash = decodeURIComponent(props.match.params.hash);
        decodedObj = JSON.parse(decodedHash);
      }
    } catch (error) {
      console.log(error);
    }
    seturlInfo(decodedObj);
    console.log(decodedObj); // Log the decoded object here
  }, []);
  

  //  Meta config
  const metaProps = {
    title: `Welcome to ${community?.title}`,
  };

  const spinner = (
    <Spinner
      animation="grow"
      variant="light"
      size="sm"
      style={{ marginRight: "6px" }}
    />
  );
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
        <div className="onboard">
            <h5>You are creating an account for a friend</h5>
            <div className="friend-details">
            {urlInfo && (
              <div className="friend-details">
                <span>Username: {urlInfo.username}</span>
                <span>Public posting: {urlInfo.keys.postingpubkey}</span>
                <span>Public Owner: {urlInfo.keys.ownerpubkey}</span>
                <span>Public active: {urlInfo.keys.activepubkey}</span>
                <span>Memo active: {urlInfo.keys.memopubkey}</span>
              </div>
            )}
            </div>
            <div className="button">
                <Button className="w-100">Proceed</Button>   
            </div>
        </div>
      </div>
    </>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(OnboardFriend);
