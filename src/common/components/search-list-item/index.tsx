import React, {Component} from "react";

import {History} from "history";

import moment from "moment";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";


import EntryLink from "../entry-link";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import Tag from "../tag";
import FormattedCurrency from "../formatted-currency";

import defaults from "../../constants/defaults.json";

import {
    catchPostImage,
    postBodySummary,
    setProxyBase,
    // @ts-ignore
} from "ecency-render-helper";

setProxyBase(defaults.imageServer);

import {SearchResult} from "../../api/private";

import {peopleSvg, commentSvg} from "../../img/svg";

const fallbackImage = require("../../img/fallback.png");
const noImage = require("../../img/noimage.png");


interface Props {
    history: History;
    global: Global;
    addAccount: (data: Account) => void;
    res: SearchResult;
}

class SearchListItem extends Component<Props> {
    shouldComponentUpdate(): boolean {
        return false;
    }

    render() {
        const {global, res} = this.props;

        const entry = {
            category: res.category,
            author: res.author,
            permlink: res.permlink
        }

        const summary: string = postBodySummary(res.body, 200);
        const img: string = (global.canUseWebp ? catchPostImage(res.body, 600, 500, 'webp') : catchPostImage(res.body, 600, 500)) || noImage;

        let thumb = (
            <img src={img} alt={res.title} onError={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackImage;
            }}/>
        );

        const date = moment(res.created_at);
        const dateRelative = date.fromNow(true);
        const dateFormatted = date.format("LLLL");

        return <div className="search-list-item">
            <div className="item-header">
                <div className="author-part">
                    {ProfileLink({
                        ...this.props,
                        username: res.author,
                        children: <a className="author-avatar">{UserAvatar({...this.props, username: res.author, size: "small"})}</a>
                    })}
                    {ProfileLink({
                        ...this.props,
                        username: res.author,
                        children: <div className="author">{res.author}
                            <span className="author-reputation">{res.author_rep.toFixed(0)}</span>
                        </div>
                    })}
                </div>
                {Tag({
                    ...this.props,
                    tag: res.category,
                    type: "link",
                    children: <a className="category">{res.category}</a>
                })}

                <span className="date" title={dateFormatted}>{dateRelative}</span>
            </div>
            <div className="item-body">
                <div className="item-image">
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div>
                            {thumb}
                        </div>
                    })}
                </div>
                <div className="item-summary">
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div className="item-title">{res.title}</div>
                    })}
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <div className="item-body">{summary}</div>
                    })}
                </div>
                <div className="item-controls">
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <a className="result-payout">
                            <FormattedCurrency {...this.props} value={res.payout}/>
                        </a>
                    })}
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <a className="result-votes"> {peopleSvg} {res.total_votes}</a>
                    })}
                    {EntryLink({
                        ...this.props,
                        entry,
                        children: <a className="result-replies">{commentSvg} {res.children}</a>
                    })}
                    <div className="app">{res.app}</div>
                </div>
            </div>
        </div>
    }
}


export default (p: Props) => {

    const props: Props = {
        history: p.history,
        global: p.global,
        addAccount: p.addAccount,
        res: p.res
    }

    return <SearchListItem {...props} />;
}
