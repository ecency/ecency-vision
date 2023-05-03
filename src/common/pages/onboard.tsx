import React, { useEffect, useState } from "react";
import Meta from "../components/meta";
import { connect } from "react-redux";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import Feedback, { error } from "../components/feedback";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { Button } from "react-bootstrap";
import { useParams } from "react-router"
import { copyContent, downloadSvg, regenerateSvg, shareVariantSvg } from "../img/svg";
import { success } from "../components/feedback";
import "./onboard.scss";
import { _t } from "../i18n";
import { generatePassword, getPrivateKeys } from "../api/operations";
import crypto from "crypto";

const Onboard: React.FC = (props: PageProps | any) => {
  const params:any = useParams();
  

  const [privateKey, setPrivateKey] = useState("")
  const [harsh, setHarsh] = useState("")

  // TEST KEYS DOWNLOAD
  const data = { active: "STMafsufufd", memo: "STMafsufufd", posting: "STMafsufufd", owner: "STMafsufufd" };

  // const getNavBar = () => {
  //   return props.global.isElectron ? (
  //     NavBarElectron({ ...props })
  //   ) : (
  //     <NavBar history={props.history} />
  //   );
  // };
  
  useEffect(() => {
    initAccountKey();
    console.log(params)
  }, [props.global.accountName])

  const initAccountKey = async () => {
    try {
      const master_password: any = await generatePassword(32);
      const passwordHash = crypto.createHash('sha256').update(master_password).digest('hex');
      const keys:any = await getPrivateKeys(props.global.accountName , master_password)
      console.log(keys, 'keys');
      setHarsh(passwordHash)
      setPrivateKey(master_password)
     return master_password;
    } catch (err: any) {
      console.error(err?.message);
      return null;
    }
  };

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("private key copied"));
  };

  const createAndDownloadTextFile = (data: any) => {
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
    console.log("doenloading...")
  };

  return (
    <>
      <Meta title="onborad" />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      <NavBar history={props.history} />
        <div className="onboard-container">
            <div className="asking">
                <div className="d-flex mb-0 d-flex align-self-center flex-column p-5">                    
                    <h3 className="mb-3">{_t("onboard.asking-description")}</h3>
                    <div className="reg-details">                      
                      <span>{_t("onboard.username")} {props.global.accountName}</span>
                      <span>{_t("onboard.email")} {props.global.accountEmail}</span>
                      <span>{_t("onboard.referral")} {props.global.referral}</span>
                    </div>
                    <span className="mt-3">{_t("onboard.copy-key")}</span>
                    <div className="mt-3 d-flex flex-column align-self-center">
                      <div className="d-flex">                        
                        <span className="mr-3">{privateKey}</span>
                        <span className="onboard-svg mr-3"
                        onClick={() => copyToClipboard(privateKey)}
                        >{copyContent}</span>
                        <span className="onboard-svg"
                        onClick={() => initAccountKey()}
                        >{regenerateSvg}</span>
                      </div>
                        <Button className="d-flex align-self-center justify-content-center w-50"
                        onClick={() => createAndDownloadTextFile(data)}
                        >
                          {_t("onboard.download-keys")} {downloadSvg}
                        </Button>
                <div className="d-flex align-items-center mt-3">
                  <span className="">(You can send link to a freind) Share link</span>
                  <span style={{width: "5%"}} className="onboard-svg"
                  onClick={() => copyToClipboard(harsh)}
                  >{shareVariantSvg}</span> 
                </div>
                    </div>
                </div>
            </div>

        </div>
            {/* <div className="onboard-container">
              <h3>We are creating</h3>

            </div> */}
    </>
  )
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Onboard);