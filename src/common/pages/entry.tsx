import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";
import { Link } from "react-router-dom";

import { match } from "react-router";

import moment from "moment";

import defaults from "../constants/defaults.json";

import {
  renderPostBody,
  setProxyBase,
  catchPostImage,
  postBodySummary,
  // @ts-ignore
} from "@esteemapp/esteem-render-helpers";
setProxyBase(defaults.imageServer);

import { AppState } from "../store";
import { State as GlobalState } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { Entry, State as EntriesState } from "../store/entries/types";

import { toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";

import EntryLink, { makePath as makeEntryPath } from "../components/entry-link";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import TagLink from "../components/tag-link";
import EntryVoteBtn from "../components/entry-vote-btn/index";
import EntryReblogBtn from "../components/entry-reblog-btn/index";
import EntryPayout from "../components/entry-payout/index";
import EntryVotes from "../components/entry-votes";
import DownloadTrigger from "../components/download-trigger";
import FormattedCurrency from "../components/formatted-currency";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NotFound from "../components/404";

import { _t } from "../i18n";

import parseDate from "../helper/parse-date";
import parseAsset from "../helper/parse-asset";

import _c from "../util/fix-class-names";
import truncate from "../util/truncate";

import { makeShareUrlReddit, makeShareUrlTwitter, makeShareUrlFacebook } from "../helper/url-share";

import { timeSvg, redditSvg, facebookSvg, twitterSvg } from "../img/svg";

interface MatchParams {
  category: string;
  permlink: string;
  username: string;
}

interface Props {
  history: History;
  location: Location;
  match: match<MatchParams>;
  global: GlobalState;
  entries: EntriesState;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
}

class EntryPage extends Component<Props> {
  componentDidMount() {}

  componentDidUpdate(prevProps: Readonly<Props>): void {}

  componentWillUnmount() {}

  shareReddit = (entry: Entry) => {
    const u = makeShareUrlReddit(entry.category, entry.author, entry.permlink, entry.title);
    window.open(u, "_blank");
  };

  shareTwitter = (entry: Entry) => {
    const u = makeShareUrlTwitter(entry.category, entry.author, entry.permlink, entry.title);
    window.open(u, "_blank");
  };

  shareFacebook = (entry: Entry) => {
    const u = makeShareUrlFacebook(entry.category, entry.author, entry.permlink);
    window.open(u, "_blank");
  };

  render() {
    const { entries, match } = this.props;
    const { username, permlink } = match.params;
    const author = username.replace("@", "");

    const groupKeys = Object.keys(entries);
    let entry: Entry | undefined = undefined;

    for (const k of groupKeys) {
      entry = entries[k].entries.find((x) => x.author === author && x.permlink === permlink);
      if (entry) {
        break;
      }
    }

    if (!entry) {
      return <NotFound />;
    }

    const reputation = Math.floor(entry.author_reputation);
    const created = moment(parseDate(entry.created));
    const last_update = parseDate(entry.updated);

    const renderedBody = { __html: renderPostBody(entry) };

    const isComment = entry.parent_author !== undefined;

    // Sometimes tag list comes with duplicate items
    const tags = [...new Set(entry.json_metadata.tags)];
    const { app } = entry.json_metadata;

    const repliesLoading = false;

    //  Meta config
    const url = `${defaults.base}${makeEntryPath(entry.category, entry.author, entry.permlink)}`;

    const metaProps = {
      title: truncate(entry.title, 60),
      description: truncate(postBodySummary(entry.body, 210), 200),
      url,
      canonical: url,
      image: catchPostImage(entry.body),
      published: created.toISOString(),
      tag: tags[0],
      keywords: tags.join(", "),
    };

    return (
      <>
        <Meta {...metaProps} />

        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content entry-page">
          <div className="the-entry">
            <div className="entry-header">
              {isComment && (
                <div className="comment-entry-header">
                  <div className="comment-entry-header-title">RE: {entry.title}</div>
                  <div className="comment-entry-header-info">{_t("entry.comment-entry-title")}</div>
                  <p className="comment-entry-root-title">{entry.title}</p>
                  <ul className="comment-entry-opts">
                    <li>
                      <a href={entry.url}>{_t("entry.comment-entry-go-root")}</a>
                    </li>
                    {entry.depth > 1 && (
                      <li>
                        <a href={makeEntryPath(entry.category, entry.parent_author!, entry.parent_permlink!)}>
                          {_t("entry.comment-entry-go-parent")}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <h1 className="entry-title">
                <span itemProp="headline name">{entry.title}</span>
              </h1>

              <div className="entry-info">
                <ProfileLink {...this.props} username={entry.author}>
                  <div className="author-part">
                    <div className="author-avatar">
                      <UserAvatar username={entry.author} size="medium" />
                    </div>
                    <div className="author">
                      <span className="author-name">
                        <span itemProp="author">
                          <span itemProp="name">{entry.author}</span>
                        </span>
                      </span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </div>
                </ProfileLink>
                <TagLink {...this.props} tag={entry.category}>
                  <a className="category">{entry.category}</a>
                </TagLink>
                <span className="separator" />
                <span className="date" title={created.format("LLLL")}>
                  {created.fromNow()}
                </span>
              </div>
            </div>
            <div className="entry-body markdown-view user-selectable" dangerouslySetInnerHTML={renderedBody} />
            <div className={`entry-footer ${repliesLoading ? "loading" : ""}`}>
              <div className="entry-tags">
                {tags.map((t) => (
                  <TagLink {...this.props} tag={t} key={t}>
                    <div className="entry-tag">{t}</div>
                  </TagLink>
                ))}
              </div>
              <div className="entry-info">
                <div className="left-side">
                  <div className="date" title={created.format("LLLL")}>
                    {timeSvg}
                    {created.fromNow()}
                  </div>
                  <span className="separator" />
                  <ProfileLink {...this.props} username={entry.author}>
                    <div className="author">
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </ProfileLink>

                  {app && (
                    <>
                      <span className="separator" />
                      <div className="app" dangerouslySetInnerHTML={{ __html: _t("entry.via-app", { app }) }} />
                    </>
                  )}
                </div>
                <div className="right-side">
                  <DownloadTrigger>
                    <span className="reply-btn" role="none">
                      {_t("entry.reply")}
                    </span>
                  </DownloadTrigger>
                </div>
              </div>
              <div className="entry-controls">
                <EntryVoteBtn {...this.props} />
                <EntryPayout {...this.props} entry={entry} />
                <EntryVotes {...this.props} entry={entry} />
                <EntryReblogBtn {...this.props} />
                <div className="sub-menu">
                  <a
                    className="sub-menu-item"
                    onClick={() => {
                      this.shareReddit(entry!);
                    }}
                  >
                    {redditSvg}
                  </a>
                  <a
                    className="sub-menu-item"
                    onClick={() => {
                      this.shareTwitter(entry!);
                    }}
                  >
                    {twitterSvg}
                  </a>
                  <a
                    className="sub-menu-item"
                    onClick={() => {
                      this.shareFacebook(entry!);
                    }}
                  >
                    {facebookSvg}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  entries: state.entries,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      addAccount,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryPage);
