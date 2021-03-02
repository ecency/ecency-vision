import React from "react";

import {History, Location} from "history";

import moment from "moment";

import isEqual from "react-fast-compare";

import defaults from "../../constants/defaults.json";

import {catchPostImage, setProxyBase} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import {Global} from "../../store/global/types";
import {Entry} from "../../store/entries/types";

import BaseComponent from "../base";
import EntryLink from "../entry-link";

import *  as bridgeApi from "../../api/bridge";

import {_t} from "../../i18n";

import parseDate from "../../helper/parse-date";

import {formatListBulletedSvg, commentSvg} from "../../img/svg";

const fallbackImage = require("../../img/fallback.png");
const noImage = require("../../img/noimage.png");

interface Props {
    history: History;
    location: Location;
    global: Global;
    entry: Entry;
}

interface State {
    loading: boolean;
    entries: Entry[]
}

export class SimilarEntries extends BaseComponent<Props, State> {
    state: State = {
        loading: false,
        entries: []
    }

    componentDidMount() {
        this.fetch();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (!isEqual(this.props.location, prevProps.location)) {
            this.fetch();
        }
    }

    fetch = () => {
        const {entry} = this.props;
        const {author, permlink} = entry;

        this.stateSet({loading: true});
        bridgeApi.getAccountPosts('posts', author, '', '', 6)
            .then((resp) => {

                if (resp) {
                    const entries = resp
                        .filter(r => r.permlink !== permlink)
                        .filter(r => r.author === author)
                        // Get top 3
                        .slice(0, 3)

                    this.stateSet({entries});
                }
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    }

    render() {
        const {entry, global} = this.props
        const {entries} = this.state;
        if (entries.length !== 3) {
            return null;
        }

        return (
            <>
                <div className="similar-entries-list">
                    <div className="similar-entries-list-header">
                        <div className="list-header-text">
                            {formatListBulletedSvg} {_t('similar-entries.title', {n: entry.author})}
                        </div>
                    </div>
                    <div className="similar-entries-list-body">
                        {entries.map((en, i) => {
                            const img = catchPostImage(en, 600, 500, global.canUseWebp ? 'webp' : 'match') || noImage;
                            const date = moment(parseDate(en.created));
                            const dateRelative = date.fromNow();

                            return <div className="similar-entries-list-item" key={i}>
                                {EntryLink({
                                    ...this.props,
                                    entry: {category: "foo", author: en.author, permlink: en.permlink},
                                    children: <>
                                        <div className="item-title">{en.title}</div>
                                        <div className="item-image">
                                            <img
                                                src={img}
                                                alt={en.title}
                                                onError={(e: React.SyntheticEvent) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = fallbackImage;
                                                }}
                                            />
                                        </div>
                                        <div className="item-footer">
                                            <span className="item-footer-date">
                                                {dateRelative}
                                            </span>
                                            {en.children > 0 && (<span className="item-footer-comment-count">{commentSvg} {en.children}</span>)}
                                        </div>
                                    </>
                                })}
                            </div>
                        })}
                    </div>
                </div>
            </>
        );
    }
}


export default (p: Props) => {
    const props = {
        history: p.history,
        location: p.location,
        global: p.global,
        entry: p.entry
    }
    return <SimilarEntries {...props} />
}
