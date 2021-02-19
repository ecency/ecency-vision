import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import numeral from "numeral";

import {History} from "history";
import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";

import {Proposal, getProposalVotes, getAccounts} from "../../api/hive";

import parseAsset from "../../helper/parse-asset";
import accountReputation from "../../helper/account-reputation";

import {_t} from "../../i18n";

interface Voter {
    name: string;
    reputation: string | number;
    hp: number;
    proxyHp: number,
    totalHp: number
}

interface Props {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    proposal: Proposal;
    addAccount: (data: Account) => void;
    onHide: () => void;
}

interface State {
    loading: boolean;
    voters: Voter[]
}

export class ProposalVotesDetail extends BaseComponent<Props, State> {
    state: State = {
        loading: true,
        voters: []
    }

    componentDidMount() {
        this.load();
    }

    load = () => {
        const {proposal, dynamicProps} = this.props;
        const {hivePerMVests} = dynamicProps;

        getProposalVotes(proposal.id).then(votes => {
            const usernames = [...new Set(votes.map(x => x.voter))]; // duplicate records come in some way.

            return getAccounts(usernames);
        }).then(resp => {
            const voters: Voter[] = resp
                .map(account => {
                    const hp = (parseAsset(account.vesting_shares).amount * hivePerMVests) / 1e6;

                    let vsfVotes = 0;
                    account.proxied_vsf_votes.forEach((x: string | number) => vsfVotes += Number(x));

                    const proxyHp = (vsfVotes * hivePerMVests) / 1e12;
                    const totalHp = hp + proxyHp;

                    return {
                        name: account.name,
                        reputation: account.reputation!,
                        hp,
                        proxyHp,
                        totalHp
                    };
                }).sort((a, b) => (b.totalHp > a.totalHp ? 1 : -1));

            this.stateSet({voters, loading: false});
        });
    }

    render() {
        const {loading, voters} = this.state;

        if (loading) {
            return <LinearProgress/>
        }

        return <div className="voters-list">
            <div className="list-body">
                {voters.map(x => {

                    const strHp = numeral(x.hp).format("0.00,");
                    const strProxyHp = numeral(x.proxyHp).format("0.00,");

                    return <div className="list-item" key={x.name}>
                        <div className="item-main">
                            {ProfileLink({
                                ...this.props,
                                username: x.name,
                                children: <>{UserAvatar({...this.props, username: x.name, size: "small"})}</>
                            })}

                            <div className="item-info">
                                {ProfileLink({
                                    ...this.props,
                                    username: x.name,
                                    children: <a className="item-name notransalte">{x.name}</a>
                                })}
                                <span className="item-reputation">{accountReputation(x.reputation)}</span>
                            </div>
                        </div>
                        <div className="item-extra">
                            <span>{`${strHp} HP`}</span>
                            {x.proxyHp > 0 && (
                                <>{" + "}<span>{`${strProxyHp} HP`}{" (proxy) "}</span></>
                            )}
                        </div>
                    </div>;
                })}
            </div>
        </div>;
    }
}


export class ProposalVotes extends Component<Props> {
    render() {
        const {proposal, onHide} = this.props;

        return <Modal onHide={onHide} show={true} centered={true} size="lg" animation={false} className="proposal-votes-dialog">
            <Modal.Header closeButton={true}>
                <Modal.Title>{_t("proposals.votes-dialog-title", {n: proposal.id})}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ProposalVotesDetail {...this.props} />
            </Modal.Body>
        </Modal>
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        global: p.global,
        dynamicProps: p.dynamicProps,
        proposal: p.proposal,
        addAccount: p.addAccount,
        onHide: p.onHide
    }

    return <ProposalVotes {...props} />;
}
