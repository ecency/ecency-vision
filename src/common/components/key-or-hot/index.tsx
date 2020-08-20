import React, {Component} from "react";

import {Button, Form, FormControl, InputGroup} from "react-bootstrap";

import {PrivateKey} from "@hiveio/dhive";

import OrDivider from "../or-divider";
import {error} from "../feedback";

import {_t} from "../../i18n";

import {keySvg} from "../../img/svg";

const hsLogo = require("../../img/hive-signer.svg");

interface Props {
    inProgress: boolean;
    onKey: (key: PrivateKey) => void;
    onHot: () => void;
}

interface State {
    key: string;
}

export default class KeyOrHot extends Component<Props, State> {
    state: State = {
        key: ''
    }

    keyChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: key} = e.target;
        this.setState({key});
    }

    keyEntered = () => {
        const {key} = this.state;

        let pKey: PrivateKey;

        try {
            pKey = PrivateKey.fromString(key);
        } catch (e) {
            error('Invalid active private key!');
            return;
        }

        const {onKey} = this.props;
        onKey(pKey);
    }

    hotClicked = () => {
        const {onHot} = this.props;
        onHot();
    }

    render() {
        const {inProgress} = this.props;
        const {key} = this.state;

        return (
            <>
                <div className="key-or-hot">
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>{keySvg}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            value={key}
                            type="password"
                            autoFocus={true}
                            placeholder={_t('key-or-hot.key-placeholder')}
                            onChange={this.keyChanged}/>
                        <InputGroup.Append>
                            <Button disabled={inProgress} onClick={this.keyEntered}>{_t("key-or-hot.sign")}</Button>
                        </InputGroup.Append>
                    </InputGroup>
                    <OrDivider/>
                    <div className="hs-sign">
                        <Button variant="outline-primary" onClick={this.hotClicked}>
                            <img src={hsLogo} className="hs-logo" alt="hivesigner"/> {_t("key-or-hot.with-hivesigner")}
                        </Button>
                    </div>
                </div>
            </>
        );
    }
}
