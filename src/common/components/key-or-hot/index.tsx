import React, {Component} from "react";

import {Button, Form, FormControl, InputGroup} from "react-bootstrap";

import {PrivateKey} from "@hiveio/dhive";

import OrDivider from "../or-divider";
import {error} from "../feedback";

import {_t} from "../../i18n";

import {keySvg} from "../../img/svg";

const hsLogo = require("../../img/hive-signer.svg");

interface Props {
    signingKey: string;
    setSigningKey: (key: string) => void;
    inProgress: boolean;
    onlyKey?: boolean;
    onKey: (key: PrivateKey) => void;
    onHot?: () => void;
}

interface State {
    key: string;
}

export class KeyOrHot extends Component<Props, State> {
    state: State = {
        key: this.props.signingKey
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

        const {onKey, setSigningKey} = this.props;

        setSigningKey(key);

        onKey(pKey);
    }

    hotClicked = () => {
        const {onHot} = this.props;
        if (onHot) {
            onHot();
        }
    }

    render() {
        const {inProgress, onlyKey} = this.props;
        const {key} = this.state;

        return (
            <>
                <div className="key-or-hot">
                    <Form onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                    }}>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>{keySvg}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                value={key}
                                type="password"
                                autoFocus={true}
                                autoComplete="off"
                                placeholder={_t('key-or-hot.key-placeholder')}
                                onChange={this.keyChanged}/>
                            <InputGroup.Append>
                                <Button disabled={inProgress} onClick={this.keyEntered}>{_t("key-or-hot.sign")}</Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form>
                    {!onlyKey && (
                        <>
                            <OrDivider/>
                            <div className="hs-sign">
                                <Button variant="outline-primary" onClick={this.hotClicked}>
                                    <img src={hsLogo} className="hs-logo" alt="hivesigner"/> {_t("key-or-hot.with-hivesigner")}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    }
}


export default (p: Props) => {
    const props = {
        signingKey: p.signingKey,
        setSigningKey: p.setSigningKey,
        inProgress: p.inProgress,
        onlyKey: p.onlyKey,
        onKey: p.onKey,
        onHot: p.onHot
    }

    return <KeyOrHot {...props} />;
}
