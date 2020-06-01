import React, { Component } from "react";

import { History } from "history";

import { State as GlobalState } from "../../store/global/types";
import { State as TrendingTagsState } from "../../store/trending-tags/types";

import TagLink, { makePath } from "../tag-link/index";

import _c from "../../util/fix-class-names";

interface Props {
  history: History;
  global: GlobalState;
  trendingTags: TrendingTagsState;
}

export default class TrendingTags extends Component<Props> {
  render() {
    const { trendingTags, global } = this.props;

    return (
      <div className="trending-tags-card">
        <h2 className="list-header">Popular Tags</h2>
        {trendingTags.list.map((t) => {
          const cls = _c(
            `tag-list-item ${global.tag === t ? "selected-item" : ""}`
          );
          return (
            <TagLink {...this.props} tag={t} key={t}>
              <a href={makePath(global.filter, t)} className={cls}>
                {t}
              </a>
            </TagLink>
          );
        })}
      </div>
    );
  }
}
