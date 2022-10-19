import React, { Component, Fragment } from "react";

import { History } from "history";

import { Global } from "../../store/global/types";
import { TrendingTags } from "../../store/trending-tags/types";

import Tag, { makePath } from "../tag";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";
import { ActiveUser } from "../../store/active-user/types";
import { SortTrendingTagss } from "../sort-trending-tags";

interface Props {
  history: History;
  global: Global;
  trendingTags: TrendingTags;
  activeUser: ActiveUser | null;
  sortTagsInAsc?: any;
  sortTagsInDsc?: any;
}

export class TrendingTagsCard extends Component<Props> {
  handleUnselection = () => {
    const {
      history,
      global: { filter },
      activeUser
    } = this.props;
    history.push("/" + filter + ((activeUser && activeUser.username && "/my") || ""));
  };

    sortTagsInAsc = () => {
     return this.props.trendingTags.list.sort()
    }
  
     sortTagsInDsc = () => {
     return this.props.trendingTags.list.reverse()
    }

  render() {
    const { trendingTags, global } = this.props;

    return (
      <div className="trending-tags-card">
        <h2 className="list-header">{_t("trending-tags.title")}</h2>
      
        <SortTrendingTagss />
       
        {trendingTags.list.slice(0, 30).map((t) => {
          const cls = _c(
            `tag-list-item ${global.tag === t ? "selected-item" : ""} d-flex align-items-center`
          );

          return (
            <Fragment key={t}>
              <div className="d-flex">
                {Tag({
                  ...this.props,
                  tag: t,
                  type: "link",
                  children: (
                    <a href={makePath(global.filter, t)} className={cls}>
                      {t}
                      {global.tag === t && (
                        <div
                          className="text-secondary ml-4 pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.handleUnselection();
                          }}
                        >
                          ✖
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            </Fragment>
          );
        })}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    global: p.global,
    trendingTags: p.trendingTags,
    activeUser: p.activeUser,
    sortTagsInDsc: p.sortTagsInDsc,
    sortTagsInDAsc: p.sortTagsInAsc
  };

  return <TrendingTagsCard {...props} />;
};
