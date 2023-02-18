import React, { Fragment, Ref } from "react";

import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { match } from "react-router";
import moment from "moment";

import {
  renderPostBody,
  setProxyBase,
  catchPostImage,
  postBodySummary
} from "@ecency/render-helper";

import { Entry, EntryVote } from "../../store/entries/types";
import { Community } from "../../store/communities/types";
import { Account, FullAccount } from "../../store/accounts/types";

import EntryLink, { makePath as makeEntryPath } from "../../components/entry-link";

import BaseComponent from "../../components/base";
import ProfileLink from "../../components/profile-link";
import UserAvatar from "../../components/user-avatar";
import Tag from "../../components/tag";
import MdHandler from "../../components/md-handler";
import Comment from "../../components/comment";
import SimilarEntries from "../../components/similar-entries";
import EditHistory from "../../components/edit-history";
import { error } from "../../components/feedback";
import Meta from "../../components/meta";
import Theme from "../../components/theme/index";
import Feedback from "../../components/feedback";
import NotFound from "../../components/404";
import AuthorInfoCard from "../../components/author-info-card";

import * as bridgeApi from "../../api/bridge";
import { comment, formatError } from "../../api/operations";

import parseDate from "../../helper/parse-date";
import entryCanonical from "../../helper/entry-canonical";
import tempEntry from "../../helper/temp-entry";
import appName from "../../helper/app-name";
import { makeJsonMetaDataReply, createReplyPermlink } from "../../helper/posting";
import isCommunity from "../../helper/is-community";
import accountReputation from "../../helper/account-reputation";

import truncate from "../../util/truncate";
import replaceLinkIdToDataId from "../../util/replace-link-id-to-data-id";
import * as ss from "../../util/session-storage";
import * as ls from "../../util/local-storage";
import { crossPostMessage } from "../../helper/cross-post";

import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";

import { version } from "../../../../package.json";

import { PageProps, pageMapDispatchToProps, pageMapStateToProps } from "../common";

import defaults from "../../constants/defaults.json";
import dmca from "../../constants/dmca.json";

import { getFollowing } from "../../api/hive";
import { history } from "../../store";
import { deleteForeverSvg, pencilOutlineSvg } from "../../img/svg";
import entryDeleteBtn from "../../components/entry-delete-btn";
import { SelectionPopover } from "../../components/selection-popover";
import { commentHistory } from "../../api/private-api";
import { getPost } from "../../api/bridge";
import { StaticNavbar } from "../../components/static";
import "./entry-amp-page.css";
import { Helmet } from "react-helmet";

setProxyBase(defaults.imageServer);

interface MatchParams {
  category: string;
  permlink: string;
  username: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
  account: Account;
  updateWalletValues: () => void;
}

interface State {
  loading: boolean;
  replying: boolean;
  showIfNsfw: boolean;
  edit: boolean;
  comment: string;
  editHistory: boolean;
  showProfileBox: boolean;
  entryIsMuted: boolean;
  selection: string;
  isCommented: boolean;
  isMounted: boolean;
  postIsDeleted: boolean;
  deletedEntry: { title: string; body: string; tags: any } | null;
}

class EntryPage extends BaseComponent<Props, State> {
  state: State = {
    loading: false,
    replying: false,
    edit: false,
    showIfNsfw: false,
    editHistory: false,
    comment: "",
    isCommented: false,
    showProfileBox: false,
    entryIsMuted: false,
    isMounted: false,
    selection: "",
    postIsDeleted: false,
    deletedEntry: null
  };

  commentInput: Ref<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.commentInput = React.createRef();
  }

  viewElement: HTMLDivElement | undefined;

  componentDidMount() {
    this.ensureEntry();
    this.fetchMutedUsers();
    const entry = this.getEntry();

    const { location, global } = this.props;
    if (global.usePrivate && location.search === "?history") {
      this.toggleEditHistory();
    }
    window.addEventListener("scroll", this.detect);
    window.addEventListener("resize", this.detect);
    let replyDraft = ss.get(`reply_draft_${entry?.author}_${entry?.permlink}`);
    replyDraft = (replyDraft && replyDraft.trim()) || "";
    this.setState({ isMounted: true, selection: replyDraft });
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevStates: State): void {
    const { location } = this.props;
    if (location.pathname !== prevProps.location.pathname) {
      this.setState({ isMounted: false });
      this.ensureEntry();
    }
    if (prevProps.activeUser !== this.props.activeUser) {
      if (this.state.edit) {
        this.setState({ edit: false });
      }
    }
  }

  componentWillUnmount() {
    const p1 = new Promise((resolve, reject) => {
      resolve(window.removeEventListener("scroll", this.detect));
    });
    const p2 = new Promise((resolve, reject) => {
      resolve(window.removeEventListener("resize", this.detect));
    });
    Promise.all([p1, p2]);
    this.setState({ isMounted: false });
  }

  loadDeletedEntry = (author: string, permlink: string) => {
    commentHistory(author, permlink)
      .then((resp) => {
        this.stateSet({
          deletedEntry: {
            body: resp.list[0].body,
            title: resp.list[0].title,
            tags: resp.list[0].tags
          },
          loading: false
        });
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {});
  };

  // detects distance between title and comments section sets visibility of profile card
  detect = () => {
    const { showProfileBox } = this.state;
    const infoCard: HTMLElement | null = document.getElementById("avatar-fixed-container");
    const top = this?.viewElement?.getBoundingClientRect()?.top || 120;

    if (infoCard != null && window.scrollY > 180 && top && !(top <= 0)) {
      infoCard.classList.replace("invisible", "visible");
      if (!showProfileBox) {
        this.setState({ showProfileBox: true });
      }
    } else if (infoCard != null && window.scrollY <= 180) {
      infoCard.classList.replace("visible", "invisible");
      if (showProfileBox) {
        this.setState({ showProfileBox: false });
      }
    } else if (top && top <= 0 && infoCard !== null) {
      infoCard.classList.replace("visible", "invisible");
      if (showProfileBox) {
        this.setState({ showProfileBox: false });
      }
    } else return;
  };

  updateReply = (text: string) => {
    const entry = this.getEntry();
    const { activeUser, updateReply } = this.props;

    if (entry) {
      const { permlink, parent_author: parentAuthor, parent_permlink: parentPermlink } = entry;
      const jsonMeta = makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version);

      this.stateSet({ replying: true });

      comment(
        activeUser?.username!,
        parentAuthor!,
        parentPermlink!,
        permlink,
        "",
        text,
        jsonMeta,
        null
      )
        .then(() => {
          const nReply: Entry = {
            ...entry,
            body: text
          };

          this.setState({ comment: text, isCommented: true });
          ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);
          updateReply(nReply); // update store
          this.toggleEdit(); // close comment box
          this.reload();
        })
        .catch((e) => {
          error(...formatError(e));
        })
        .finally(() => {
          this.stateSet({ replying: false, isCommented: false });
        });
    }
  };

  toggleEdit = () => {
    const { edit } = this.state;
    this.stateSet({ edit: !edit });
  };

  deleted = async () => {
    const { deleteReply } = this.props;
    let entry = this.getEntry();
    entry && deleteReply(entry);
    ls.set(`deletedComment`, entry?.post_id);
    history?.goBack();
  };

  toggleEditHistory = () => {
    const { editHistory } = this.state;
    this.stateSet({ editHistory: !editHistory });
  };

  ensureEntry = async () => {
    const { match, addEntry, updateEntry, addCommunity, activeUser, history } = this.props;
    const entry = this.getEntry();
    const { category, username, permlink } = match.params;
    const author = username.replace("@", "");

    let reducerFn = updateEntry;

    if (!entry) {
      // let urlPartOne = match.url.split('/')[1];
      // let urlPartTwo = match.url.split('/')[2];
      // let isInvalidUrl = urlPartOne == urlPartTwo;
      // if(isInvalidUrl){
      //     let address: any = match.url.split('/');
      //     address.shift();
      //     address.shift();
      //     address = address.join("/");
      //     history.push('/' + address);
      // } else {
      // The entry isn't in reducer. Fetch it and add to reducer.
      this.stateSet({ loading: true });
      reducerFn = addEntry;
      // }
    } else {
      const updated = moment.utc(entry.updated);
      const now = moment.utc(Date.now());

      const diffMs = now.diff(updated);
      const duration = moment.duration(diffMs);
      if (duration.asSeconds() < 10) {
        // don't re-fetch recently updated post.
        return;
      }
    }

    bridgeApi
      .getPost(author, permlink)
      .then((entry) => {
        if (entry) {
          reducerFn(entry);
          this.stateSet({ loading: false });
        }

        if (isCommunity(category)) {
          this.stateSet({ loading: false });
          return bridgeApi.getCommunity(category, activeUser?.username);
        }

        return null;
      })
      .then((data: Community | null) => {
        if (data) {
          addCommunity(data);
        }
      })
      .catch((e) => {
        let errorMessage = e.jse_info && e.jse_info;
        let arr = [];
        for (let p in errorMessage) arr.push(errorMessage[p]);
        errorMessage = arr.toString().replace(/,/g, "");
        if (errorMessage && errorMessage.length > 0 && errorMessage.includes("was deleted")) {
          this.setState({ postIsDeleted: true, loading: true });
          this.loadDeletedEntry(author, permlink);
        }
      })
      .finally(() => {
        this.stateSet({ isMounted: true });
      });
  };

  getEntry = (): Entry | undefined => {
    const { entries, match } = this.props;
    const { username, permlink } = match.params;
    const author = username.replace("@", "");

    const groupKeys = Object.keys(entries);
    let entry: Entry | undefined = undefined;

    for (const k of groupKeys) {
      entry = entries[k].entries.find((x) => x.author === author && x.permlink === permlink);
      if (entry) {
        if (dmca.some((rx: string) => new RegExp(rx).test(`${entry?.author}/${entry?.permlink}`))) {
          entry.body = "This post is not available due to a copyright/fraudulent claim.";
          entry.title = "";
        }
        break;
      }
    }

    return entry;
  };

  getCommunity = (): Community | null => {
    const { communities, match } = this.props;
    const { category } = match.params;
    return communities.find((x) => x.name === category) || null;
  };

  afterVote = (votes: EntryVote[], estimated: number) => {
    const _entry = this.getEntry()!;
    const { updateEntry } = this.props;

    const { payout } = _entry;
    const newPayout = payout + estimated;
    if (_entry.active_votes) {
      updateEntry({
        ..._entry,
        active_votes: votes,
        payout: newPayout,
        pending_payout_value: String(newPayout)
      });
    } else {
      getPost(_entry.author, _entry.permlink)
        .then((entry) => {
          if (entry) {
            return updateEntry({
              ..._entry,
              active_votes: [...entry.active_votes, ...votes],
              payout: newPayout,
              pending_payout_value: String(newPayout)
            });
          }
          return;
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  replySubmitted = (text: string) => {
    const entry = this.getEntry()!;
    const { activeUser, addReply, updateEntry } = this.props;

    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    const { author: parentAuthor, permlink: parentPermlink } = entry;
    const author = activeUser.username;
    const permlink = createReplyPermlink(entry.author);
    const tags = entry.json_metadata.tags || ["ecency"];

    const jsonMeta = makeJsonMetaDataReply(tags, version);

    this.stateSet({ replying: true });

    comment(author, parentAuthor, parentPermlink, permlink, "", text, jsonMeta, null, true)
      .then(() => {
        const nReply = tempEntry({
          author: activeUser.data as FullAccount,
          permlink,
          parentAuthor,
          parentPermlink,
          title: "",
          body: text,
          tags,
          description: null
        });

        // add new reply to store
        addReply(nReply);

        // remove reply draft
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);
        this.stateSet({ isCommented: true });

        if (entry.children === 0) {
          // Activate discussion section with first comment.
          const nEntry: Entry = {
            ...entry,
            children: 1
          };

          updateEntry(nEntry);
        }
      })
      .catch((e) => {
        error(...formatError(e));
      })
      .finally(() => {
        this.stateSet({ replying: false, isCommented: false });
      });
  };

  resetSelection = () => {
    this.setState({ selection: "" });
  };

  reload = () => {
    this.stateSet({ loading: true });
    this.ensureEntry();
  };

  fetchMutedUsers = () => {
    const { activeUser } = this.props;
    const entry = this.getEntry()!;
    if (activeUser && entry) {
      getFollowing(activeUser.username, "", "ignore", 100).then((r) => {
        if (r) {
          let filterList = r.map((user) => user.following);
          if (!this.state.entryIsMuted) {
            this.setState({ entryIsMuted: filterList.includes(entry.author) });
          }
        }
      });
    }
  };

  getCommentAmpUrl = (url: string) => {
    const index = url.indexOf("#");
    if (index > -1) {
      return url.slice(0, index) + "?amps";
    }
    return url;
  };

  render() {
    const {
      replying,
      showIfNsfw,
      editHistory,
      entryIsMuted,
      edit,
      comment /*commentText,*/,
      isMounted,
      postIsDeleted,
      deletedEntry,
      showProfileBox
    } = this.state;
    const { global, history, match, location } = this.props;

    const entry = this.getEntry();
    if (postIsDeleted) {
      const { username, permlink } = match.params;
      const author = username.replace("@", "");

      return (
        <div>
          <StaticNavbar fullVersionUrl={entry?.url || ""} />
          {deletedEntry && (
            <div className="container overflow-x-hidden">
              <Theme global={this.props.global} />
              <div className="row">
                <div className="col-0 col-lg-2 mt-5">
                  <div className="mb-4 mt-5">
                    <div id="avatar-fixed-container" className="invisible">
                      {!global.isMobile && showProfileBox && (
                        <AuthorInfoCard {...this.props} entry={{ author } as any} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-9">
                  <div className="p-0 p-lg-5 the-entry">
                    <div className="p-3 bg-danger rounded text-white my-0 mb-4 my-lg-5">
                      {_t("entry.deleted-content-warning")}
                      <u onClick={this.toggleEditHistory} className="text-primary pointer">
                        {_t("points.history")}
                      </u>{" "}
                      {_t("g.logs")}.
                    </div>
                    <div className="cross-post">
                      <h1 className="entry-title">{deletedEntry!.title}</h1>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: renderPostBody(deletedEntry!.body) }} />
                    {editHistory && (
                      <EditHistory
                        entry={{ author, permlink } as any}
                        onHide={this.toggleEditHistory}
                      />
                    )}
                    <div className="mt-3">
                      {SimilarEntries({
                        ...this.props,
                        entry: {
                          permlink,
                          author,
                          json_metadata: { tags: deletedEntry.tags }
                        } as any,
                        display: ""
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (!entry) {
      return NotFound({ ...this.props });
    }

    let setRef = (el: HTMLDivElement) => {
      this.viewElement = el;
    };

    const originalEntry = entry.original_entry || null;

    const community = this.getCommunity();

    const reputation = accountReputation(entry.author_reputation);
    const published = moment(parseDate(entry.created));
    const modified = moment(parseDate(entry.updated));

    // Sometimes tag list comes with duplicate items
    const tags = entry.json_metadata.tags && [...new Set(entry.json_metadata.tags)];
    // If category is not present in tags then add
    if (entry.category && tags && tags[0] !== entry.category) {
      tags.splice(0, 0, entry.category);
    }
    const app = appName(entry.json_metadata.app);
    const appShort = app.split("/")[0].split(" ")[0];

    const { activeUser } = this.props;

    const isComment = !!entry.parent_author;
    const ownEntry = activeUser && activeUser.username === entry.author;
    const isHidden = entry?.net_rshares < -7000000000 && entry?.active_votes.length > 3; // 1000 HPstat
    const isMuted = entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation >= 0;
    const isLowReputation =
      entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation < 0;
    const mightContainMutedComments = activeUser && entryIsMuted && !isComment && !ownEntry;

    //  Meta config
    const url = entryCanonical(entry, true) || "";

    const nsfw = entry.json_metadata.tags && entry.json_metadata.tags.includes("nsfw");

    const metaProps = {
      title: `${truncate(entry.title, 67)}`,
      description: `${truncate(postBodySummary(entry.body, 210), 140)} by @${entry.author}`,
      url: entry.url,
      canonical: url,
      image:
        catchPostImage(entry, 1200, 1000, global.canUseWebp ? "webp" : "match") ||
        `https://ecency.com/og.jpg`,
      published: published.toISOString(),
      modified: modified.toISOString(),
      tag: tags ? (isCommunity(tags[0]) ? tags[1] : tags[0]) : "",
      keywords: tags && tags.join(", ")
    };
    let containerClasses = global.isElectron
      ? "app-content entry-page mt-0 pt-6"
      : "app-content entry-page";

    return (
      <>
        <Meta {...metaProps} />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        <MdHandler global={this.props.global} history={this.props.history} />
        <StaticNavbar fullVersionUrl={entry?.url || ""} />
        <div className={containerClasses}>
          <div className="the-entry">
            {originalEntry && (
              <div className="cross-post">
                <div className="cross-post-info">
                  {_t("entry.cross-post-by")}
                  {ProfileLink({
                    ...this.props,
                    username: entry.author,
                    children: (
                      <div className="cross-post-author">
                        <UserAvatar username={entry.author} size="medium" />
                        {`@${entry.author}`}
                      </div>
                    )
                  })}
                </div>
                <div className="cross-post-community">
                  {Tag({
                    ...this.props,
                    tag: entry.category,
                    type: "link",
                    children: <div className="community-link">{entry.community_title}</div>
                  })}
                  {_t("entry.cross-post-community")}
                </div>
                <div className="cross-post-message">
                  {'"'}
                  {crossPostMessage(entry.body)}
                  {'"'}
                </div>
              </div>
            )}
            <div itemScope={true} itemType="http://schema.org/Article">
              <meta itemProp="datePublished" content={`${published.format("YYYY-MM-DD")}`} />
              <meta itemProp="dateModified" content={`${modified.format("YYYY-MM-DD")}`} />
              <meta
                itemProp="mainEntityOfPage"
                content={`https://ecency.com/@${entry.author}/posts`}
              />
              <span itemProp="publisher" itemScope={true} itemType="http://schema.org/Organization">
                <span itemProp="logo" itemScope={true} itemType="https://schema.org/ImageObject">
                  <meta
                    itemProp="url"
                    content={`https://images.ecency.com/${global.canUseWebp ? "webp/" : ""}u/${
                      entry.community ? entry.community : "hive-125125"
                    }/avatar/medium`}
                  />
                </span>
                <meta
                  itemProp="url"
                  content={`https://ecency.com/created/${
                    entry.community ? entry.community : "hive-125125"
                  }`}
                />
                <meta
                  itemProp="name"
                  content={`${entry.community ? entry.community_title : "Ecency news"}`}
                />
              </span>
              <meta itemProp="image" content={metaProps.image} />
              <meta itemProp="headline name" content={entry.title.substring(0, 110)} />
              {(() => {
                if (nsfw && !showIfNsfw && !global.nsfw) {
                  return (
                    <div className="nsfw-warning">
                      <div className="nsfw-title">
                        <span className="nsfw-badge">NSFW</span>
                      </div>
                      <div className="nsfw-body">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            this.stateSet({ showIfNsfw: true });
                          }}
                        >
                          {_t("nsfw.reveal")}
                        </a>{" "}
                        {_t("g.or").toLowerCase()}{" "}
                        {activeUser && (
                          <>
                            {_t("nsfw.settings-1")}{" "}
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                history.push(`/@${activeUser.username}/settings`);
                              }}
                            >
                              {_t("nsfw.settings-2")}
                            </a>
                            {"."}
                          </>
                        )}
                        {!activeUser && (
                          <>
                            <Tsx k="nsfw.signup">
                              <span />
                            </Tsx>
                            {"."}
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <>
                    {(() => {
                      // Cross post body
                      if (originalEntry) {
                        const published = moment(parseDate(originalEntry.created));
                        const reputation = accountReputation(originalEntry.author_reputation);
                        const renderedBody = {
                          __html: renderPostBody(originalEntry.body, false, global.canUseWebp)
                        };

                        return (
                          <>
                            <div className="entry-header">
                              <h1 className="entry-title">{originalEntry.title}</h1>
                              <div className="entry-info">
                                {ProfileLink({
                                  ...this.props,
                                  username: originalEntry.author,
                                  children: (
                                    <div className="author-avatar">
                                      <UserAvatar username={originalEntry.author} size="medium" />
                                    </div>
                                  )
                                })}

                                <div className="entry-info-inner">
                                  <div className="info-line-1">
                                    {ProfileLink({
                                      ...this.props,
                                      username: originalEntry.author,
                                      children: (
                                        <div className="author notranslate">
                                          <span className="author-name">
                                            <span
                                              itemProp="author"
                                              itemScope={true}
                                              itemType="http://schema.org/Person"
                                            >
                                              <span itemProp="name">{originalEntry.author}</span>
                                              <meta
                                                itemProp="url"
                                                content={`https://ecency.com/@${originalEntry.author}`}
                                              />
                                            </span>
                                          </span>
                                          <span
                                            className="author-reputation"
                                            title={_t("entry.author-reputation")}
                                          >
                                            {reputation}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>

                                  <div className="info-line-2">
                                    <span className="date" title={published.format("LLLL")}>
                                      {published.fromNow()}
                                    </span>
                                    <span className="separator" />
                                    <div className="entry-tag">
                                      <span className="in-tag">{_t("entry.community-in")}</span>
                                      {Tag({
                                        ...this.props,
                                        tag: originalEntry.category,
                                        type: "link",
                                        children: (
                                          <div className="tag-name">
                                            {originalEntry.community
                                              ? originalEntry.community_title
                                              : `#${originalEntry.category}`}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <span className="flex-spacer" />
                              </div>
                            </div>
                            <div
                              itemProp="articleBody"
                              className="entry-body markdown-view user-selectable"
                              dangerouslySetInnerHTML={renderedBody}
                              onMouseUp={(e) => {}}
                            />
                          </>
                        );
                      }

                      const _entry_body = replaceLinkIdToDataId(entry.body);
                      let renderedBody = {
                        __html: renderPostBody(
                          isComment ? (comment.length > 0 ? comment : _entry_body) : _entry_body,
                          false,
                          global.canUseWebp
                        )
                      };
                      const ctitle = entry.community ? entry.community_title : "";
                      let extraItems =
                        ownEntry && isComment
                          ? [
                              {
                                label: _t("g.edit"),
                                onClick: this.toggleEdit,
                                icon: pencilOutlineSvg
                              }
                            ]
                          : [];
                      if (
                        !(entry.children > 0 || entry.net_rshares > 0 || entry.is_paidout) &&
                        ownEntry &&
                        isComment
                      ) {
                        extraItems = [
                          ...extraItems,
                          {
                            label: "",
                            onClick: () => {},
                            icon: entryDeleteBtn({
                              ...this.props,
                              entry,
                              setDeleteInProgress: (value) => this.setState({ loading: value }),
                              onSuccess: this.deleted,
                              children: (
                                <a title={_t("g.delete")} className="edit-btn">
                                  {deleteForeverSvg} {_t("g.delete")}
                                </a>
                              )
                            })
                          }
                        ];
                      }

                      return (
                        <>
                          <div className="entry-header">
                            {isMuted && (
                              <div className="hidden-warning">
                                <span>
                                  <Tsx k="entry.muted-warning" args={{ community: ctitle }}>
                                    <span />
                                  </Tsx>
                                </span>
                              </div>
                            )}

                            {isHidden && (
                              <div className="hidden-warning">
                                <span>{_t("entry.hidden-warning")}</span>
                              </div>
                            )}

                            {isLowReputation && (
                              <div className="hidden-warning">
                                <span>{_t("entry.lowrep-warning")}</span>
                              </div>
                            )}

                            {mightContainMutedComments && (
                              <div className="hidden-warning">
                                <span>{_t("entry.comments-hidden")}</span>
                              </div>
                            )}

                            {isComment && (
                              <div className="comment-entry-header">
                                <div className="comment-entry-header-title">RE: {entry.title}</div>
                                <div className="comment-entry-header-info">
                                  {_t("entry.comment-entry-title")}
                                </div>
                                <p className="comment-entry-root-title">{entry.title}</p>
                                <ul className="comment-entry-opts">
                                  <li>
                                    <Link to={this.getCommentAmpUrl(entry.url)}>
                                      {_t("entry.comment-entry-go-root")}
                                    </Link>
                                  </li>
                                  {entry.depth > 1 && (
                                    <li>
                                      <Link
                                        to={
                                          makeEntryPath(
                                            entry.category,
                                            entry.parent_author!,
                                            entry.parent_permlink!
                                          ) + "?amps"
                                        }
                                      >
                                        {_t("entry.comment-entry-go-parent")}
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            <h1 className="entry-title">{entry.title}</h1>
                            <div className="entry-info">
                              {ProfileLink({
                                ...this.props,
                                username: entry.author,
                                children: (
                                  <div className="author-avatar">
                                    <UserAvatar username={entry.author} size="medium" />
                                  </div>
                                )
                              })}

                              <div className="entry-info-inner">
                                <div className="info-line-1">
                                  {ProfileLink({
                                    ...this.props,
                                    username: entry.author,
                                    children: (
                                      <div className="author notranslate">
                                        <span className="author-name">
                                          <span
                                            itemProp="author"
                                            itemScope={true}
                                            itemType="http://schema.org/Person"
                                          >
                                            <span itemProp="name">{entry.author}</span>
                                            <meta
                                              itemProp="url"
                                              content={`https://ecency.com/@${entry.author}`}
                                            />
                                          </span>
                                        </span>
                                        <span
                                          className="author-reputation"
                                          title={_t("entry.author-reputation")}
                                        >
                                          {reputation}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className="info-line-2">
                                  <span className="date" title={published.format("LLLL")}>
                                    {published.fromNow()}
                                  </span>
                                  <span className="separator" />
                                  <div className="entry-tag">
                                    <span className="in-tag">{_t("entry.community-in")}</span>
                                    {Tag({
                                      ...this.props,
                                      tag: entry.category,
                                      type: "link",
                                      children: (
                                        <div className="tag-name">
                                          {entry.community
                                            ? entry.community_title
                                            : `#${entry.category}`}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                              <span className="flex-spacer" />
                            </div>
                          </div>

                          {!edit ? (
                            <>
                              <SelectionPopover
                                postUrl={entry.url}
                                onQuotesClick={(text: string) => {
                                  this.setState({ selection: `>${text}\n\n` });
                                  (this.commentInput! as any).current!.focus();
                                }}
                              >
                                <div
                                  itemProp="articleBody"
                                  className="entry-body markdown-view user-selectable"
                                  dangerouslySetInnerHTML={renderedBody}
                                />
                              </SelectionPopover>
                            </>
                          ) : (
                            Comment({
                              ...this.props,
                              defText: entry.body,
                              submitText: _t("g.update"),
                              cancellable: true,
                              onSubmit: this.updateReply,
                              onCancel: this.toggleEdit,
                              inProgress: replying,
                              autoFocus: true,
                              inputRef: this.commentInput,
                              entry: entry
                            })
                          )}

                          {/* <SelectionPopover postUrl={entry.url} onQuotesClick={(text:string) => {this.setState({selection: `>${text}\n\n`}); (this.commentInput! as any).current!.focus();}}>
                                          <div
                                              itemProp="articleBody"
                                              className="entry-body markdown-view user-selectable"
                                              dangerouslySetInnerHTML={renderedBody}
                                          />
                                      </SelectionPopover> */}
                        </>
                      );
                    })()}

                    {!global.isMobile && (
                      <div id="avatar-fixed-container" className="invisible">
                        {showProfileBox && <AuthorInfoCard {...this.props} entry={entry} />}
                      </div>
                    )}

                    <div className="entry-footer">
                      <div className="entry-tags">
                        {tags &&
                          tags.map((t, i) => {
                            if (typeof t === "string") {
                              if (
                                entry.community &&
                                entry.community_title &&
                                t === entry.community
                              ) {
                                return (
                                  <Fragment key={t + i}>
                                    {Tag({
                                      ...this.props,
                                      tag: {
                                        name: entry.community,
                                        title: entry.community_title
                                      },
                                      type: "link",
                                      children: <div className="entry-tag">{t}</div>
                                    })}
                                  </Fragment>
                                );
                              }

                              return (
                                <Fragment key={t + i}>
                                  {Tag({
                                    ...this.props,
                                    tag: t.trim(),
                                    type: "link",
                                    children: <div className="entry-tag">{t}</div>
                                  })}
                                </Fragment>
                              );
                            } else {
                              return;
                            }
                          })}
                      </div>
                      <div className="entry-info">
                        <div className="date" title={published.format("LLLL")}>
                          {published.fromNow()}
                        </div>
                        <span className="separator" />
                        {ProfileLink({
                          ...this.props,
                          username: entry.author,
                          children: (
                            <div className="author notranslate">
                              <span className="author-name">{entry.author}</span>
                              <span
                                className="author-reputation"
                                title={_t("entry.author-reputation")}
                              >
                                {reputation}
                              </span>
                            </div>
                          )
                        })}
                        {app && (
                          <>
                            <span className="separator" />
                            <div className="app" title={app}>
                              <Tsx k="entry.via-app" args={{ app: appShort }}>
                                <a href="/faq#source-label" />
                              </Tsx>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {originalEntry && (
                      <div className="browse-original">
                        {EntryLink({
                          ...this.props,
                          entry: originalEntry,
                          children: <a className="btn btn-primary">{_t("entry.browse-original")}</a>
                        })}
                      </div>
                    )}

                    {!originalEntry &&
                      !isComment &&
                      SimilarEntries({
                        ...this.props,
                        entry,
                        display: !activeUser ? "" : "d-none"
                      })}

                    {!originalEntry &&
                      !isComment &&
                      SimilarEntries({
                        ...this.props,
                        entry,
                        display: !activeUser ? "d-none" : ""
                      })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryPage as any);
