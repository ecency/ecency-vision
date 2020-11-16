import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";
import {PrivateKey} from "@hiveio/dhive";

import KeyOrHot from "../key-or-hot";

interface Props {
    global: Global;
    activeUser: ActiveUser;
    signingKey: string;
    setSigningKey: (key: string) => void;
    children: JSX.Element;
    onKey: (key: PrivateKey) => void;
    onHot?: () => void;
    onKc?: () => void;
}

interface State {
    keyDialog: boolean;
}

export class KeyOrHotDialog extends Component<Props, State> {
    state: State = {
        keyDialog: false
    }

    toggleKeyDialog = () => {
        const {keyDialog} = this.state;
        this.setState({keyDialog: !keyDialog});
    }

    render() {
        const {children, onKey, onHot, onKc} = this.props;
        const {keyDialog} = this.state;

        const newChildren = React.cloneElement(children, {
            onClick: this.toggleKeyDialog,
        });

        return <>
            {newChildren}

            {keyDialog && (
                <Modal animation={false} show={true} centered={true} onHide={this.toggleKeyDialog} keyboard={false} className="key-or-hot-modal modal-thin-header">
                    <Modal.Header closeButton={true}/>
                    <Modal.Body>
                        {KeyOrHot({
                            ...this.props,
                            inProgress: false,
                            onKey: (key) => {
                                this.toggleKeyDialog();
                                onKey(key);
                            },
                            onHot: () => {
                                this.toggleKeyDialog();
                                if (onHot) {
                                    onHot();
                                }
                            },
                            onKc: () => {
                                this.toggleKeyDialog();
                                if (onKc) {
                                    onKc();
                                }
                            }
                        })}
                    </Modal.Body>
                </Modal>
            )}
        </>
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        activeUser: p.activeUser,
        signingKey: p.signingKey,
        setSigningKey: p.setSigningKey,
        children: p.children,
        onKey: p.onKey,
        onHot: p.onHot,
        onKc: p.onKc
    }

    return <KeyOrHotDialog {...props} />
}
