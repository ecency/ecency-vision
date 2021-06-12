import React, {Component, Fragment} from "react";

import {History} from "history";

import {Global} from "../../store/global/types";
import {TrendingTags} from "../../store/trending-tags/types";

import Tag, {makePath} from "../tag";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

interface Props {
    history: History;
    global: Global;
    trendingTags: TrendingTags;
}

export class TrendingTagsCard extends Component<Props> {
    render() {
        const { trendingTags, global, history } = this.props;

        return (
            <div className="trending-tags-card">
                <h2 className="list-header">{_t('trending-tags.title')}</h2>
                {trendingTags.list.slice(0, 30).map((t) => {
                    const cls = _c(`tag-list-item ${global.tag === t ? "selected-item" : ""} d-flex align-items-center`);

                    return <Fragment key={t}>
                        <div className="d-flex">
                            {Tag({
                                ...this.props,
                                tag: t,
                                type: "link",
                                children: 
                                <a href={makePath(global.filter, t)} className={cls}>
                                    {t}
                                    {global.tag === t && <div className="text-secondary ml-4 pointer" onClick={(e) => {history.push('/' + global.filter);e.stopPropagation();e.preventDefault();}}>✖</div>}
                                </a>
                            })}
                        </div>
                    </Fragment>
                })}
            </div>
        );
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        global: p.global,
        trendingTags: p.trendingTags
    }

    return <TrendingTagsCard {...props} />
}
