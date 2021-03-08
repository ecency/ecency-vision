import React, {Component} from "react";

import {History} from "history";

import {Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import LinearProgress from "../linear-progress";

import {ReceivedVestingShare, getReceivedVestingShares} from "../../api/private-api";

import {_t} from "../../i18n";

import {vestsToHp} from "../../helper/vesting";

import parseAsset from "../../helper/parse-asset";

import formattedNumber from "../../util/formatted-number";


interface Props {
    global: Global;
    history: History;
    account: Account;
    dynamicProps: DynamicProps;
    addAccount: (data: Account) => void;
    onHide: () => void;
}

interface State {
    loading: boolean;
    data: ReceivedVestingShare[];
}

export class List extends BaseComponent<Props, State> {
    state: State = {
        loading: false,
        data: [],
    };

    componentDidMount() {
        this.fetch().then();
    };

    fetch = () => {
        const {account} = this.props;

        this.stateSet({loading: true});

        return getReceivedVestingShares(account.name)
            .then((r) => {
                const sorted = r.sort((a, b) => {
                    return parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount;
                });

                this.stateSet({data: sorted});
            })
            .finally(() => this.stateSet({loading: false}));
    }

    render() {
        const {loading, data} = this.state;
        const {dynamicProps} = this.props;
        const {hivePerMVests} = dynamicProps;

        if (loading) {
            return (<div className="received-vesting-content">
                <LinearProgress/>
            </div>);
        }

        return (
            <div className="received-vesting-content">
                <div className="user-list">
                    <div className="list-body">
                        {data.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
                        {data.map(x => {
                            const vestingShares = parseAsset(x.vesting_shares).amount;
                            const {delegator: username} = x;

                            return <div className="list-item" key={username}>
                                <div className="item-main">
                                    {ProfileLink({
                                        ...this.props,
                                        username,
                                        children: <>{UserAvatar({...this.props, username, size: "small"})}</>
                                    })}
                                    <div className="item-info">
                                        {ProfileLink({
                                            ...this.props,
                                            username,
                                            children: <a className="item-name notransalte">{username}</a>
                                        })}
                                    </div>
                                </div>
                                <div className="item-extra">
                                    <Tooltip content={x.vesting_shares}>
                                        <span>{formattedNumber(vestsToHp(vestingShares, hivePerMVests), {suffix: "HP"})}</span>
                                    </Tooltip>
                                </div>
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default class ReceivedVesting extends Component<Props> {
    render() {
        const {onHide} = this.props;

        return (
            <>
                <Modal onHide={onHide} show={true} centered={true} animation={false}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{_t("received-vesting.title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <List {...this.props} />
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
