import React, { useEffect, useState } from "react";
import Meta from "../components/meta";
import { connect } from "react-redux";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import Feedback, { error } from "../components/feedback";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { Button, Form } from "react-bootstrap";
import { copyContent, downloadSvg, regenerateSvg, shareVariantSvg } from "../img/svg";
import { success } from "../components/feedback";
import "./onboard.scss";
import { _t } from "../i18n";
import { generatePassword, getPrivateKeys, createAccountKc, createAccountHs } from "../api/operations";

const Onboard: React.FC = (props: PageProps | any) => {

  const [masterPassword, setMasterPassword] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<any>({});
  const [hashInput, setHashInput] = useState<string>("");
  const [step, setStep] = useState<string>("enter-hash");
  const [decodedInfo, setDecodedInfo] = useState<any>({});
  
  useEffect(() => {
    initAccountKey();
    console.log(props.match)
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
      }    
      // stringify object to encode
      const stringified_pub_keys = JSON.stringify(dataToEncode);
      // encode stringified object
      const hashed_pub_keys = btoa(stringified_pub_keys);
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

  const decodeHash = (hash: string) => {
    const decoded_hash = atob(hash);
    const hashInfo = JSON.parse(decoded_hash)
    console.log(hashInfo)
    setDecodedInfo(hashInfo)
  }

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    switch(text) {
      case masterPassword:
        return success(_t("onboard.copy-password"));
      case hash:
        return success(_t("onboard.copy-hash"));
      default:
        return;
    }
  };

  const handleTextFileDownload = (data: any) => {
    const textContent = JSON.stringify(data);
  
    const file = new File([textContent], 'data.txt', {
      type: 'text/plain',
    });
    const downloadLink = URL.createObjectURL(file);
  
    const aTag = document.createElement('a');
    aTag.href = downloadLink;
    aTag.download = 'data.txt';
    document.body.appendChild(aTag);  
    aTag.click();  
    document.body.removeChild(aTag);
    URL.revokeObjectURL(downloadLink);
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
                        onClick={() => handleTextFileDownload(accountInfo)}
                        >
                          {_t("onboard.download-keys")} {downloadSvg}
                        </Button>
                <div className="d-flex align-items-center mt-3">
                  <span className="">{_t("onboard.share")}</span>
                  <span style={{width: "5%"}} className="onboard-svg ml-3"
                  onClick={() => copyToClipboard(hash)}
                  >
                    {/* {shareVariantSvg} */}
                    {copyContent}
                  </span> 
                </div>
                    </div>
                </div>
            </div>
        </div>}
        {props.match.params.type === "creating" && props.activeUser && step === "enter-hash" && <div className="onboard-container">          
            <div className="creating">
              <h3 className="align-self-center">{_t("onboard.create-account")}</h3>
              <Form className="d-flex flex-column">
                <Form.Group> 
                <Form.Control
                      type="text"
                      placeholder="Enter hash"
                      // value={hash}
                      onChange={(e) => setHashInput(e.target.value)}
                      autoFocus={true}
                      required={true}
                      // onInvalid={(e: any) => handleInvalid(e, "sign-up.", "validation-username")}
                      // isInvalid={usernameError !== ""}
                      // onInput={handleOnInput}
                      // onBlur={() => setUsernameTouched(true)}
                    />                  
                </Form.Group>
                <Button className="align-self-center w-50"
                onClick={() => {
                  decodeHash(hashInput);
                  setStep("confirm-creating")
                }}
                >{_t("onboard.continue")}</Button>
              </Form>
            </div>
        </div>}
        {props.match.params.type === "creating" && props.activeUser && step === "confirm-creating" && <div className="onboard-container">          
            <div className="creating-confirm">
              <h3 className="align-self-center">{_t("onboard.confirm-details")}</h3>
              <span>{_t("onboard.username")} {decodedInfo.username}</span>
              <span>{_t("onboard.email")} {decodedInfo.email}</span>
              <span>Active key: {decodedInfo?.pub_keys?.active_public_key}</span>
              <span>Posting key: {decodedInfo?.pub_keys?.posting_public_key}</span>
              <span>memo Key: {decodedInfo?.pub_keys?.memo_public_key}</span>
              <span>Owner Key: {decodedInfo?.pub_keys?.owner_public_key}</span>
              <Button className="align-self-center"
              onClick={() => createAccountKc({
                username: decodedInfo.username,
                 pub_keys: decodedInfo.pub_keys
                }, props.activeUser.username)}
              >{_t("onboard.create-account")}</Button>
            </div>
        </div>}
    </>
  )
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Onboard);