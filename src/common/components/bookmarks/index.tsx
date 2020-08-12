import React, {Component} from "react";
import {Modal} from "react-bootstrap";

import {History} from "history";

import {Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";

import EntryLink from "../entry-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import {error} from "../feedback";

import {getBookmarks, Bookmark} from "../../api/private";

import {_t} from "../../i18n";


interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    onHide: () => void;
}

interface State {
    loading: boolean,
    items: Bookmark[]
}

export class Bookmarks extends Component<Props, State> {
    state: State = {
        loading: true,
        items: []
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = () => {
        const {activeUser} = this.props;

        this.setState({loading: true});
        getBookmarks(activeUser?.username!).then(items => {
            this.setState({items: this.sort(items), loading: false});
        }).catch(() => {
            this.setState({loading: false});
            error(_t('g.server-error'));
        })
    }

    sort = (items: Bookmark[]) =>
        items.sort((a, b) => {
            return new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1;
        });

    render() {
        const {items, loading} = this.state;

        return <div className="dialog-content">
            {loading && <LinearProgress/>}
            {items.length > 0 && (
                <div className="bookmarks-list">
                    <div className="bookmarks-list-body">
                        {items.map(item => {
                            return <div key={item._id}>
                                {EntryLink({
                                    ...this.props,
                                    entry: {
                                        category: "foo",
                                        author: item.author,
                                        permlink: item.permlink,
                                    },
                                    afterClick: () => {
                                        const {onHide} = this.props;
                                        onHide();
                                    },
                                    children: <div className="bookmarks-list-item">
                                        {UserAvatar({
                                            ...this.props,
                                            username: item.author,
                                            size: "medium"
                                        })}
                                        <div className="item-body">
                                            <span className="author">{item.author}</span>
                                            <span className="permlink">{item.permlink}</span>
                                        </div>
                                    </div>
                                })}
                            </div>
                        })}
                    </div>
                </div>
            )}
            {(!loading && items.length === 0) && (
                <div className="bookmarks-list">
                    {_t('bookmarks.empty-list')}
                </div>
            )}
        </div>
    }
}

export default class BookmarksDialog extends Component<Props> {
    hide = () => {
        const {onHide} = this.props;
        onHide();
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} size="lg" className="bookmarks-modal">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('bookmarks.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Bookmarks {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
