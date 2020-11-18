import React, {Component} from "react";

import moment from "moment";

import numeral from "numeral";

import {History} from "history";

import EntryLink from "../entry-link";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";

import {Proposal} from "../../api/hive";
import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";

import parseAsset from "../../helper/parse-asset"

import {DynamicProps} from "../../store/dynamic-props/types";

interface Props {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    addAccount: (data: Account) => void;
    proposal: Proposal;
}

export class ProposalListItem extends Component<Props> {

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        return this.props.dynamicProps.hivePerMVests !== nextProps.dynamicProps.hivePerMVests;
    }

    render() {
        const {dynamicProps, proposal} = this.props;

        const startDate = moment(new Date(proposal.start_date));
        const endDate = moment(new Date(proposal.end_date));
        const duration = endDate.diff(startDate, 'days');

        const votesHP = (Number(proposal.total_votes) / 1e12) * dynamicProps.hivePerMVests;
        const votesHPFormatted = numeral(votesHP).format("0.00a");
        const votesHPTitle = numeral(votesHP).format("0.00");

        const dailyHdb = parseAsset(proposal.daily_pay).amount;
        const dailyHdbFormatted = numeral(dailyHdb).format("0.00a");
        const allHbd = dailyHdb * duration;
        const allHbdFormatted = numeral(allHbd).format("0.0a");

        return (
            <div className="proposal-list-item">
                <div className="left-side">
                    <div className="proposal-users-card">
                        {UserAvatar({
                            ...this.props,
                            username: proposal.creator,
                            size: "small"
                        })}

                        <span className="users">
                                {"by"}{" "}
                            {ProfileLink({
                                ...this.props,
                                username: proposal.creator,
                                children: <span> {proposal.creator}</span>
                            })}

                            {proposal.receiver && (
                                <>{" "}{"for"}{" "}
                                    {ProfileLink({
                                        ...this.props,
                                        username: proposal.receiver,
                                        children: <span> {proposal.receiver}</span>
                                    })}
                                </>
                            )}
                            </span>
                    </div>
                    <div className="proposal-title">
                        {EntryLink({
                            ...this.props,
                            entry: {
                                category: "proposal",
                                author: proposal.creator,
                                permlink: proposal.permlink
                            },
                            children: <a>
                                {proposal.subject}
                                <span className="proposal-id">#{proposal.id}</span>
                            </a>
                        })}
                    </div>
                    <div className="proposal-info">
                        <div className="proposal-status active">active</div>
                        <div className="proposal-date">
                            {startDate.format('ll')} {"-"} {endDate.format("ll")} ({duration} {" days"})
                        </div>
                        <div className="requested-hbd">
                            <span className="all-hbd">{`${allHbdFormatted} HBD`}</span>
                            <span className="daily-hbd">(Daily {`${dailyHdbFormatted} HBD`})</span>
                        </div>
                    </div>
                </div>
                <div className="right-side">
                    <div className="total-votes" title={votesHPTitle}>{votesHPFormatted}</div>
                </div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        history: p.history,
        dynamicProps: p.dynamicProps,
        addAccount: p.addAccount,
        proposal: p.proposal
    }

    return <ProposalListItem {...props} />;
}
