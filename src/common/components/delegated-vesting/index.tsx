import React, {Component} from "react";

import {History} from "history";

import {Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {ActiveUser} from "../../store/active-user/types";

import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import Tooltip from "../tooltip";
import KeyOrHotDialog from "../key-or-hot-dialog";
import {error} from "../feedback";

import {DelegatedVestingShare, getVestingDelegations} from "../../api/hive";

import {
    delegateVestingShares,
    delegateVestingSharesHot,
    delegateVestingSharesKc,
    formatError
} from "../../api/operations";

import {_t} from "../../i18n";

import {vestsToHp} from "../../helper/vesting";

import parseAsset from "../../helper/parse-asset";

import formattedNumber from "../../util/formatted-number";

import _c from "../../util/fix-class-names";

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    account: Account;
    dynamicProps: DynamicProps;
    signingKey: string;
    addAccount: (data: Account) => void;
    setSigningKey: (key: string) => void;
    onHide: () => void;
    totalDelegated: string;
    setSubtitle?: (value: number) => void;
}

interface State {
    loading: boolean;
    inProgress: boolean;
    data: DelegatedVestingShare[];
    hideList: boolean;
}

export class List extends BaseComponent<Props, State> {
    state: State = {
        loading: false,
        inProgress: false,
        data: [],
        hideList: false
    };

    componentDidMount() {
        this.fetch().then();
    }

    fetch = () => {
        const {account, dynamicProps, totalDelegated, setSubtitle} = this.props;
        this.stateSet({loading: true});

        return getVestingDelegations(account.name, "", 250)
            .then((r) => {
                const sorted = r.sort((a, b) => {
                    return parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount;
                });
                const {hivePerMVests} = dynamicProps;

                const totalDelegatedValue = sorted.reduce((n, item) => n + Number(formattedNumber(vestsToHp(Number(parseAsset(item.vesting_shares).amount), hivePerMVests))), 0)
                this.stateSet({data: sorted});
                const totalDelegatedNumbered = parseFloat(totalDelegated.replace(" HP",""));
                const toBeReturned = totalDelegatedNumbered - totalDelegatedValue;
                setSubtitle && setSubtitle(Number(toBeReturned.toFixed(3)))
                
            })
            .finally(() => this.stateSet({loading: false}));
    }

    render() {
        const {loading, data, hideList, inProgress} = this.state;
        const {dynamicProps, activeUser, account} = this.props;
        const {hivePerMVests} = dynamicProps;

        if (loading) {
            return (<div className="delegated-vesting-content">
                <LinearProgress/>
            </div>);
        }
        
        return (
            <div className={_c(`delegated-vesting-content ${inProgress ? "in-progress" : ""} ${hideList ? "hidden" : ""}`)}>
                <div className="user-list">
                    <div className="list-body">
                        {data.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
                        {data.map(x => {
                            const vestingShares = parseAsset(x.vesting_shares).amount;
                            const {delegatee: username} = x;

                            const deleteBtn = (activeUser && activeUser.username === account.name) ? KeyOrHotDialog({
                                ...this.props,
                                activeUser: activeUser,
                                children: <a href="#" className="undelegate">{_t("delegated-vesting.undelegate")}</a>,
                                onToggle: () => {
                                    const {hideList} = this.state;
                                    this.stateSet({hideList: !hideList});
                                },
                                onKey: (key) => {
                                    this.stateSet({inProgress: true});
                                    delegateVestingShares(activeUser.username, key, username, "0.000000 VESTS")
                                        .then(() => this.fetch())
                                        .catch(err => error(formatError(err)))
                                        .finally(() => this.stateSet({inProgress: false}))
                                },
                                onHot: () => {
                                    delegateVestingSharesHot(activeUser.username, username, "0.000000 VESTS");
                                },
                                onKc: () => {
                                    this.stateSet({inProgress: true});
                                    delegateVestingSharesKc(activeUser.username, username, "0.000000 VESTS")
                                        .then(() => this.fetch())
                                        .catch(err => error(formatError(err)))
                                        .finally(() => this.stateSet({inProgress: false}))
                                }
                            }) : null;

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
                                        <span>{formattedNumber(vestsToHp(vestingShares, hivePerMVests), {suffix: "HP"})}</span>
                                    </Tooltip>
                                    {deleteBtn}
                                </div>
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}


export default class DelegatedVesting extends Component<Props> {
    state = {
        subtitle: ""
    }

    render() {
        const {onHide} = this.props;
        const {subtitle} = this.state;

        return (
            <>
                <Modal onHide={onHide} show={true} centered={true} animation={false}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>
                            <div>
                                <div>
                                    {_t("delegated-vesting.title")}
                                </div>
                                <div className="text-muted mt-3 text-small">{subtitle}</div>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <List {...this.props} setSubtitle={value => this.setState({subtitle: `+${value} ${_t("delegated-vesting.subtitle")}`})}/>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
