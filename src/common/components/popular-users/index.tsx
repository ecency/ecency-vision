import React, {Component} from "react";

import {History} from "history";

import {Account} from "../../store/accounts/types";
import {getPopularUsers, PopularUser} from "../../api/private";
import _c from "../../util/fix-class-names";
import {_t} from "../../i18n";
import LinearProgress from "../linear-progress";
import Tooltip from "../tooltip";
import {informationSvg} from "../../img/svg";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";

interface Props {
    history: History;
    addAccount: (data: Account) => void;
}

interface State {
    data: PopularUser[],
    loading: boolean
}

export class PopularUsers extends Component<Props, State> {

    state: State = {
        data: [],
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
            this.stateSet({data});
            this.stateSet({loading: false});
        });
    }

    render() {
        const {data, loading} = this.state;

        return (
            <div className={_c(`popular-users-list ${loading ? "loading" : ""}`)}>
                <div className="list-header">
                    <div className="list-title">
                        Popular Users
                    </div>
                </div>
                {loading && <LinearProgress/>}

                {data.length > 0 && (
                    <div className="list-body">
                        {data.map((r, i) => {
                            return <div className="list-item" key={i}>
                                {ProfileLink({
                                    ...this.props,
                                    username: r.name,
                                    children: <a><UserAvatar size="large" username={r.name}/></a>
                                })}
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
