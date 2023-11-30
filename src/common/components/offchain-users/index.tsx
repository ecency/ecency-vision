import React, { useState, useRef } from 'react'
import { _t } from '../../i18n';
import { Button, Form } from 'react-bootstrap';
import { handleInvalid, handleOnInput } from "../../util/input-util";
import { createSolanaUser } from '../../api/breakaway';
import { Link } from 'react-router-dom';
import axios from "axios"

const spkLogo = require("../../img/spklogo.png");
const solanaLogo = require("../../img/solanaLogo.png");

export const OffchainUser = (props: any) => {
    const { inProgress, spinner, step, setStep, setInProgress } = props;
    const form = useRef(null);

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [solanaAddress, setSolanaAddress] = useState("")
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const emailChanged =(e: { target: { value: React.SetStateAction<string>; }; })=>{
        setEmail(e.target.value)
    }

    const solanaAddressChanged =(e: { target: { value: React.SetStateAction<string>; }; })=>{
        setSolanaAddress(e.target.value)
    }

    const passwordChanged =(e: { target: { value: React.SetStateAction<string>; }; })=>{
        setPassword(e.target.value)
    }

    const createSolUser = async ()=> {
      setInProgress(true)
        console.log(email, password, solanaAddress)
        if (!email || !password || !solanaAddress) {
            setError("Some fields missing");
            return;
        }
        if(password !== confirmPassword){
            setError("Password do not match");
            return;
        } else{
          setError("")
        }

        try {
          const res: any = await createSolanaUser(email, password, solanaAddress);
          console.log(res.err.response.data.message)
          if(res.success){
            setStep(2)
            setError("")
          } else {
            setStep(2)
            setError(res.err.response.data.message)
          }
        } catch (error) {
          console.log(error)
        }
        setInProgress(false)
      }
    
  return (
    <>
         {step === 1 && <div className="sign-up">
              <div className="the-form">
                <div className="form-title">Register with Solana</div>
                <div className="form-sub-title mt-3">{_t("sign-up.description")}</div>
                {/* <div className="form-icons d-flex justify-content-center">
                  <img
                    style={{ borderRadius: "50%" }}
                    src={spkLogo}
                    alt="SpkNetwork"
                    title="SpkNetwork"
                  />
                  <img
                    style={{ borderRadius: "50%" }}
                    src={solanaLogo}
                    alt="Solana"
                    title="Solana"
                  />
                </div> */}
                {(() => {
                  return (
                    <div className="form-content">
                      <Form
                        ref={form}
                        >
                        <Form.Group className="d-flex flex-column">
                          <Form.Control
                            type="text"
                            placeholder={"enter your solana address"}
                            value={solanaAddress}
                            onChange={solanaAddressChanged}
                            autoFocus={true}
                            required={true}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "sign-up.", "validation-username")
                            }
                            onInput={handleOnInput}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Control
                            type="email"
                            placeholder={_t("sign-up.email")}
                            value={email}
                            onChange={emailChanged}
                            required={true}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "sign-up.", "validation-username")
                            }
                            onInput={handleOnInput}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Control
                            type="text"
                            placeholder={"Choose a password"}
                            value={password}
                            onChange={passwordChanged}
                            required={true}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "sign-up.", "validation-username")
                            }
                            onInput={handleOnInput}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Control
                            type="text"
                            placeholder={"Confirm password"}
                            value={confirmPassword}
                            onChange={(e)=> setConfirmPassword(e.target.value)}
                            required={true}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "sign-up.", "validation-username")
                            }
                            onInput={handleOnInput}
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-center">
                          <Button
                            variant="primary"
                            block={true}
                            disabled={inProgress}
                            onClick={()=>createSolUser()}
                          >
                            {inProgress && spinner} {_t("sign-up.submit")}
                          </Button>
                        </div>
                      </Form>

                      <div className="text-center">
                        {_t("sign-up.login-text-1")}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            const { toggleUIProp } = props;
                            toggleUIProp("login");
                          }}
                        >
                          {" "}
                          {_t("sign-up.login-text-2")}
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>}
            {step == 2 && !error && (
              <div className="success-wrapper">
                <div className="success-info">
                  <h3 className="text-success">
                      Account created succesfully
                  </h3>
                  <Link to={``}>Login</Link>
                </div>
              </div>
            )}
            {step == 2 && error && (
              <div className="success-wrapper">
                <div className="success-info">
                  <h3 className="text-danger">
                      {error}
                  </h3>
                  <Button onClick={()=> setStep(1)}>Try again</Button>
                </div>
              </div>
            )}
    </>
  )
}
