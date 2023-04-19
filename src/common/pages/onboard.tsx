import React, { useState } from "react";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import Feedback, { error } from "../components/feedback";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { CreateFriendAccount } from "../components/create-friend-account";
import { Button } from "react-bootstrap";
import { useParams } from "react-router"

const Onboard = (props: PageProps | any) => {

  const { username } = props
  const params: any = useParams();
  console.log(params)

    const [showKey, setShowKey] = useState(false)
  return (
    <>
        {/* <Meta title="onborad" />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} /> */}
      <NavBar history={props.history} />
        <div style={{marginTop: "70px"}}>
            <div className="asking d-flex flex-column mt-5">
                <div className="asking d-flex mb-3 d-flex align-self-center flex-column">                    
                    <span className="mb-3">Your account with the following details have been created</span>
                    <span className="mb-3">Copy your password, make sure you don't share you paswword with anyone, it can not be retrieved, do ensure that you have saved it securely</span>
                    {showKey && <span className="">ZDshgjryuefjkkufsddluohlhihsalgoteiofwFA</span>}
                </div>
                <Button className="d-flex align-self-center justify-content-center w-25"
                onClick={() => setShowKey(true)}
                >
                    Generate your master key password
                </Button>
            </div>

            <div className="creating">

            </div>
        </div>
    </>
  )
}

export default Onboard