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
import { Global } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { Entry, Entries } from "../store/entries/types";

import { toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";
import { addEntry } from "../store/entries/index";

import { makePath as makeEntryPath } from "../components/entry-link";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import Tag from "../components/tag";
import EntryVoteBtn from "../components/entry-vote-btn/index";
import EntryPayout from "../components/entry-payout/index";
import EntryVotes from "../components/entry-votes";
import DownloadTrigger from "../components/download-trigger";
import Discussion from "../components/discussion";
import MdHandler from "../components/md-handler";
import LinearProgress from "../components/linear-progress";
import EntryReblogBtn from "../components/entry-reblog-btn/index";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NotFound from "../components/404";

import { getPost } from "../api/bridge";

import { _t } from "../i18n";

import parseDate from "../helper/parse-date";
import entryCanonical from "../helper/entry-canonical";

import { makeShareUrlReddit, makeShareUrlTwitter, makeShareUrlFacebook } from "../helper/url-share";

import _c from "../util/fix-class-names";
import truncate from "../util/truncate";

import { timeSvg, redditSvg, facebookSvg, twitterSvg, replySvg, repeatSvg } from "../img/svg";

interface MatchParams {
  category: string;
  permlink: string;
  username: string;
}

interface Props {
  history: History;
  location: Location;
  match: match<MatchParams>;
  global: Global;
  entries: Entries;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
  addEntry: (entry: Entry) => void;
}

interface State {
  loading: boolean;
}

class EntryPage extends Component<Props, State> {
  state: State = {
    loading: false,
  };

  _mounted: boolean = true;

  componentDidMount() {
    this.ensureEntry();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { location } = this.props;
    if (location.pathname !== prevProps.location.pathname) {
      this.ensureEntry();
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb = undefined) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  ensureEntry = () => {
    const { match, addEntry } = this.props;

    if (!this.getEntry()) {
      this.stateSet({ loading: true });

      const { username, permlink } = match.params;

      getPost(username.replace("@", ""), permlink)
        .then((entry) => {
          if (entry) {
            addEntry(entry);
          }
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });
    }
  };

  getEntry = (): Entry | undefined => {
    const { entries, match } = this.props;
    const { username, permlink } = match.params;

    const groupKeys = Object.keys(entries);
    let entry: Entry | undefined = undefined;

    for (const k of groupKeys) {
      entry = entries[k].entries.find((x) => x.author === username.replace("@", "") && x.permlink === permlink);
      if (entry) {
        break;
      }
    }

    return entry;
  };

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
    const { loading } = this.state;

    if (loading) {
      return <LinearProgress />;
    }

    const entry = this.getEntry();

    if (!entry) {
      return <NotFound />;
    }

    const reputation = Math.floor(entry.author_reputation);
    const published = moment(parseDate(entry.created));
    const modified = moment(parseDate(entry.updated));

    const renderedBody = { __html: renderPostBody(entry.body, false) };

    // Sometimes tag list comes with duplicate items
    const tags = [...new Set(entry.json_metadata.tags)];
    const app = entry.json_metadata?.app;

    //  Meta config
    const url = entryCanonical(entry) || "";

    const metaProps = {
      title: truncate(entry.title, 60),
      description: truncate(postBodySummary(entry.body, 210), 200),
      url,
      canonical: url,
      image: catchPostImage(entry.body),
      published: published.toISOString(),
      modified: modified.toISOString(),
      tag: tags[0],
      keywords: tags.join(", "),
    };

    return (
      <>
        <Meta {...metaProps} />
        <Theme {...this.props} />
        <MdHandler {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content entry-page">
          <div className="the-entry">
            <div className="entry-header">
              {entry.parent_author !== undefined && (
                <div className="comment-entry-header">
                  <div className="comment-entry-header-title">RE: {entry.title}</div>
                  <div className="comment-entry-header-info">{_t("entry.comment-entry-title")}</div>
                  <p className="comment-entry-root-title">{entry.title}</p>
                  <ul className="comment-entry-opts">
                    <li>
                      <Link to={entry.url}>{_t("entry.comment-entry-go-root")}</Link>
                    </li>
                    {entry.depth > 1 && (
                      <li>
                        <Link to={makeEntryPath(entry.category, entry.parent_author!, entry.parent_permlink!)}>
                          {_t("entry.comment-entry-go-parent")}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <h1 className="entry-title">{entry.title}</h1>

              <div className="entry-info">
                <ProfileLink {...this.props} username={entry.author}>
                  <div className="author-part">
                    <div className="author-avatar">
                      <UserAvatar username={entry.author} size="medium" />
                    </div>
                    <div className="author">
                      <span className="author-name">{entry.author}</span>
                      <span className="author-reputation">{reputation}</span>
                    </div>
                  </div>
                </ProfileLink>
                <Tag {...this.props} tag={entry.category} type="link">
                  <a className="category">{entry.category}</a>
                </Tag>
                <span className="separator" />
                <span className="date" title={published.format("LLLL")}>
                  {published.fromNow()}
                </span>
              </div>
            </div>
            <div className="entry-body markdown-view user-selectable" dangerouslySetInnerHTML={renderedBody} />
            <div className="entry-footer">
              <div className="entry-tags">
                {tags.map((t) => (
                  <Tag {...this.props} tag={t} key={t} type="link">
                    <div className="entry-tag">{t}</div>
                  </Tag>
                ))}
              </div>
              <div className="entry-info">
                <div className="left-side">
                  <div className="date" title={published.format("LLLL")}>
                    {timeSvg}
                    {published.fromNow()}
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
                    <a className="reply-btn">
                      {replySvg} {_t("g.reply")}
                    </a>
                  </DownloadTrigger>
                  <span className="separator" />
                  <EntryReblogBtn {...this.props} />
                </div>
              </div>
              <div className="entry-controls">
                <EntryVoteBtn {...this.props} />
                <EntryPayout {...this.props} entry={entry} />
                <EntryVotes {...this.props} entry={entry} />
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

            <Discussion {...this.props} parent={entry} />
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
      addEntry,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryPage);
