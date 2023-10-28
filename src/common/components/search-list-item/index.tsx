import React, { Component } from "react";
import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import EntryLink from "../entry-link";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import Tag from "../tag";
import FormattedCurrency from "../formatted-currency";
import defaults from "../../constants/defaults.json";
import { catchPostImage, postBodySummary, setProxyBase } from "@ecency/render-helper";
import accountReputation from "../../helper/account-reputation";

import { SearchResult } from "../../api/search-api";

import { commentSvg, peopleSvg } from "../../img/svg";
import { dateToFormatted, dateToRelative } from "../../helper/parse-date";
import "./_index.scss";
import { transformMarkedContent } from "../../util/transform-marked-content";

setProxyBase(defaults.imageServer);

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
    const { global, res } = this.props;
    const fallbackImage = require("../../img/fallback.png");
    const noImage = require("../../img/noimage.svg");

    const entry = {
      category: res.category,
      author: res.author,
      permlink: res.permlink
    };

    const title = res.title_marked ? transformMarkedContent(res.title_marked) : res.title;
    const summary = res.body_marked
      ? transformMarkedContent(res.body_marked)
      : postBodySummary(res.body, 200);
    const img: string =
      (global.canUseWebp
        ? catchPostImage(res.body, 600, 500, "webp")
        : catchPostImage(res.body, 600, 500)) || noImage;

    let thumb = (
      <img
        src={img}
        alt={res.title}
        onError={(e: React.SyntheticEvent) => {
          const target = e.target as HTMLImageElement;
          target.src = fallbackImage;
        }}
        className={img === noImage ? "no-img" : ""}
      />
    );

    const dateRelative = dateToRelative(res.created_at);
    const dateFormatted = dateToFormatted(res.created_at);
    const reputation = accountReputation(res.author_rep);

    return (
      <div className="search-list-item">
        <div className="item-header">
          <div className="item-header-main">
            <div className="author-part">
              {ProfileLink({
                ...this.props,
                username: res.author,
                children: <UserAvatar username={res.author} size="small" />
              })}
              {ProfileLink({
                ...this.props,
                username: res.author,
                children: (
                  <div className="author">
                    {res.author}
                    <span className="author-reputation">{reputation}</span>
                  </div>
                )
              })}
            </div>
            {Tag({
              ...this.props,
              tag: res.category,
              type: "link",
              children: <a className="category">{res.category}</a>
            })}

            <span className="date" title={dateFormatted}>
              {dateRelative}
            </span>
          </div>
        </div>
        <div className="item-body">
          <div className="item-image">
            {EntryLink({
              ...this.props,
              entry,
              children: <div>{thumb}</div>
            })}
          </div>
          <div className="item-summary">
            {EntryLink({
              ...this.props,
              entry,
              children: <div className="item-title">{title}</div>
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
              children: (
                <a className="result-payout">
                  <FormattedCurrency {...this.props} value={res.payout} />
                </a>
              )
            })}
            {EntryLink({
              ...this.props,
              entry,
              children: (
                <a className="result-votes">
                  {" "}
                  {peopleSvg} {res.total_votes}
                </a>
              )
            })}
            {EntryLink({
              ...this.props,
              entry,
              children: (
                <a className="result-replies">
                  {commentSvg} {res.children}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    addAccount: p.addAccount,
    res: p.res
  };

  return <SearchListItem {...props} />;
};
