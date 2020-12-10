import React, {Component} from "react";

import {History} from "history";

import {Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";

import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import Tooltip from "../tooltip";

import {DelegatedVestingShare, getVestingDelegations} from "../../api/hive";

import {_t} from "../../i18n";

import {vestsToSp} from "../../helper/vesting";

import parseAsset from "../../helper/parse-asset";

import formattedNumber from "../../util/formatted-number";

interface ListProps {
    history: History;
    global: Global;
    account: Account;
    dynamicProps: DynamicProps;
    addAccount: (data: Account) => void;
}

interface ListState {
    loading: boolean;
    data: DelegatedVestingShare[];
}

export class List extends Component<ListProps, ListState> {
    state: ListState = {
        loading: false,
        data: [],
    };

    _mounted: boolean = true;

    componentDidMount() {
        const {account} = this.props;

        this.stateSet({loading: true});
        getVestingDelegations(account.name, "", 250)
            .then((data) => {
                this.setData(data);
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    setData = (data: DelegatedVestingShare[]) => {
        data.sort((a, b) => {
            return parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount;
        });

        this.stateSet({data});
    };

    render() {
        const {loading, data} = this.state;
        const {dynamicProps} = this.props;
        const {hivePerMVests} = dynamicProps;

        if (loading) {
            return (
                <div className="delegated-vesting-content">
                    <LinearProgress/>
                </div>
            );
        }

        return (
            <div className="delegated-vesting-content">
                <div className="user-list">
                    <div className="list-body">
                        {data.map(x => {
                            const vestingShares = parseAsset(x.vesting_shares).amount;
                            const {delegatee: username} = x;

                            return <div className="list-item" key={username}>
                                <div className="item-main">
                                    {ProfileLink({
                                        ...this.props,
                                        username,
                                        children: <>{UserAvatar({...this.props, username: x.delegatee, size: "small"})}</>
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
                                        <span>{formattedNumber(vestsToSp(vestingShares, hivePerMVests), {suffix: "HP"})}</span>
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

interface Props {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    account: Account;
    addAccount: (data: Account) => void;
    onHide: () => void;
}

export default class DelegatedVesting extends Component<Props> {
    render() {
        const {onHide} = this.props;

        return (
            <>
                <Modal onHide={onHide} show={true} centered={true} animation={false}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{_t("delegated-vesting.title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <List {...this.props} />
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
