import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps } from "../common";
import { Props } from "./props.type";
import { LoadingScreen } from "./loading-screen";
import { DeletedPostScreen } from "./deleted-post-screen";
import NotFound from "../../components/404";
import { Entry, EntryVote } from "../../store/entries/types";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import Feedback, { error } from "../../components/feedback";
import MdHandler from "../../components/md-handler";
import truncate from "../../util/truncate";
import { catchPostImage, postBodySummary, renderPostBody } from "@ecency/render-helper";
import entryCanonical from "../../helper/entry-canonical";
import moment from "moment/moment";
import parseDate from "../../helper/parse-date";
import isCommunity from "../../helper/is-community";
import defaults from "../../constants/defaults.json";
import NavBarElectron from "../../../desktop/app/components/navbar";
import NavBar from "../../components/navbar";
import EditHistory from "../../components/edit-history";
import EntryBodyExtra from "../../components/entry-body-extra";
import ReadTime from "../../components/entry-read-time";
import { _t } from "../../i18n";
import ProfileLink from "../../components/profile-link";
import Tag from "../../components/tag";
import { crossPostMessage } from "../../helper/cross-post";
import { Tsx } from "../../i18n/helper";
import accountReputation from "../../helper/account-reputation";
import EntryMenu from "../../components/entry-menu";
import replaceLinkIdToDataId from "../../util/replace-link-id-to-data-id";
import { deleteForeverSvg, pencilOutlineSvg, rawContentSvg } from "../../img/svg";
import entryDeleteBtn from "../../components/entry-delete-btn";
import { Link } from "react-router-dom";
import EntryLink, { makePath as makeEntryPath } from "../../components/entry-link";
import { SelectionPopover } from "../../components/selection-popover";
import AuthorInfoCard from "../../components/author-info-card";
import Tooltip from "../../components/tooltip";
import CommentEngagement from "../../components/comment-engagement";
import { classNameObject } from "../../helper/class-name-object";
import UserAvatar from "../../components/user-avatar";
import BookmarkBtn from "../../components/bookmark-btn";
import * as ls from "../../util/local-storage";
import Comment from "../../components/comment";
import SimilarEntries from "../../components/similar-entries";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../helper/posting";
import { comment as commentApi, formatError } from "../../api/operations";
import * as ss from "../../util/session-storage";
import { version } from "../../../../package.json";
import appName from "../../helper/app-name";
import EntryVoteBtn from "../../components/entry-vote-btn/index";
import EntryPayout from "../../components/entry-payout/index";
import EntryVotes from "../../components/entry-votes";
import Discussion from "../../components/discussion";
import EntryReblogBtn from "../../components/entry-reblog-btn/index";
import EntryTipBtn from "../../components/entry-tip-btn";
import { BaseAccount, FullAccount } from "../../store/accounts/types";
import tempEntry from "../../helper/temp-entry";
import {
  EntriesCacheContext,
  useCommunityCache,
  useDeletedEntryCache,
  useEntryCache,
  useEntryReFetch
} from "../../core";
import "./_index.scss";
import { getFollowing } from "../../api/hive";
import { useDistanceDetector } from "./distance-detector";
import usePrevious from "react-use/lib/usePrevious";

const EntryComponent = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showIfNsfw, setShowIfNsfw] = useState(false);
  const [editHistory, setEditHistory] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommented, setIsCommented] = useState(false);
  const [showProfileBox, setShowProfileBox] = useState(false);
  const [showWordCount, setShowWordCount] = useState(false);
  const [isRawContent, setIsRawContent] = useState(false);
  const [entryIsMuted, setEntryIsMuted] = useState(false);
  const [selection, setSelection] = useState("");
  const [postIsDeleted, setPostIsDeleted] = useState(false);
  const previousActiveUser = usePrevious(props.activeUser);

  // Entry state
  const [published, setPublished] = useState(moment());
  const [modified, setModified] = useState(moment());
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [keywords, setKeywords] = useState("");
  const [originalEntry, setOriginalEntry] = useState<Entry | undefined>();
  const [nsfw, setNsfw] = useState(false);
  const [isComment, setIsComment] = useState(false);
  const [isOwnEntry, setIsOwnEntry] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isLowReputation, setIsLowReputation] = useState(false);
  const [mightContainMutedComments, setMightContainMutedComments] = useState(false);
  const [reputation, setReputation] = useState(0);
  const [image, setImage] = useState("");
  const [app, setApp] = useState("");
  const [appShort, setAppShort] = useState("");

  const commentsInputRef = useRef(null);
  const entryControlsRef = useRef<HTMLDivElement | null>(null);

  const { updateVotes, updateCache } = useContext(EntriesCacheContext);
  const { data: entry, error: entryError } = useEntryCache(
    props.match.params.category,
    props.match.params.username.replace("@", ""),
    props.match.params.permlink
  );
  const { mutateAsync: reFetch } = useEntryReFetch(entry);
  const { data: community } = useCommunityCache(props.match.params.category);
  const {
    data: deletedEntry,
    refetch: fetchDeletedEntry,
    isLoading: deleteEntryLoading
  } = useDeletedEntryCache(
    props.match.params.username.replace("@", ""),
    props.match.params.permlink
  );

  useDistanceDetector(
    entryControlsRef,
    showProfileBox,
    showWordCount,
    setShowProfileBox,
    setShowWordCount
  );

  useEffect(() => {
    setLoading(true);

    if (props.history.location.search.includes("?referral")) {
      const userName = props.history.location.search.split("=")[1];
      ls.set("referral", userName);
    }
    fetchMutedUsers();

    const queryParams = new URLSearchParams(location.search);
    if (props.global.usePrivate && queryParams.has("history")) {
      setEditHistory(!editHistory);
    } else if (props.global.usePrivate && queryParams.has("raw")) {
      setIsRawContent(true);
    }

    setSelection(ss.get(`reply_draft_${entry?.author}_${entry?.permlink}`)?.trim() ?? "");
  }, []);

  useEffect(() => {
    setLoading(true);
  }, [props.match.params.username, props.match.params.permlink, props.match.params.category]);

  useEffect(() => {
    if (entry) {
      setPublished(moment(parseDate(entry.created)));
      setModified(moment(parseDate(entry.updated)));
      setOriginalEntry(entry.original_entry);
      setNsfw(entry.json_metadata.tags?.includes("nsfw") ?? false);
      setIsComment(!!entry.parent_author);
      setIsOwnEntry(props.activeUser?.username === entry.author);
      setIsMuted(!!entry.stats?.gray && entry.net_rshares >= 0 && entry.author_reputation >= 0);
      setIsHidden(entry?.net_rshares < -7000000000 && entry?.active_votes.length > 3); // 1000 HP
      setIsLowReputation(
        !!entry.stats?.gray && entry.net_rshares >= 0 && entry.author_reputation < 0
      );
      setMightContainMutedComments(!!props.activeUser && entryIsMuted && !isComment && !isOwnEntry);
      setReputation(accountReputation(entry.author_reputation));
      setImage(catchPostImage(entry, 600, 500, props.global.canUseWebp ? "webp" : "match"));

      const _app = appName(entry.json_metadata.app);
      setApp(_app);
      setAppShort(_app.split("/")[0].split(" ")[0]);

      const tags = (entry.json_metadata.tags && [...new Set(entry.json_metadata.tags)])?.filter(
        (t) => !!t
      );

      if (tags && tags.length > 0) {
        setTags(tags);
        setTag(isCommunity(tags[0]) ? tags[1] : entry.category);
        setKeywords(tags.join(", "));
      } else {
        setTags([entry.category]);
        setTag(entry.category);
        setKeywords(entry.category);
      }

      setLoading(false);
    }
  }, [entry]);

  useEffect(() => {
    if (entry || deletedEntry) {
      setLoading(false);
    }
  }, [entry, deletedEntry]);

  useEffect(() => {
    if (entryError) {
      let errorMessage = (entryError as any).jse_info && (entryError as any).jse_info;
      let arr = [];
      for (let p in errorMessage) arr.push(errorMessage[p]);
      errorMessage = arr.toString().replace(/,/g, "");
      if (errorMessage && errorMessage.length > 0 && errorMessage.includes("was deleted")) {
        setPostIsDeleted(true);
        fetchDeletedEntry();
      } else {
        setLoading(false);
      }
    }
  }, [entryError]);

  useEffect(() => {
    if (isRawContent) {
      props.history.push(`${props.history.location.pathname}?raw`);
    } else {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.has("raw")) {
        queryParams.delete("raw");
        props.history.replace({
          search: queryParams.toString()
        });
      }
    }
  }, [isRawContent]);

  useEffect(() => {
    if (props.activeUser !== previousActiveUser) {
      setEdit(false);
    }
  }, [props.activeUser]);

  const reload = () => reFetch();

  const fetchMutedUsers = async () => {
    if (props.activeUser && entry) {
      const r = await getFollowing(props.activeUser.username, "", "ignore", 100);
      if (r && !entryIsMuted) {
        setEntryIsMuted(r.map((user) => user.following).includes(entry.author));
      }
    }
  };

  const deleted = async () => {
    const { deleteReply } = props;
    entry && deleteReply(entry);
    ls.set(`deletedComment`, entry?.post_id);
    props.history?.goBack();
  };

  const updateReply = async (text: string) => {
    const { activeUser, updateReply } = props;

    if (entry) {
      const { permlink, parent_author: parentAuthor, parent_permlink: parentPermlink } = entry;
      const jsonMeta = makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version);

      setReplying(true);

      try {
        await commentApi(
          activeUser?.username!,
          parentAuthor!,
          parentPermlink!,
          permlink,
          "",
          text,
          jsonMeta,
          null
        );

        setComment(text);
        setIsCommented(true);
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);
        updateReply({
          ...entry,
          body: text
        }); // update store
        setEdit(false);
        reload();
      } catch (e) {
        error(...formatError(e));
      } finally {
        setReplying(false);
        setIsCommented(false);
      }
    }
  };

  const afterVote = async (votes: EntryVote[], estimated: number) => {
    if (entry.active_votes) {
      updateVotes(entry, votes, entry.payout + estimated);
    } else {
      await reFetch();
    }
  };

  const replySubmitted = async (text: string) => {
    const { activeUser, addReply, updateEntry } = props;

    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    const { author: parentAuthor, permlink: parentPermlink } = entry!!;
    const author = activeUser.username;
    const permlink = createReplyPermlink(entry!.author);
    const tags = entry!.json_metadata.tags || ["ecency"];

    const jsonMeta = makeJsonMetaDataReply(tags, version);

    setReplying(true);
    try {
      await commentApi(
        author,
        parentAuthor,
        parentPermlink,
        permlink,
        "",
        text,
        jsonMeta,
        null,
        true
      );

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
      ss.remove(`reply_draft_${entry!.author}_${entry!.permlink}`);
      setIsCommented(true);

      if (entry!.children === 0) {
        // Activate discussion section with first comment.
        updateCache([
          {
            ...entry!!,
            children: 1
          }
        ]);
      }
    } catch (e) {
      error(...formatError(e));
    } finally {
      setReplying(false);
      setIsCommented(false);
    }
  };

  const notificationsCount =
    props.notifications.unread > 0 ? `(${props.notifications.unread}) ` : "";

  return loading || deleteEntryLoading ? (
    <LoadingScreen {...props} reload={reload} loading={loading} />
  ) : postIsDeleted && deletedEntry ? (
    <DeletedPostScreen
      {...props}
      reload={reload}
      loading={loading}
      showProfileBox={showProfileBox}
      editHistory={editHistory}
      toggleEditHistory={() => setEditHistory(!editHistory)}
      deletedEntry={deletedEntry}
    />
  ) : !entry ? (
    <NotFound history={props.history} global={props.global} />
  ) : (
    <>
      <Meta
        title={`${notificationsCount}${truncate(entry.title, 67)}`}
        description={`${
          entry.json_metadata?.description
            ? entry.json_metadata?.description
            : truncate(postBodySummary(entry.body, 210), 140)
        } by @${entry.author}`}
        url={entry.url}
        canonical={entryCanonical(entry) ?? ""}
        image={catchPostImage(entry, 600, 500, props.global.canUseWebp ? "webp" : "match")}
        published={published.toISOString()}
        modified={modified.toISOString()}
        tag={tag}
        keywords={keywords}
        amp={`${defaults.base}${entry.url}?amps`}
      />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      <MdHandler global={props.global} history={props.history} />
      {props.global.isElectron ? (
        NavBarElectron({
          ...props,
          reloadFn: reload,
          reloading: loading
        })
      ) : (
        <NavBar history={props.history} match={props.match} />
      )}
      <div
        className={classNameObject({
          "app-content entry-page": true,
          "mt-0 pt-6": props.global.isElectron
        })}
      >
        <ReadTime global={props.global} entry={entry} isVisible={showWordCount} />

        <div className="the-entry">
          {originalEntry && (
            <div className="cross-post">
              <div className="cross-post-info">
                {_t("entry.cross-post-by")}
                {ProfileLink({
                  ...props,
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
                  ...props,
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
          <span itemScope={true} itemType="http://schema.org/Article">
            {(() => {
              if (nsfw && !showIfNsfw && !props.global.nsfw) {
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
                          setShowIfNsfw(true);
                        }}
                      >
                        {_t("nsfw.reveal")}
                      </a>{" "}
                      {_t("g.or").toLowerCase()}{" "}
                      {props.activeUser && (
                        <>
                          {_t("nsfw.settings-1")}{" "}
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              props.history.push(`/@${props.activeUser?.username}/settings`);
                            }}
                          >
                            {_t("nsfw.settings-2")}
                          </a>
                          {"."}
                        </>
                      )}
                      {!props.activeUser && (
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
                        __html: renderPostBody(originalEntry.body, false, props.global.canUseWebp)
                      };

                      return (
                        <>
                          <div className="entry-header">
                            <h1 className="entry-title">{originalEntry.title}</h1>
                            <div className="entry-info">
                              {ProfileLink({
                                ...props,
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
                                    ...props,
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
                                  <span className="separator circle-separator" />
                                  <div className="entry-tag">
                                    <span className="in-tag">{_t("entry.community-in")}</span>
                                    {Tag({
                                      ...props,
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
                              {props.global.usePrivate &&
                                BookmarkBtn({
                                  ...props,
                                  entry: originalEntry
                                })}
                              <EntryMenu
                                history={props.history}
                                entry={entry}
                                separatedSharing={true}
                              />
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
                        props.global.canUseWebp
                      )
                    };
                    const ctitle = entry.community ? entry.community_title : "";
                    let extraItems =
                      isOwnEntry && isComment
                        ? [
                            {
                              label: _t("g.edit"),
                              onClick: () => setEdit(!edit),
                              icon: pencilOutlineSvg
                            }
                          ]
                        : [];
                    if (
                      !(entry.children > 0 || entry.net_rshares > 0 || entry.is_paidout) &&
                      isOwnEntry &&
                      isComment
                    ) {
                      extraItems = [
                        ...extraItems,
                        {
                          label: "",
                          onClick: () => {},
                          icon: entryDeleteBtn({
                            ...props,
                            entry,
                            setDeleteInProgress: (value) => () => setLoading(true),
                            onSuccess: deleted,
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
                                  <Link to={entry.url}>{_t("entry.comment-entry-go-root")}</Link>
                                </li>
                                {entry.depth > 1 && (
                                  <li>
                                    <Link
                                      to={makeEntryPath(
                                        entry.category,
                                        entry.parent_author!,
                                        entry.parent_permlink!
                                      )}
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
                              ...props,
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
                                  ...props,
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
                                <span className="separator circle-separator" />
                                <div className="entry-tag">
                                  <span className="in-tag">{_t("entry.community-in")}</span>
                                  {Tag({
                                    ...props,
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

                            <ReadTime global={props.global} entry={entry} toolTip={true} />

                            {!isComment &&
                              props.global.usePrivate &&
                              BookmarkBtn({
                                ...props,
                                entry
                              })}
                            {!isComment && (
                              <EntryMenu
                                history={props.history}
                                entry={entry}
                                separatedSharing={true}
                                extraMenuItems={extraItems}
                              />
                            )}
                          </div>
                        </div>
                        <meta itemProp="headline name" content={entry.title} />
                        {!isRawContent ? (
                          <>
                            {!edit ? (
                              <>
                                <SelectionPopover
                                  postUrl={entry.url}
                                  onQuotesClick={(text: string) => {
                                    setSelection(`>${text}\n\n`);
                                    (commentsInputRef! as any).current!.focus();
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
                                ...props,
                                defText: entry.body,
                                submitText: _t("g.update"),
                                cancellable: true,
                                onSubmit: updateReply,
                                onCancel: () => setEdit(!edit),
                                inProgress: replying,
                                autoFocus: true,
                                inputRef: commentsInputRef,
                                entry
                              })
                            )}
                          </>
                        ) : (
                          <pre className="entry-body markdown-view user-selectable">
                            {entry.body}
                          </pre>
                        )}
                        <meta itemProp="image" content={image} />
                      </>
                    );
                  })()}

                  {!props.global.isMobile && (
                    <div id="avatar-fixed-container" className="invisible">
                      {showProfileBox && <AuthorInfoCard {...props} entry={entry} />}
                    </div>
                  )}

                  <div className="entry-footer">
                    <div className="entry-tags">
                      {tags &&
                        tags.map((t, i) => {
                          if (typeof t === "string") {
                            if (entry.community && entry.community_title && t === entry.community) {
                              return (
                                <Fragment key={t + i}>
                                  {Tag({
                                    ...props,
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
                                  ...props,
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
                      <span className="separator circle-separator" />
                      {ProfileLink({
                        ...props,
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
                          <span className="separator circle-separator" />
                          <span
                            itemProp="publisher"
                            itemScope={true}
                            itemType="http://schema.org/Person"
                          >
                            <meta itemProp="name" content={entry.author} />
                          </span>
                          <div className="app" title={app}>
                            <Tsx k="entry.via-app" args={{ app: appShort }}>
                              <a href="/faq#source-label" />
                            </Tsx>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="entry-controls" ref={entryControlsRef}>
                      <EntryVoteBtn isPostSlider={true} afterVote={afterVote} entry={entry} />
                      <EntryPayout entry={entry} />
                      <EntryVotes entry={entry} history={props.history} />
                      <EntryTipBtn
                        entry={entry}
                        account={props.account as BaseAccount}
                        updateWalletValues={props.updateWalletValues}
                      />
                      {!isOwnEntry && <EntryReblogBtn entry={entry} />}
                      <span className="flex-spacer" />
                      <Tooltip content={_t("entry.raw")}>
                        <span
                          className="raw-content-icon"
                          onClick={() => setIsRawContent(!isRawContent)}
                        >
                          {rawContentSvg}
                        </span>
                      </Tooltip>
                      {BookmarkBtn({
                        ...props,
                        entry
                      })}
                      <EntryMenu
                        history={props.history}
                        entry={entry}
                        alignBottom={true}
                        separatedSharing={true}
                        toggleEdit={() => setEdit(!edit)}
                      />
                    </div>
                  </div>

                  {originalEntry && (
                    <div className="browse-original">
                      {EntryLink({
                        ...props,
                        entry: originalEntry,
                        children: <a className="btn btn-primary">{_t("entry.browse-original")}</a>
                      })}
                    </div>
                  )}

                  {!originalEntry &&
                    !isComment &&
                    SimilarEntries({
                      ...props,
                      entry,
                      display: !props.activeUser ? "" : "d-none"
                    })}

                  {Comment({
                    ...props,
                    defText: selection,
                    submitText: _t("g.reply"),
                    resetSelection: () => setSelection(""),
                    onSubmit: replySubmitted,
                    inProgress: replying,
                    isCommented: isCommented,
                    inputRef: commentsInputRef,
                    entry: entry
                  })}

                  {!originalEntry &&
                    !isComment &&
                    SimilarEntries({
                      ...props,
                      entry,
                      display: !props.activeUser ? "d-none" : ""
                    })}

                  {props.activeUser && entry.children === 0 && <CommentEngagement />}

                  <Discussion
                    {...{
                      ...props,
                      parent: entry,
                      community,
                      hideControls: false,
                      isRawContent: isRawContent
                    }}
                  />
                </>
              );
            })()}
          </span>
        </div>
      </div>
      {editHistory && <EditHistory entry={entry} onHide={() => setEditHistory(!editHistory)} />}
      <EntryBodyExtra entry={entry} global={props.global} />
    </>
  );
};

export const EntryScreen = connect(pageMapStateToProps, pageMapDispatchToProps)(EntryComponent);
