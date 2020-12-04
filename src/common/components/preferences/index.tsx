import React, {Component} from "react";

import {Global} from "../../store/global/types";

import {_t} from "../../i18n";
import {Col, Form, FormControl} from "react-bootstrap";


interface Props {
    global: Global;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
}

export class Preferences extends Component<Props> {
    notificationsChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {muteNotifications, unMuteNotifications} = this.props;

        if (e.target.value === "1") {
            unMuteNotifications();
        }

        if (e.target.value === "0") {
            muteNotifications();
        }
    }

    render() {

        const {global} = this.props;

        return <>
            <div className="preferences">
                <div className="preferences-header">{_t('preferences.title')}</div>

                <Form.Row>
                    <Col lg={6} xl={4}>
                        <Form.Group>
                            <Form.Label>{_t('preferences.notifications')}</Form.Label>
                            <Form.Control type="text" value={global.notifications ? 1 : 0} as="select" onChange={this.notificationsChanged}>
                                <option value={1}>{_t('g.on')}</option>
                                <option value={0}>{_t('g.off')}</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Form.Row>
            </div>
        </>
    }
}


export default (p: Props) => {
    const props: Props = {
        global: p.global,
        muteNotifications: p.muteNotifications,
        unMuteNotifications: p.unMuteNotifications
    }

    return <Preferences {...props} />
}
