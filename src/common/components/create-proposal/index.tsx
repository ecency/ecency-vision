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
import communitySelector from "../community-selector";
import { ActiveUser } from "../../store/active-user/types";

interface Props {
    activeUser: ActiveUser | null;
  }

const ProposalCreationPage = (props: any) => {
    const { activeUser } = props;

    const [loading, setLoading] = useState(true);
    const [formInput, steFormInput] = useState<any>({});
    const [error, setError] = useState<any>({})
   
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
    }

    const onSubmit = (e: any) => {
        e.preventDefault();
        const formErrors = handleFormError();
        if(Object.keys(formErrors).length > 0){
            setError(formErrors)
        } else {
            createProposal(
                activeUser.username, 
                formInput.receiver, 
                formInput.start, 
                formInput.end, 
                formInput.funding, 
                formInput.subject, 
                formInput.link)
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
            <h1 className="align-self-center">Create Proposal </h1>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Creator Username</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder="@adesojisouljay"
                    value={activeUser.username}
                    // isInvalid={!!error.username}
                    // onChange={(e: any) => handleChange("username", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.username}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Proposal Description</Form.Label>
                    <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="write a brief subject"
                    value={formInput.subject}
                    isInvalid={!!error.subject}
                    onChange={(e: any) => handleChange("subject", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.subject}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Post Link</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder="enter post link" 
                    value={formInput.link}
                    isInvalid={!!error.link}
                    onChange={(e: any) => handleChange("link", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.link}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Daily Funding (HBD)</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder="Daily amount (HBD)" 
                    value={formInput.funding}
                    isInvalid={!!error.funding}
                    onChange={(e: any) => handleChange("funding", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.funding}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Total Amount</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder="100HBD" 
                    value={`${Number(!formInput.funding ? null : formInput.funding * 360)} HBD`}
                    isInvalid={!!error.total}
                    // onChange={(e: any) => handleChange("total", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.total}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3 date-picker">
                    <Form.Label>Select Start Date</Form.Label>
                    <Form.Control 
                    type="date" 
                    value={formInput.start}
                    isInvalid={!!error.start}
                    onChange={(e: any) => handleChange("start", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.start}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3 date-picker">
                    <Form.Label>Select End Date</Form.Label>
                    <Form.Control 
                    type="date" 
                    value={formInput.end}
                    isInvalid={!!error.end}
                    onChange={(e: any) => handleChange("end", e.target.value)}
                    />
                    <span className="text-danger">
                        {error.end}
                    </span>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Receiver</Form.Label>
                    <Form.Control 
                    type="text" 
                    placeholder="e.g @demo" 
                    value={formInput.receiver}
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
                        Submit Proposal
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
