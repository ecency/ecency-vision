import React, { useEffect, useState } from "react";
import Meta from "../components/meta";
import { connect } from "react-redux";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import Feedback from "../components/feedback";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { Button, Form, Modal } from "react-bootstrap";
import { copyContent, downloadSvg, regenerateSvg } from "../img/svg";
import { success } from "../components/feedback";
import "./onboard.scss";
import { _t } from "../i18n";
import { generatePassword, getPrivateKeys, createAccountKc, createAccountWithCredit, getAcountCredit } from "../api/operations";
import { Link } from "react-router-dom";

const Onboard: React.FC = (props: PageProps | any) => {

  const onboardUrl = `localhost:3000/onboard-friend/creating/`

  const [masterPassword, setMasterPassword] = useState("");
  const [hash, setHash] = useState("");
  const [accountInfo, setAccountInfo] = useState<any>({});
  const [decodedInfo, setDecodedInfo] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [accountCredit, setAccountCredit] = useState(0);
  const [createOption, setCreateOption] = useState("");
  const [fileIsDownloaded, setFileIsDownloaded] = useState(false)
  
  useEffect(() => {
    initAccountKey();

    try{
      if (props.match.params.hash) {
        const decoded_hash = JSON.parse(decodeURIComponent(props.match.params.hash));
        setDecodedInfo(decoded_hash)
        getCredit()
    }
    }catch(err){
      console.log(err)
    }
    
  }, [props.global.accountName])

  const initAccountKey = async () => {
    try {
      const master_password: any = await generatePassword(32);
      const keys:any = await getPrivateKeys(props.global.accountName , master_password);
      // prepare object to encode
      const pub_keys = {
        active_public_key: keys.activePubkey,
        memo_public_key: keys.memoPubkey,
        owner_public_key: keys.ownerPubkey,
        posting_public_key: keys.postingPubkey,
      };

      const dataToEncode = {
        username: props.global.accountName,
        email: props.global.accountEmail,
        pub_keys
      };
      // stringify object to encode
      const stringified_pub_keys = JSON.stringify(dataToEncode);
      // encode stringified object
      const hashed_pub_keys = encodeURIComponent(stringified_pub_keys);
      setHash(hashed_pub_keys)
      const accInfo = {
        username: props.global.accountName,
        email: props.global.accountEmail,
        keys
      }
      setAccountInfo(accInfo)
      setMasterPassword(master_password)
     return master_password;
    } catch (err: any) {
      console.error(err?.message);
      return null;
    }
  };

  const getCredit = async () => {
    const accountCredit = await getAcountCredit("ecency")
    // const accountCredit = await getAcountCredit(props.activeUser.username)
    console.log(accountCredit)
    setAccountCredit(accountCredit)
  }

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("onboard.copy-link"));
  };

  const splitUrl = (url: string) => {
      return url.slice(0,50)
  }

  const downloadKeys = async () => {
    setFileIsDownloaded(false)
   const {username, keys} = accountInfo;
      const element = document.createElement('a');
      const keysToFile = `
        ${_t("onboard.file-warning")}

        ${_t("onboard.recomend")}
        1. ${_t("onboard.recomend-print")}
        2. ${_t("onboard.recomend-use")}
        3. ${_t("onboard.recomend-save")}
        4. ${_t("onboard.recomend-third-party")}

        ${_t("onboard.recomend-account-info")}

        Username: ${username}

        Password: ${masterPassword}

        Owner: ${keys.owner}

        Active: ${keys.active}

        Posting: ${keys.posting}

        Memo: ${keys.memo}

        ${_t("onboard.public-owner")} ${keys.ownerPubkey},

        ${_t("onboard.public-active")} ${keys.activePubkey},

        ${_t("onboard.public-posting")} ${keys.postingPubkey},

        ${_t("onboard.public-memo")} ${keys.memoPubkey},


        ${_t("onboard.keys-use")}

        ${_t("onboard.owner")} ${_t("onboard.owner-use")}   
        ${_t("onboard.active")} ${_t("onboard.active-use")}  
        ${_t("onboard.posting")} ${_t("onboard.posting-use")} 
        ${_t("onboard.memo")} ${_t("onboard.memo-use")}`;

      const file = new Blob([keysToFile.replace(/\n/g, '\r\n')], {
        type: 'text/plain',
      });
      element.href = URL.createObjectURL(file);
      element.download = `${username}_hive_keys.txt`;
      document.body.appendChild(element);
      element.click();
      setFileIsDownloaded(true)
  };

  return (
    <>
      <Meta title="onborad" />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      <NavBar history={props.history} />
      {props.match.params.type === "asking" && !props.activeUser && <div className="onboard-container">
            <div className="asking">
                <div className="d-flex mb-0 d-flex align-self-center flex-column p-5">                    
                    <h3 className="mb-3 align-self-center">{_t("onboard.asking-confirm")}</h3>
                    <div className="reg-details">                      
                      <span>{_t("onboard.username")} {props.global.accountName}</span>
                      <span>{_t("onboard.email")} {props.global.accountEmail}</span>
                      <span>{_t("onboard.referral")} {props.global.referral}</span>
                    </div>
                    <span className="mt-3">{_t("onboard.copy-key")}</span>
                    <div className="mt-3 d-flex flex-column align-self-center">
                      <div className="d-flex">                        
                        <span className="mr-3">{masterPassword}</span>
                        <span className="onboard-svg mr-3"
                        onClick={() => copyToClipboard(masterPassword)}
                        >{copyContent}</span>
                        <span className="onboard-svg"
                        onClick={() => initAccountKey()}
                        >{regenerateSvg}</span>
                      </div>
                        <Button className="d-flex align-self-center justify-content-center w-50"
                        onClick={() => {
                          downloadKeys()
                        }}
                        >
                          {_t("onboard.download-keys")} {downloadSvg}
                        </Button>

                {/* {   */}
                {fileIsDownloaded && <div className="d-flex flex-column align-self-center justify-content-center mt-3">
                  <h4>Copy account link and send to a friend</h4>
                  <div className="d-flex align-items-center">
                    <span className="">{splitUrl(onboardUrl + hash)}...</span>
                    <span style={{width: "5%"}} className="onboard-svg"
                    onClick={() => {
                      copyToClipboard(onboardUrl + hash)
                    }}
                    >                    
                      {copyContent}
                    </span> 
                  </div>
                </div>}
                </div>
                </div>
            </div>
        </div>}

        {props.match.params.type === "creating"  && props.match.params.hash && <div className="onboard-container">          
            {props.activeUser ? <div className="creating-confirm">
              <h3 className="align-self-center">{_t("onboard.confirm-details")}</h3>
              <span>{_t("onboard.username")} {decodedInfo.username}</span>
              <span>{_t("onboard.public-owner")} {decodedInfo?.pub_keys?.owner_public_key}</span>
              <span>{_t("onboard.public-active")} {decodedInfo?.pub_keys?.active_public_key}</span>
              <span>{_t("onboard.public-posting")} {decodedInfo?.pub_keys?.posting_public_key}</span>
              <span>{_t("onboard.public-memo")} {decodedInfo?.pub_keys?.memo_public_key}</span>
              <div className="creating-confirm-bottom">
                <span>{_t("onboard.pay-fee")}</span>
                <div className="onboard-btn-container">                
                  <Button className="align-self-center"
                  onClick={() =>{ 
                    setCreateOption("hive")
                    setShowModal(true);                   
                    // showConfirmModal()
                  }}
                  >{_t("onboard.create-account-hive")}</Button>
                  <Button 
                  className="align-self-center"
                  disabled={accountCredit <= 0}
                  onClick={() => {
                    setCreateOption("credit")
                    setShowModal(true);                   
                  }}
                  >{_t("onboard.create-account-credit")}</Button>
                </div>
              </div>
            </div> :
            <div>{_t("onboard.login-warning")}</div>
            }
        </div>}
        <Modal
          animation={false}
          show={showModal}
          centered={true}
          onHide={()=>setShowModal(false)}
          keyboard={false}
          className="transfer-dialog modal-thin-header"
          // size="lg"
        >
          <Modal.Header closeButton={true}>
            <Modal.Title />
          </Modal.Header>
          <Modal.Body>
            <div  className="d-flex flex-column">
              <h4>{_t("onboard.modal-title")}</h4>
              {accountCredit <= 0 || createOption === "hive" && <Button 
              className="w-50 align-self-center"
              onClick={() => {
                  createAccountKc({
                    username: decodedInfo.username,
                    pub_keys: decodedInfo.pub_keys
                    }, props.activeUser.username);
                    setShowModal(false);
                    // hideConfirmModal();
              }}
              >
                {_t("onboard.modal-confirm")}
              </Button>}
              {accountCredit > 0 && createOption === "credit" && <Button 
              className="w-50 align-self-center"
              onClick={() => {
                createAccountWithCredit({
                  username: decodedInfo.username,
                  pub_keys: decodedInfo.pub_keys
                  }, props.activeUser.username);
                  setShowModal(false);
                  // hideConfirmModal();
              }}
              >
                {_t("onboard.modal-confirm")}
              </Button>}
            </div>
          </Modal.Body>
        </Modal>
    </>
  )
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Onboard);