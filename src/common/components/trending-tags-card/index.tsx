import React, { Component, Fragment } from "react";

import { History } from "history";

import { Global } from "../../store/global/types";
import { TrendingTags } from "../../store/trending-tags/types";

import Tag, { makePath } from "../tag";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";
import { ActiveUser } from "../../store/active-user/types";
import "./_index.scss";

interface Props {
  history: History;
  global: Global;
  trendingTags: TrendingTags;
  activeUser: ActiveUser | null;
  // sortTagsInAsc?: any;
  // sortTagsInDsc?: any;
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

  // sortTagsInAsc = () => {
  //   const tags: any = this.props.trendingTags.list
  //   // console.log(this.props.trendingTags.list)
  //   tags.sort();
  //   this.setState({trendingTags: tags});
  // }

  //    sortTagsInDsc = () => {
  //   const tags = this.props.trendingTags.list
  //   // console.log(tags.sort((a, b) => (a > b ? -1 : 1)))
  //   tags.sort((a, b) => (a > b ? -1 : 1))
  //   this.setState({trendingTags: tags});
  //   }

  render() {
    const { trendingTags, global } = this.props;

    return (
      <div className="trending-tags-card">
        <h2 className="list-header">{_t("trending-tags.title")}</h2>

        {/* <SortTrendingTagss
        sortTagsInAsc={this.sortTagsInAsc}
        sortTagsInDsc={this.sortTagsInDsc}
        /> */}

        {trendingTags.list.slice(0, 30).map((t) => {
          const cls = _c(
            `tag-list-item ${global.tag === t ? "selected-item" : ""} flex items-center`
          );

          return (
            <Fragment key={t}>
              <div className="flex">
                {Tag({
                  ...this.props,
                  tag: t,
                  type: "link",
                  children: (
                    <a href={makePath(global.filter, t)} className={cls}>
                      {t}
                      {global.tag === t && (
                        <div
                          className="text-gray-600 ml-4 pointer"
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
    activeUser: p.activeUser
    // sortTagsInDsc: p.sortTagsInDsc,
    // sortTagsInDAsc: p.sortTagsInAsc
  };

  return <TrendingTagsCard {...props} />;
};
