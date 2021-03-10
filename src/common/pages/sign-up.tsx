import React, {Component} from "react";

import {connect} from "react-redux";

import queryString from "query-string";

import {Button, Form, FormControl, Spinner} from "react-bootstrap";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import Feedback, {error} from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";

import {signUp} from "../api/private-api";

import {_t} from "../i18n";
import {Tsx} from "../i18n/helper";

import {checkSvg} from "../img/svg";

interface State {
    username: string;
    email: string;
    referral: string;
    lockReferral: boolean;
    inProgress: boolean;
    done: boolean;
}

class SignUpPage extends Component<PageProps, State> {
    form = React.createRef<HTMLFormElement>();

    state: State = {
        username: '',
        email: '',
        referral: '',
        lockReferral: false,
        inProgress: false,
        done: false
    }

    componentDidMount() {
        const {location} = this.props;
        const qs = queryString.parse(location.search);
        if (qs.referral) {
            const referral = qs.referral as string;
            this.setState({referral, lockReferral: true});
        }
    }

    usernameChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {value: username} = e.target;
        this.setState({username});
    }

    emailChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {value: email} = e.target;
        this.setState({email});
    }

    refCodeChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {value: referral} = e.target;
        this.setState({referral});
    }

    submit = () => {
        const {username, email, referral} = this.state;

        this.setState({inProgress: true});
        signUp(username, email, referral).then(resp => {
            this.setState({inProgress: false});
            if (resp && resp.data && resp.data.code) {
                error(resp.data.message);
            } else {
                this.setState({done: true});
            }
        }).catch(err => {
            this.setState({inProgress: false});
            if (err.response && err.response.data && err.response.data.message) {
                error(err.response.data.message);
            }
        });
    }

    render() {
        const {global} = this.props;

        //  Meta config
        const metaProps = {
            title: _t('sign-up.header')
        };

        const {username, email, referral, lockReferral, inProgress, done} = this.state;
        const spinner = <Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>;

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({...this.props})}
                <div className="app-content sign-up-page">
                    {(() => {
                        if (done) {
                            return <>
                                <div className="page-header">
                                    <div className="header-title">
                                        {_t('sign-up.header')}
                                    </div>
                                </div>
                                <div className="done-form">
                                    <p>{checkSvg} {_t('sign-up.success', {email})}</p>
                                    <p>{_t('sign-up.success-2')}</p>
                                </div>
                            </>;
                        }

                        return <>
                            <div className="page-header">
                                <div className="header-title">
                                    {_t('sign-up.header')}
                                </div>
                                <Tsx k="sign-up.description"><div className="header-description" /></Tsx>
                            </div>
                            <div className="sign-up-form">
                                <Form ref={this.form} onSubmit={(e: React.FormEvent) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (!this.form.current?.checkValidity()) {
                                        return;
                                    }

                                    this.submit();
                                }}>
                                    <Form.Group>
                                        <Form.Control type="text" placeholder={_t('sign-up.username')} value={username} onChange={this.usernameChanged} autoFocus={true}
                                                      required={true}/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Control type="email" placeholder={_t('sign-up.email')} value={email} onChange={this.emailChanged} required={true}/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Control type="text" placeholder={_t('sign-up.ref')} value={referral} onChange={this.refCodeChanged} disabled={lockReferral}/>
                                    </Form.Group>
                                    <div className="d-flex justify-content-center">
                                        <Button variant="primary" type="submit" disabled={inProgress}>
                                            {inProgress && spinner} {_t('sign-up.submit')}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                            <div className="do-login">
                                {_t("sign-up.login-text-1")}
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    const {toggleUIProp} = this.props;
                                    toggleUIProp("login");
                                }}>{" "}{_t("sign-up.login-text-2")}</a>
                            </div>
                        </>
                    })()}
                </div>
            </>
        )
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUpPage);
