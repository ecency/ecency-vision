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

import {search, SearchResult} from "../../api/search-api";

import {_t} from "../../i18n";

import parseDate from "../../helper/parse-date";
import isCommunity from "../../helper/is-community";

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
    entries: SearchResult[]
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

    buildQuery = (entry :Entry) => {
        const {json_metadata, permlink} = entry; 
        let q = "*";
        q += ` type:post`;
        let tags;

        if (json_metadata && json_metadata.tags) {
            tags = json_metadata.tags.filter((x :string) => x !== "").filter((x :string) => !isCommunity(x)).filter((x :string, ind :number) => ind < 3).join(',');
        }
        if (tags && tags.length > 0) {
            q += ` tag:${tags}`;
        } else {
            const fperm = permlink.split('-');
            tags = fperm.filter((x :string) => x !== "").filter((x :string) => !(/^-?\d+$/.test(x))).filter((x :string) => x.length > 2).join(',');
            q += ` tag:${tags}`;
        }
        return q;
    }

    fetch = () => {
        const {entry} = this.props;
        const {permlink} = entry;
        const limit = 3;

        this.stateSet({loading: true});
        const query = this.buildQuery(entry);
        search(query, "newest", "0", undefined, undefined).then(r => {
            let entries: SearchResult[];

            entries = r.results
                            .filter(r => r.permlink !== permlink)
                            .slice(0, limit);

            this.stateSet({entries});
        }).finally(() => {
            this.stateSet({
                loading: false,
            })
        });
    }

    render() {
        const {global} = this.props
        const {entries} = this.state;
        if (entries.length !== 3) {
            return null;
        }

        return (
            <>
                <div className="similar-entries-list">
                    <div className="similar-entries-list-header">
                        <div className="list-header-text">
                            {_t('similar-entries.title')}
                        </div>
                    </div>
                    <div className="similar-entries-list-body">
                        {entries.map((en, i) => {
                            const img = catchPostImage(en.img_url, 600, 500, global.canUseWebp ? 'webp' : 'match') || noImage;
                            const date = moment(parseDate(`${en.created_at.replace('+00:00', '')}`));
                            const dateRelative = date.fromNow();

                            return <div className="similar-entries-list-item" key={i}>
                                {EntryLink({
                                    ...this.props,
                                    entry: {category: "relevant", author: en.author, permlink: en.permlink},
                                    children: <>
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
                                        <div className="item-title">{en.title}</div>
                                        <div className="item-footer">
                                            <span className="item-footer-author">
                                                {en.author}
                                            </span>
                                            <span className="item-footer-date">{dateRelative}</span>
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
