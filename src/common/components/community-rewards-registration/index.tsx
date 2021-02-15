import React, {Component} from "react";

import {Modal, Button} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Community} from "../../store/communities/types";
import {ActiveUser} from "../../store/active-user/types";


import BaseComponent from "../base";

import {communityRewardsRegister, formatError} from "../../api/operations";

import {_t} from "../../i18n";
import KeyOrHot from "../key-or-hot";
import {PrivateKey} from "@hiveio/dhive";
import {error} from "../feedback";


interface Props {
    global: Global;
    community: Community;
    activeUser: ActiveUser;
    signingKey: string;
    setSigningKey: (key: string) => void;
    onHide: () => void;
}

interface State {
    inProgress: boolean;
}


export class CommunityRewardsRegistration extends BaseComponent<Props, State> {
    state: State = {
        inProgress: false
    }


    submit = () => {

    }

    sign = (key: PrivateKey) => {
        const {activeUser, community} = this.props;
        console.log(key)

        this.stateSet({inProgress: true});
        communityRewardsRegister(key, community.name).then(r => {
            console.log(r)
        }).catch(err => {
            error(formatError(err));
        }).finally(() => {
            this.setState({inProgress: false});
        });
    }

    hotSign = () => {

    }

    signKs = () => {

    }

    render() {
        const {inProgress} = this.state;

        return <div className="dialog-content">
            {KeyOrHot({
                ...this.props,
                inProgress,
                onKey: this.sign,
                onHot: this.hotSign,
                onKc: this.signKs
            })}
        </div>
    }
}

export default class CommunityRewardsRegistrationDialog extends Component<Props> {
    render() {
        const {onHide} = this.props;
        return (
            <Modal animation={false} show={true} centered={true} onHide={onHide} keyboard={false} className="community-rewards-registration-dialog">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('community-rewards-registration.dialog-title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CommunityRewardsRegistration {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
