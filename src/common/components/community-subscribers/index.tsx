import React, {Component, Fragment} from "react";
import {Modal} from "react-bootstrap";

import {History} from "history";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {Community} from "../../store/communities/types";
import {Subscription} from "../../store/subscriptions/types";

import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import {error} from "../feedback";

import {getSubscribers} from "../../api/bridge";

import {_t} from "../../i18n";


interface Props {
    history: History;
    global: Global;
    community: Community;
    addAccount: (data: Account) => void;
    onHide: () => void;
}

interface State {
    loading: boolean;
    items: Subscription[];
}

export class Subscribers extends Component<Props, State> {
    state: State = {
        loading: true,
        items: []
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
        getSubscribers(community.name).then(r => {
            this.stateSet({items: r, loading: false});
        }).catch(() => {
            this.stateSet({loading: false});
            error(_t('g.server-error'));
        })
    }

    render() {
        const {items, loading} = this.state;

        return <div className="dialog-content">
            {loading && <LinearProgress/>}
            <div className="user-list-body">
                {items.length > 0 && (
                    <div className="user-list">
                        <div className="user-list-body">
                            {items.map((item, i) => {
                                const username = item[0];
                                return <Fragment key={i}>
                                    {
                                        ProfileLink({
                                            ...this.props,
                                            username,
                                            children: <div className="user-list-item">
                                                {UserAvatar({...this.props, username, size: "large"})}
                                                <div className="friend-name notransalte">{username}</div>
                                            </div>
                                        })
                                    }
                                </Fragment>
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    }
}


export default class SubscribersDialog extends Component<Props> {
    hide = () => {
        const {onHide} = this.props;
        onHide();
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} size="lg" animation={false} className="subscribers-modal">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('community.subscribers')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Subscribers {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
