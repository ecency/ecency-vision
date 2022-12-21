import React, { useEffect, useState, useCallback } from 'react'
import { _t } from "../../i18n";
import { Form, Row, Col, InputGroup, FormControl, Button } from "react-bootstrap";
import SuggestionList from "../suggestion-list";
import LinearProgress from '../linear-progress';
import { arrowRightSvg } from '../../img/svg';
import UserAvatar from "../user-avatar";
import amountFormatCheck from "../../helper/amount-format-check";
import formattedNumber from "../../util/formatted-number";
import badActors from "@hiveio/hivescript/bad-actors.json";
import { error } from "../feedback";
import { delegateRC, formatError } from '../../api/operations';
import _ from "lodash";
import {
  getAccount,
  getOutgoingRc
} from "../../api/hive";

export const ResourceCreditsDelegation = (props: any) => {
    const { resourceCredit, activeUser, hideDelegation, toFromList, amountFromList } = props
    console.log(resourceCredit)
    
    const [to, setTo] = useState<string>(toFromList || '');
    const [amount, setAmount] = useState<string>(amountFromList || '');
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [step, setStep] = useState<any>(1);
    const [amountError, setAmountError] = useState<string>('');
    const [toError, setToError] = useState<string>('');
    const [toWarning, setToWarning] = useState<string>('');
    const [toData, setToData] = useState<any>('');
    const [asset] = useState<string>('RC');

    useEffect(() => {
      // checkAmount();
    }, []);

    const toChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const { value } = e.target;
        setInProgress(true)
        setTo(value);
        delayedSearch(value)
        // handleTo(value)
      };

    const amountChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        const { value: amount } = e.target;
        setAmount(amount)
        // checkAmount()
      };
      
    // const  formatNumber = (num: number | string, precision: number) => {
    //   const format = `0.${"0".repeat(precision)}`;
  
    //   return numeral(num).format(format, Math.floor); // round to floor
    // };

    const next = () => {
      setInProgress(false)
      setStep(2);
      };

    const back = () => {
        setStep(1)
      };

    const signTransaction = () => {
      const { activeUser } = props;
      const username = activeUser?.username!;
      const max_rc = `${amount}`;
      delegateRC(username, to, max_rc).then(
       (res: any) => {
         console.log({res})
         return res;
       }
     ).catch((e: any) => {
       console.log({e})
       return e;
     });
     hideDelegation();
     return;
    }

    const canSubmit = toData && !toError && !amountError && !inProgress && !!amount && Number(amount) < Number(resourceCredit);
    
    const checkAmount = () => {
  
      if (amount === "") {
        setAmountError("error")
        return;
      }
  
      if (!amountFormatCheck(amount)) {
        setAmountError("wrong amount")
        return;
      }
  
      const dotParts = amount.split(".");
      if (dotParts.length > 1) {
        const precision = dotParts[1];
        if (precision.length > 3) {
          setAmountError("transfer.amount-precision-error") ;
          return;
        }
      }
   
      let balance = Number(resourceCredit);
      if (Number(amount) > balance) {
        setAmountError("insufficient resource credits")
        return;
      }

      if (Number(amount) < 5000000) {
        setAmountError("can not delegate below maximum RC")
        return;
      }
  
      setAmountError("uuuuuuu")
    };

    const handleTo = async (value:string) => {
      setInProgress(true);

      if (value === "") {
        setToWarning("")
        setToError("")
        setToData(null)
        return;
      }
        if (badActors.includes(value)) {
         setToWarning(_t("transfer.to-bad-actor"))
        } else {
          setToWarning("")
        }    
        setToData(null);   
        const delegationsOutList: any = await getOutgoingRc(activeUser.username, "")
        console.log(delegationsOutList)

        return getAccount(value)
          .then((resp) => {
            if (resp) {
              console.log({resp})
              setToError("");
              setToData(resp);           
            } 
            else {
              console.log("not found")
                setToError(_t("transfer.to-not-found"))
              };
              return resp;
            })         
          .catch((err) => {
            console.log(err)
            error(...formatError(err));
          })
          .finally(() => {
           setInProgress(false);
          }); 
    };

    const delayedSearch = useCallback(_.debounce(handleTo, 3000, { leading: true }), []);

    const formHeader1 = (
      <div className="transaction-form-header">
        <div className="step-no">1</div>
        <div className="box-titles">
          <div className="main-title">Delegate</div>
          <div className="sub-title">Delegate Resource Credit</div>
        </div>
      </div>
    );

    const formHeader2 = (
      <div className="transaction-form-header">
        <div className="step-no">2</div>
        <div className="box-titles">
          <div className="main-title">{_t("transfer.confirm-title")}</div>
          <div className="sub-title">{_t("transfer.confirm-sub-title")}</div>
        </div>
      </div>
    );

  return (
    <div className="transfer-dialog-content">
      {step === 1 && ( 
       <div  className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
          {formHeader1}
          { inProgress && <LinearProgress />}
       <Form className="transaction-form-body">
       <Form.Group as={Row}>
                <Form.Label column={true} sm="2">
                {_t("transfer.from")}
                </Form.Label>
                <Col sm="10">
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>@</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control value={activeUser.username} readOnly={true} />
                  </InputGroup>
                </Col>
              </Form.Group>

                <>
                  <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">
                      {_t("transfer.to")}
                    </Form.Label>
                    <Col sm="10">
                      {/* <SuggestionList > */}
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>@</InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="text"
                            autoFocus={to === ""}
                            placeholder={_t("transfer.to-placeholder")}
                            value={to}
                            onChange={toChanged}
                            className={toError ? "is-invalid" : ""}
                          />
                        </InputGroup>
                      {/* </SuggestionList> */}
                    </Col>
                  </Form.Group>
                  {toWarning && <FormText msg={toWarning} type="danger" />}
                  {toError && <FormText msg={toError} type="danger" />}
                </>

                  <Form.Group as={Row}>
                <Form.Label column={true} sm="2">
                  {_t("transfer.amount")}
                </Form.Label>
                <Col sm="10" className="d-flex align-items-center">
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>#</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="text"
                      placeholder={_t("transfer.amount-placeholder")}
                      value={amount}
                      onChange={amountChanged}
                      className={Number(amount) > Number(resourceCredit) && amountError ? "is-invalid" : ""}
                    //   autoFocus={mode !== "transfer"}
                    />
                  </InputGroup>
                </Col>
              </Form.Group>

              {Number(amount) && Number(amount) < 5000000000 ?  <FormText msg={"Min RC is 5 billion"} type="danger" /> : 
              Number(amount) > Number(resourceCredit) ?  <FormText msg={"Insufficient RC"} type="danger" /> : 
              null }

              <Row>
                <Col lg={{ span: 10, offset: 2 }}>
                  <div className="balance">
                    <span className="balance-label">
                      {_t("transfer.balance")}
                      {": "}
                    </span>
                    <span >
                     {resourceCredit}
                    </span>
                  </div>
                 
                  {/* <div className="text-muted mt-1 override-warning">
                  {delegateAccount && (
                        <>
                          <br />
                          {_t("transfer.override-warning-2", {
                            account: to,
                            previousAmount: formattedNumber(previousAmount)
                          })}
                        </>
                      )}
                    
                    </div> */}
                </Col>
              </Row>

              <Form.Group as={Row}>
                <Col sm={{ span: 10, offset: 2 }}>
                  
                  <Button disabled={!canSubmit} onClick={next}>
                    {_t("g.next")}
                  </Button>
                </Col>
              </Form.Group>
       </Form>
      </div>
      )}

      {step ===2 && (
       <div className="transaction-form">
       {formHeader2}
       <div className="transaction-form-body">
         <div className="confirmation">
           <div className="confirm-title">Delegate</div>
           <div className="users">
             <div className="from-user">
               {UserAvatar({ ...props, username: activeUser.username, size: "large" })}
             </div>
             { (
               <>
                 <div className="arrow">{arrowRightSvg}</div>
                 <div className="to-user">
                  {UserAvatar({ ...props, username: to, size: "large" })}
                 </div>
               </>
             )}
           </div>
           <div className="amount">
             {amount} RC
           </div>
         </div>
         <div className="d-flex justify-content-center">
           <Button variant="outline-secondary" disabled={inProgress} onClick={back}>
             {_t("g.back")}
           </Button>
           <span className="hr-6px-btn-spacer" />
           <Button disabled={inProgress} onClick={signTransaction}>
             {inProgress && <span>spinner</span>}
             {_t("transfer.confirm")}
           </Button>
         </div>
       </div>
     </div>
      )}
    </div>
  )
};

const FormText = (props: { msg: any; type: any; }) => {
  const { msg, type } = props
    return (
      <Row>
        <Col md={{ span: 10, offset: 2 }}>
          <Form.Text className={`text-${type} tr-form-text`}>
            {msg}
          </Form.Text>
        </Col>
      </Row>
    );
  }