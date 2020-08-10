import React, {Component} from "react";

import {History} from "history";

import moment from "moment";

import {Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";

import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import PopoverConfirm from "../popover-confirm";
import Tooltip from "../tooltip";
import Tag from "../tag";
import {error} from "../feedback";

import {_t} from "../../i18n";

import {getDrafts, Draft, deleteDraft} from "../../api/private";

import accountReputation from "../../helper/account-reputation";

import defaults from "../../constants/defaults.json";

import {deleteForeverSvg, pencilOutlineSvg} from "../../img/svg";

import {
    catchPostImage,
    postBodySummary,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

const fallbackImage = require("../../img/fallback.png");
const noImage = require("../../img/noimage.png");

interface ItemProps {
    history: History;
    global: Global;
    draft: Draft;
    activeUser: ActiveUser | null;
    editFn: (item: Draft) => void;
    deleteFn: (item: Draft) => void;
}

export class ListItem extends Component<ItemProps> {
    render() {
        const {activeUser, draft, editFn, deleteFn} = this.props;
        const account = activeUser?.data!

        const author = account.name
        const reputation = account.reputation;

        const tags = draft.tags ? draft.tags.split(/[ ,]+/) : [];
        const tag = tags[0] || '';
        const img = catchPostImage(draft.body) || noImage;
        const summary = postBodySummary(draft.body, 200);

        const date = moment(new Date(draft.created));
        const dateRelative = date.fromNow(true);
        const dateFormatted = date.format("LLLL");

        return <div className="drafts-list-item">
            <div className="item-header">
                <div className="author-part">
                    <a className="author-avatar">{UserAvatar({...this.props, username: author, size: "small"})}</a>
                    <a className="author">{author}<span className="author-reputation">{accountReputation(reputation!)}</span></a>
                </div>
                {Tag({
                    ...this.props,
                    tag,
                    type: "span",
                    children: <a className="category">{tag}</a>
                })}
                <span className="date" title={dateFormatted}>{dateRelative}</span>
            </div>
            <div className="item-body">
                <div className="item-image">
                    <div>
                        <img
                            alt={draft.title}
                            src={img}
                            onError={(e: React.SyntheticEvent) => {
                                const target = e.target as HTMLImageElement;
                                target.src = fallbackImage;
                            }}
                        />
                    </div>
                </div>
                <div className="item-summary">
                    <div className="item-title">{draft.title}</div>
                    <div className="item-body">{summary}</div>
                </div>
                <div className="item-controls">
                    <PopoverConfirm onConfirm={() => {
                        deleteFn(draft);
                    }}>
                        <a className="btn-delete">
                            <Tooltip content={_t("g.delete")}><span>{deleteForeverSvg}</span></Tooltip>
                        </a>
                    </PopoverConfirm>
                    <a className="btn-edit" onClick={() => {
                        editFn(draft);
                    }}>
                        <Tooltip content={_t("g.edit")}><span>{pencilOutlineSvg}</span></Tooltip>
                    </a>
                </div>
            </div>
        </div>
    }
}

interface Props {
    global: Global;
    history: History;
    activeUser: ActiveUser | null;
    onHide: () => void;
    onPick?: (url: string) => void;
}

interface State {
    loading: boolean,
    items: Draft[]
}


export class Drafts extends Component<Props, State> {
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
        getDrafts(activeUser?.username!).then(items => {
            this.setState({items: this.sort(items), loading: false});
        }).catch(() => {
            this.setState({loading: false});
            error(_t('g.server-error'));
        })
    }

    sort = (items: Draft[]) =>
        items.sort((a, b) => {
            return new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1;
        });

    delete = (item: Draft) => {
        const {activeUser} = this.props;

        deleteDraft(activeUser?.username!, item._id).then(() => {
            const {items} = this.state;
            const nItems = [...items].filter(x => x._id !== item._id);
            this.setState({items: this.sort(nItems)});
        }).catch(() => {
            error(_t('g.server-error'));
        })
    }

    edit = (item: Draft) => {
        const {history, onHide} = this.props;

        history.push(`/draft/${item._id}`);
        onHide();
    }

    render() {
        const {items, loading} = this.state;

        return <div className="dialog-content">
            {loading && <LinearProgress/>}
            {items.length > 0 && (
                <div className="drafts-list">
                    <div className="drafts-list-body">
                        {items.map(item => (
                            <ListItem key={item._id} {...this.props} draft={item} editFn={this.edit} deleteFn={this.delete}/>
                        ))}
                    </div>
                </div>
            )}
            {(!loading && items.length === 0) && (
                <div className="drafts-list">
                    {_t('drafts.empty-list')}
                </div>
            )}
        </div>
    }
}


export default class DraftsDialog extends Component<Props> {
    hide = () => {
        const {onHide} = this.props;
        onHide();
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} size="lg" className="drafts-modal">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('drafts.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Drafts {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
