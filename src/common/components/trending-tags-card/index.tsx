import React, { Component } from "react";

import { History } from "history";

import { Global } from "../../store/global/types";
import { TrendingTags } from "../../store/trending-tags/types";

import Tag, { makePath } from "../tag";

import _c from "../../util/fix-class-names";

interface Props {
  history: History;
  global: Global;
  trendingTags: TrendingTags;
}

export default class TrendingTagsCard extends Component<Props> {
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
            <Tag {...this.props} tag={t} key={t} type="link">
              <a href={makePath(global.filter, t)} className={cls}>
                {t}
              </a>
            </Tag>
          );
        })}
      </div>
    );
  }
}
