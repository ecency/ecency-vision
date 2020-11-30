import React, {Component, Fragment} from "react";

import {History} from "history";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {Community} from "../../store/communities/types";
import {Subscription} from "../../store/subscriptions/types";

import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import {error} from "../feedback";

import accountReputation from "../../helper/account-reputation";

import {getAccounts} from "../../api/hive";
import {getSubscribers} from "../../api/bridge";

import {_t} from "../../i18n";

interface Props {
    history: History;
    global: Global;
    community: Community;
    addAccount: (data: Account) => void;
}

interface State {
    loading: boolean;
    subscribers: Subscription[];
    accounts: Account[];
}

export class Subscribers extends Component<Props, State> {
    state: State = {
        loading: true,
        subscribers: [],
        accounts: []
    }

    _mounted: boolean = true;

    componentDidMount() {
        this.fetch();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    fetch = () => {
        const {community} = this.props;
        return getSubscribers(community.name).then(resp => {
            if (resp) {
                // merge subscribers & community team
                const subscribers = [
                    ...community.team.filter(x => !x[0].startsWith("hive-")),
                    ...resp.filter(x => community.team.find(y => x[0] === y[0]) === undefined)
                ];

                const usernames = subscribers.map(x => x[0]);

                return getAccounts(usernames).then(accounts => {
                    const minifiedAccounts: Account[] = accounts.map(x => ({name: x.name, reputation: x.reputation}));
                    this.stateSet({subscribers, accounts: minifiedAccounts});
                });
            }
            return null;
        }).catch(() => {
            error(_t('g.server-error'));
        }).finally(() => {
            this.stateSet({loading: false});
        })
    }

    render() {
        const {subscribers, accounts, loading} = this.state;

        if (loading) {
            return <div className="community-subscribers">
                <LinearProgress/>
            </div>
        }

        return <div className="community-subscribers">
            {subscribers.length > 0 && (
                <div className="user-list">
                    <div className="list-body">
                        {subscribers.map((item, i) => {
                            const username = item[0];
                            const account = accounts.find(x => x.name === username);

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
                                        {(account?.reputation !== undefined) && <span className="item-reputation">{accountReputation(account.reputation)}</span>}
                                    </div>
                                </div>

                            </div>

                        })}
                    </div>
                </div>
            )}
        </div>
    }
}


export default (p: Props) => {
    const props: Props = {
        history: p.history,
        global: p.global,
        community: p.community,
        addAccount: p.addAccount
    }

    return <Subscribers {...props} />
}

