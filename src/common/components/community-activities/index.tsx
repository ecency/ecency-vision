import React, {Component} from "react";
import {Modal} from "react-bootstrap";

import {History} from "history";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {Community} from "../../store/communities/types";

import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import {error} from "../feedback";

import {getAccountNotifications, AccountNotification} from "../../api/bridge";

import {_t} from "../../i18n";
import moment from "moment";

interface ListItemProps {
    history: History;
    global: Global;
    notification: AccountNotification;
    addAccount: (data: Account) => void;
}

class ListItem extends Component<ListItemProps> {
    shouldComponentUpdate(): boolean {
        return false;
    }

    formatMessage = (pattern: string): JSX.Element => {
        const {notification} = this.props;
        const {msg} = notification;

        const parts = msg.split(new RegExp(`(${pattern})`, 'gi'));

        return (
            <span>
                {' '}
                {parts.map((part, i) => (
                    <span
                        key={i}
                        style={
                            part.toLowerCase() === pattern.toLowerCase() ? {fontWeight: 'bold'} : {}
                        }>
                    {part}
                </span>
                ))}
                {' '}
            </span>
        );
    }

    render() {
        const {notification} = this.props;
        let mentions = notification.msg.match(/@[\w.\d-]+/)
        if (!mentions) {
            return null;
        }

        const username = mentions[0].replace('@', '');
        const msg = this.formatMessage(username);
        const date = moment(notification.date);

        return <div className="activity-list-item">
            <div className="activity-user">
                {ProfileLink({
                    ...this.props,
                    username,
                    children: <>{UserAvatar({...this.props, username, size: "medium"})}</>
                })}
            </div>
            <div className="activity-content">
                <div className="activity-msg">
                    {msg}
                </div>

                <div className="activity-date">
                    {date.fromNow()}
                </div>

            </div>
        </div>;
    }
}

interface Props {
    history: History;
    global: Global;
    community: Community;
    addAccount: (data: Account) => void;
    onHide: () => void;
}

interface State {
    loading: boolean;
    items: AccountNotification[];
}

export class Activities extends Component<Props, State> {
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
        getAccountNotifications(community.name).then(r => {
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
            <div className="activity-list">
                <div className="activity-list-body">
                    {items.length > 0 && (
                        <>
                            {items.map((item, i) => <ListItem key={i} {...this.props} notification={item}/>)}
                        </>
                    )}
                </div>
            </div>
        </div>
    }
}


export default class ActivitiesDialog extends Component<Props> {
    hide = () => {
        const {onHide} = this.props;
        onHide();
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} animation={false} size="lg" className="community-activities-modal">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('community.activities')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Activities {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
