import React, {Component} from "react";

import {Modal, Form, Button, FormControl} from "react-bootstrap";

import {ToggleType} from "../../store/ui/types";

import {error} from "../feedback";

import {signUp} from "../../api/private";

import {_t} from "../../i18n";

import {checkSvg} from "../../img/svg";

interface Props {
    defReferral: string;
    toggleUIProp: (what: ToggleType) => void;
}

interface State {
    username: string;
    email: string;
    referral: string;
    inProgress: boolean;
    done: boolean;
}

export class SignUp extends Component<Props, State> {
    form = React.createRef<HTMLFormElement>();

    state: State = {
        username: '',
        email: '',
        referral: this.props.defReferral || '',
        inProgress: false,
        done: false
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
        const {defReferral} = this.props;
        const {username, email, referral, inProgress, done} = this.state;

        if (done) {
            return <>
                <div className="form-header">{_t('sign-up.header')}</div>
                <div className="done text-center">
                    <p>{checkSvg} {_t('sign-up.success', {email})}</p>
                    <p>{_t('sign-up.success-2')}</p>
                    <p><Button onClick={() => {
                        const {toggleUIProp} = this.props;
                        toggleUIProp('signUp');
                        toggleUIProp('login');
                    }}>{_t('sign-up.to-login')}</Button></p>
                </div>
            </>
        }

        return (
            <>
                <Form ref={this.form} onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!this.form.current?.checkValidity()) {
                        return;
                    }

                    this.submit()
                }}>
                    <div className="form-header">{_t('sign-up.header')}</div>
                    <Form.Group>
                        <Form.Control type="text" placeholder={_t('sign-up.username')} value={username} onChange={this.usernameChanged} autoFocus={true} required={true}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control type="email" placeholder={_t('sign-up.email')} value={email} onChange={this.emailChanged} required={true}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control type="text" placeholder={_t('sign-up.ref')} value={referral} onChange={this.refCodeChanged} disabled={defReferral !== ''}/>
                    </Form.Group>
                    <div className="d-flex justify-content-center">
                        <Button variant="primary" type="submit" disabled={inProgress}>
                            {_t('sign-up.submit')}
                        </Button>
                    </div>
                </Form>
            </>
        );
    }
}

export default class SignUpDialog extends Component<Props> {
    hide = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('signUp');
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} animation={false} className="sign-up-modal modal-thin-header">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <SignUp {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
