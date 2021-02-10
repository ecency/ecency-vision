import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {Entry} from "../../store/entries/types";
import {User} from "../../store/users/types";
import {ToggleType, UI} from "../../store/ui/types";

import LoginRequired from "../login-required";
import {Transfer} from "../transfer";
import Tooltip from "../tooltip";

import {_t} from "../../i18n";

import {giftOutlineSvg} from "../../img/svg";

interface Props {
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    ui: UI;
    activeUser: ActiveUser | null;
    entry: Entry;
    signingKey: string;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    setSigningKey: (key: string) => void;
}


export class TippingDialog extends Component<Props> {
    render() {
        const {entry, activeUser} = this.props;

        if (!activeUser) {
            return null;
        }

        const to = entry.author;
        const memo = `Tip for ${entry.author}/${entry.permlink}`
        const transactions = {
            list: [],
            loading: false,
            error: false
        }

        return <Transfer
            {...this.props}
            activeUser={activeUser}
            transactions={transactions}
            asset="POINT"
            mode="transfer"
            amount={`100.000`}
            to={to}
            memo={memo}
            onHide={() => {
            }}
        />
    }
}

interface State {
    dialog: boolean;
}

export class EntryTipBtn extends Component<Props, State> {
    state: State = {
        dialog: false
    }

    toggleDialog = () => {
        const {dialog} = this.state;
        this.setState({dialog: !dialog});
    };

    render() {
        const {activeUser} = this.props;
        const {dialog} = this.state;

        return (
            <>
                {LoginRequired({
                    ...this.props,
                    children: <div className="entry-tip-btn" onClick={this.toggleDialog}>
                        <Tooltip content={_t("entry-tip.title")}>
                            <span className="inner-btn">{giftOutlineSvg}</span>
                        </Tooltip>
                    </div>
                })}

                {(dialog && activeUser) && (
                    <Modal animation={false} show={true} centered={true} onHide={this.toggleDialog} keyboard={false} className="tipping-dialog modal-thin-header" size="lg">
                        <Modal.Header closeButton={true}/>
                        <Modal.Body>
                            <TippingDialog {...this.props} />
                        </Modal.Body>
                    </Modal>
                )}
            </>
        )
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        dynamicProps: p.dynamicProps,
        users: p.users,
        ui: p.ui,
        activeUser: p.activeUser,
        entry: p.entry,
        signingKey: p.signingKey,
        addAccount: p.addAccount,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        toggleUIProp: p.toggleUIProp,
        setSigningKey: p.setSigningKey
    }

    return <EntryTipBtn {...props} />
}
