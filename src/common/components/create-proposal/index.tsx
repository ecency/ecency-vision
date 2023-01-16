import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import Theme from "../theme";
import NavBar from "../navbar";
import LinearProgress from "../linear-progress";
import { _t } from "../../i18n";
import { pageMapDispatchToProps, pageMapStateToProps } from "../../pages/common";
import { Button, Form } from "react-bootstrap";
import { createProposal } from "../../api/operations";
import { ActiveUser } from "../../store/active-user/types";

interface Props {
    activeUser: ActiveUser | null;
  }

const ProposalCreationPage = (props: any) => {
    // const { activeUser } = props;

    const [loading, setLoading] = useState(true);
    const [formInput, steFormInput] = useState<any>({});
    const [error, setError] = useState<any>({});
    const [hbdBalanceError, setHbdBalanceError] = useState(false);
    const [totalDays, setTotalDays] = useState(0)
   
    useEffect(() => {
        setLoading(false)
    }, [])

    const handleFormError = () => {
        const { receiver,subject, start, end, funding, link } = formInput;
        const newError: any = {};

        if(!receiver || receiver === "") newError.receiver = "Please enter receiver"
        if(!subject || subject === "") newError.subject = "Please enter subject"
        if(!start || start === "") newError.start = "Please select start date"
        if(!end || end === "") newError.end = "Please select end date"
        if(!funding || funding === "") newError.funding = "Please enter funding amount"
        if(!link || link === "") newError.link = "Please enter post link"

        return newError;
    }

    const handleChange = (field: any, value: any) => {
        steFormInput({
            ...formInput,
            [field]:value
        });

        if(!!error){
            setError({
                ...error,
                [field]:null
            })
        };
        const days = getDateDifference(formInput.start, formInput.end);
        setTotalDays(days); 
       
    };

    const getDateDifference = (start: any, end: any) => {
       const startDate = new Date(start);
       const endDate = new Date(end);
       const difference: any = endDate.getTime() - startDate.getTime();
       const daysDifference: number = difference / (1000 * 3600 * 24);
       return daysDifference
    }

    const onSubmit = (e: any) => {
        const { activeUser } = props;
        const hbdBalance = Number(props.activeUser.data.hbd_balance.replace("HBD",""))
        e.preventDefault();
        const formErrors = handleFormError();
        if(Object.keys(formErrors).length > 0){
            setError(formErrors)
        } else if ( hbdBalance < 10 ){
            setHbdBalanceError(true)
        } else {
            createProposal(
                activeUser.username, 
                formInput.receiver, 
                formInput.start, 
                formInput.end, 
                formInput.funding, 
                formInput.subject, 
                formInput.link
                ).then(
                    (res: any) => {
                      console.log({res})
                      return res;
                    }
                  ).catch((e: any) => {
                    console.log({e})
                    return e;
                  });
                  return;
        }
    };

    if (loading) {
      return (
        <>
          <LinearProgress />
        </>
      );
    }
    
    return (
      <>
        <div>
        <Theme global={props.global} />
            { NavBar({ ...props })}
        </div>
        <div className="app-content proposals-page">
          <div className="page-header create-proposal mt-5 d-flex justify-content-center flex-direction-column">
            <h1 className="align-self-center">{_t("create-proposal.title")}</h1>
            {hbdBalanceError && <p className="align-self-center text-danger">
            {_t("create-proposal.hbd-balance-error")}
            </p>}
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>{_t("create-proposal.creator-username")}</Form.Label>
                    <Form.Control 
                    type="text" 
                    value={formInput.username = props.activeUser.username}
                    readOnly
                    // onChange={(e: any) => handleChange("username", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.username}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{_t("create-proposal.description")}</Form.Label>
                    <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder={_t("create-proposal.subject")}
                    value={formInput.subject || ""}
                    isInvalid={!!error.subject}
                    onChange={(e: any) => handleChange("subject", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.subject}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{_t("create-proposal.link")}</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder={_t("create-proposal.link-placeholder")} 
                    value={formInput.link || ""}
                    isInvalid={!!error.link}
                    onChange={(e: any) => handleChange("link", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.link}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{_t("create-proposal.daily-funding")}</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder={_t("create-proposal.daily-funding-placeholder")} 
                    value={formInput.funding || ""}
                    isInvalid={!!error.funding}
                    onChange={(e: any) => handleChange("funding", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.funding}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{_t("create-proposal.total")}</Form.Label>
                    <Form.Control 
                    type="text" 
                    value={formInput.total = !formInput.funding || 
                        !formInput.start || !formInput.end || Number.isNaN(totalDays * Number(formInput.funding)) ? 0 : 
                        totalDays * Number(formInput.funding)} 
                    isInvalid={!!error.total}
                    // onChange={(e: any) => handleChange("total", e.target.value)}
                    readOnly
                    />
                    <span className="text-danger">
                        {error.total}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3 date-picker">
                    <Form.Label>{_t("create-proposal.start-date")}</Form.Label>
                    <Form.Control 
                    type="date" 
                    value={formInput.start || ""}
                    isInvalid={!!error.start}
                    onChange={(e: any) => handleChange("start", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.start}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3 date-picker">
                    <Form.Label>{_t("create-proposal.end-date")}</Form.Label>
                    <Form.Control 
                    type="date" 
                    value={formInput.end || ""}
                    isInvalid={!!error.end}
                    onChange={(e: any) => handleChange("end", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.end}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{_t("create-proposal.receiver")}</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder={_t("create-proposal.receiver-placeholder")} 
                    value={formInput.receiver || ""}
                    isInvalid={!!error.receiver}
                    onChange={(e: any) => handleChange("receiver", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.receiver}
                    </span>
                </Form.Group>
                <Form.Group controlId="submit">
                    <Button disabled={!error} className="w-100 p-3 bg-white text-primary"
                    onClick={(e: any) => onSubmit(e)}
                    >
                        {_t("create-proposal.submit")}
                </Button>
                </Form.Group>
            </Form>        
          </div>
        </div>
      </>
    );
}

export const ProposalCreationContainer = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(ProposalCreationPage);
