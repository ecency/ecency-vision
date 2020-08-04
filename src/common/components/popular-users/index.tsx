import React, {Component} from "react";

import {History} from "history";

import {Account} from "../../store/accounts/types";

import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";

import {getPopularUsers, PopularUser} from "../../api/private";

import _c from "../../util/fix-class-names";

import {_t} from "../../i18n";

import {syncSvg} from "../../img/svg";

interface Props {
    history: History;
    addAccount: (data: Account) => void;
}

interface State {
    data: PopularUser[],
    list: PopularUser[],
    loading: boolean
}

export class PopularUsers extends Component<Props, State> {
    state: State = {
        data: [],
        list: [],
        loading: true
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
        this.stateSet({loading: true, data: []});

        getPopularUsers().then(data => {
            this.stateSet({data, loading: false}, () => {
                this.shuffle();
            });
        });
    }

    shuffle = () => {
        const {data} = this.state;
        const list = [...data].sort(() => Math.random() - 0.5).slice(0, 20);
        this.stateSet({list});
    }

    render() {
        const {list, loading} = this.state;

        return (
            <div className={_c(`popular-users-list ${loading ? "loading" : ""}`)}>
                <div className="list-header">
                    <div className="list-title">
                        {_t('popular-users.title')}
                    </div>
                    <div className={_c(`list-refresh ${loading ? "disabled" : ""}`)} onClick={this.shuffle}>
                        {syncSvg}
                    </div>
                </div>
                {loading && <LinearProgress/>}

                {list.length > 0 && (
                    <div className="list-body">
                        {list.map((r, i) => {
                            return <div className="list-item" key={i}>
                                {ProfileLink({
                                    ...this.props,
                                    username: r.name,
                                    children: <a><UserAvatar size="large" username={r.name}/></a>
                                })}
                                <div className="user-info">
                                    {ProfileLink({
                                        ...this.props,
                                        username: r.name,
                                        children: <a className="display-name">{r.display_name}</a>
                                    })}
                                    {ProfileLink({
                                        ...this.props,
                                        username: r.name,
                                        children: <a className="name"> {'@'}{r.name}</a>
                                    })}
                                    <div className="about">{r.about}</div>
                                </div>
                            </div>;
                        })}
                    </div>
                )}
            </div>
        );
    }
}


export default (p: Props) => {
    const props: Props = {
        history: p.history,
        addAccount: p.addAccount
    };

    return <PopularUsers {...props} />
}
