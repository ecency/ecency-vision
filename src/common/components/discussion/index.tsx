import React, { Component, useEffect, useState } from "react";

import { History, Location } from "history";

import { Button } from "react-bootstrap";

import defaults from "../../constants/defaults.json";

import { renderPostBody, setProxyBase } from "@ecency/render-helper";
import { Entry, EntryVote } from "../../store/entries/types";
import { Account, FullAccount } from "../../store/accounts/types";
import { Community, ROLES } from "../../store/communities/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Discussion as DiscussionType, SortOrder } from "../../store/discussion/types";
import { ToggleType, UI } from "../../store/ui/types";
import ProfileLink from "../profile-link";
import EntryLink from "../entry-link";
import UserAvatar from "../user-avatar";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import LinearProgress from "../linear-progress";
import Comment from "../comment";
import EntryDeleteBtn from "../entry-delete-btn";
import MuteBtn from "../mute-btn";
import LoginRequired from "../login-required";

import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";

import { _t } from "../../i18n";

import { comment, formatError } from "../../api/operations";

import * as ss from "../../util/session-storage";

import { createReplyPermlink, makeJsonMetaDataReply } from "../../helper/posting";
import tempEntry from "../../helper/temp-entry";

import { error } from "../feedback";

import _c from "../../util/fix-class-names";

import { commentSvg, deleteForeverSvg, dotsHorizontal, pencilOutlineSvg } from "../../img/svg";

import { version } from "../../../../package.json";
import { getFollowing } from "../../api/hive";

import { Tsx } from "../../i18n/helper";
import MyDropDown from "../dropdown";
import { ProfilePopover } from "../profile-popover";
import "./_index.scss";
import { FormControl } from "@ui/input";

setProxyBase(defaults.imageServer);

interface ItemBodyProps {
  entry: Entry;
  global: Global;
  isRawContent: boolean;
}

export class ItemBody extends Component<ItemBodyProps> {
  shouldComponentUpdate(nextProps: Readonly<ItemBodyProps>): boolean {
    return this.props.entry.body !== nextProps.entry.body;
  }

  render() {
    const { entry, global } = this.props;

    const renderedBody = { __html: renderPostBody(entry.body, false, global.canUseWebp) };

    return (
      <>
        {!this.props.isRawContent ? (
          <div
            className="item-body markdown-view mini-markdown"
            dangerouslySetInnerHTML={renderedBody}
          />
        ) : (
          <pre className="item-body markdown-view mini-markdown">{entry.body}</pre>
        )}
      </>
    );
  }
}

interface ItemProps {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  users: User[];
  activeUser: ActiveUser | null;
  discussion: DiscussionType;
  entry: Entry;
  community: Community | null;
  isRawContent: boolean;
  ui: UI;
  addAccount: (data: Account) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  updateReply: (reply: Entry) => void;
  addReply: (reply: Entry) => void;
  deleteReply: (reply: Entry) => void;
  toggleUIProp: (what: ToggleType) => void;
  hideControls: boolean;
}

interface ItemState {
  reply: boolean;
  edit: boolean;
  inProgress: boolean;
  mutedData: string[];
  isHiddenPermitted: boolean;
}

export const Item = (props: ItemProps) => {
  const [reply, setReply] = useState(false);
  const [edit, setEdit] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [mutedData, setMutedData] = useState([] as string[]);
  const [isMounted, setIsMounted] = useState(false);
  const [lsDraft, setLsDraft] = useState("");

  const {
    entry,
    updateReply,
    activeUser,
    addReply,
    deleteReply,
    global,
    community,
    location,
    history
  } = props;

  useEffect(() => {
    setIsMounted(true);
    isMounted && fetchMutedUsers();
    checkLsDraft();
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (edit || reply) {
      checkLsDraft();
    }
  }, [edit, reply]);

  const afterVote = (votes: EntryVote[], estimated: number) => {
    const { payout } = entry;
    const newPayout = payout + estimated;

    updateReply({
      ...entry,
      active_votes: votes,
      payout: newPayout,
      pending_payout_value: String(newPayout)
    });
  };

  const toggleReply = () => {
    if (edit) {
      return;
    }
    setReply(!reply);
  };

  const toggleEdit = () => {
    if (reply) {
      return;
    }
    setEdit(!edit);
  };

  const checkLsDraft = () => {
    let replyDraft = ss.get(`reply_draft_${entry?.author}_${entry?.permlink}`);
    replyDraft = (replyDraft && replyDraft.trim()) || "";
    setLsDraft(replyDraft);
  };

  const submitReply = (text: string) => {
    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    const { author: parentAuthor, permlink: parentPermlink } = entry;
    const author = activeUser.username;
    const permlink = createReplyPermlink(entry.author);

    const jsonMeta = makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version);
    setInProgress(true);

    comment(author, parentAuthor, parentPermlink, permlink, "", text, jsonMeta, null, true)
      .then(() => {
        const nReply = tempEntry({
          author: activeUser.data as FullAccount,
          permlink,
          parentAuthor,
          parentPermlink,
          title: "",
          body: text,
          tags: [],
          description: null
        });

        // add new reply to store
        addReply(nReply);

        // remove reply draft
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);

        // close comment box
        toggleReply();

        if (entry.children === 0 && isMounted) {
          // Update parent comment.
          const nParentReply: Entry = {
            ...entry,
            children: 1
          };

          updateReply(nParentReply);
        }
      })
      .catch((e) => {
        console.log(e);
        error(...formatError(e));
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  const _updateReply = (text: string) => {
    const { permlink, parent_author: parentAuthor, parent_permlink: parentPermlink } = entry;
    const jsonMeta = makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], version);
    setInProgress(true);

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
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);

        updateReply(nReply); // update store
        toggleEdit(); // close comment box
      })
      .catch((e) => {
        error(...formatError(e));
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  const deleted = () => {
    deleteReply(entry);
  };

  const fetchMutedUsers = () => {
    if (activeUser) {
      getFollowing(activeUser.username, "", "ignore", 100).then((r) => {
        if (r) {
          let filterList = r.map((user) => user.following);
          isMounted && setMutedData(filterList as string[]);
        }
      });
    }
  };

  const readMore = entry.children > 0 && entry.depth > 5;
  const showSubList = !readMore && entry.children > 0;
  const canEdit = activeUser && activeUser.username === entry.author;

  const canMute =
    activeUser && community
      ? !!community.team.find((m) => {
          return (
            m[0] === activeUser.username &&
            [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          );
        })
      : false;

  const anchorId = `anchor-@${entry.author}/${entry.permlink}`;

  const selected =
    location.hash && location.hash.replace("#", "") === `@${entry.author}/${entry.permlink}`;

  let normalComponent = (
    <div className={_c(`discussion-item depth-${entry.depth} ${selected ? "selected-item" : ""}`)}>
      <div className="position-relative">
        <div className="item-anchor" id={anchorId} />
      </div>
      <div className="item-inner">
        <div className="item-figure">
          {ProfileLink({
            ...props,
            username: entry.author,
            children: (
              <span className="d-sm-inline-block">
                <UserAvatar username={entry.author} size="medium" />
              </span>
            )
          })}
        </div>
        <div className="item-content">
          <div className="item-header">
            <div className="d-flex align-items-center" id={`${entry.author}-${entry.permlink}`}>
              <ProfilePopover {...props} />
            </div>
            <span className="separator circle-separator" />
            {EntryLink({
              ...props,
              entry,
              children: (
                <span className="date" title={dateToFormatted(entry.created)}>
                  {dateToFullRelative(entry.created)}
                </span>
              )
            })}
          </div>
          {(() => {
            let menuItems = [
              {
                label: _t("g.edit"),
                onClick: toggleEdit,
                icon: pencilOutlineSvg
              }
            ];
            if (!(entry.is_paidout || entry.net_rshares > 0 || entry.children > 0)) {
              let deleteItem = {
                label: "",
                onClick: () => {},
                icon: EntryDeleteBtn({
                  ...props,
                  entry,
                  onSuccess: deleted,
                  children: (
                    <a title={_t("g.delete")} className="delete-btn ml-0 pr-3">
                      {deleteForeverSvg} {_t("g.delete")}
                    </a>
                  )
                })
              };
              menuItems.push(deleteItem);
            }

            const menuConfig = {
              history: history,
              label: "",
              icon: dotsHorizontal,
              items: menuItems
            };

            const entryIsMuted = mutedData.includes(entry.author);
            const isComment = !!entry.parent_author;
            const ownEntry = activeUser && activeUser.username === entry.author;
            const isHidden = entry?.net_rshares < -7000000000 && entry?.active_votes.length > 3; // 1000 HP
            const isMuted =
              entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation >= 0;
            const isLowReputation =
              entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation < 0;
            const mightContainMutedComments = activeUser && entryIsMuted && !isComment && !ownEntry;
            const { isRawContent } = props;

            return (
              <>
                {isMuted && (
                  <div className="hidden-warning mt-2">
                    <span>
                      <Tsx k="entry.muted-warning" args={{ community: entry.community_title }}>
                        <span />
                      </Tsx>
                    </span>
                  </div>
                )}

                {isHidden && (
                  <div className="hidden-warning mt-2">
                    <span>{_t("entry.hidden-warning")}</span>
                  </div>
                )}

                {isLowReputation && (
                  <div className="hidden-warning mt-2">
                    <span>{_t("entry.lowrep-warning")}</span>
                  </div>
                )}

                {mightContainMutedComments && (
                  <div className="hidden-warning mt-2">
                    <span>{_t("entry.comments-hidden")}</span>
                  </div>
                )}

                <ItemBody global={global} entry={entry} isRawContent={isRawContent} />
                {props.hideControls ? (
                  <></>
                ) : (
                  <div className="item-controls">
                    <EntryVoteBtn entry={entry} afterVote={afterVote} isPostSlider={false} />
                    <EntryPayout entry={entry} />
                    <EntryVotes entry={entry} history={history} />
                    <a className={_c(`reply-btn ${edit ? "disabled" : ""}`)} onClick={toggleReply}>
                      {_t("g.reply")}
                    </a>
                    {community &&
                      canMute &&
                      MuteBtn({
                        entry,
                        community: community!,
                        activeUser: activeUser!,
                        onSuccess: (entry) => {
                          updateReply(entry);
                        }
                      })}
                    {canEdit && (
                      <div className="ml-3 dropdown-container">
                        <MyDropDown {...menuConfig} float="right" alignBottom={true} />
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}

          {readMore && (
            <div className="read-more">
              {EntryLink({
                ...props,
                entry,
                children: <a>{_t("discussion.read-more")}</a>
              })}
            </div>
          )}
        </div>
      </div>

      {reply &&
        Comment({
          ...props,
          defText: lsDraft,
          submitText: _t("g.reply"),
          cancellable: true,
          onSubmit: submitReply,
          onCancel: toggleReply,
          inProgress: inProgress,
          autoFocus: true
        })}

      {edit &&
        Comment({
          ...props,
          defText: entry.body,
          submitText: _t("g.update"),
          cancellable: true,
          onSubmit: _updateReply,
          onCancel: toggleEdit,
          inProgress: inProgress,
          autoFocus: true
        })}

      {showSubList && <List {...props} parent={entry} />}
    </div>
  );

  return normalComponent;
};

interface ListProps {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  users: User[];
  activeUser: ActiveUser | null;
  discussion: DiscussionType;
  parent: Entry;
  community: Community | null;
  isRawContent: boolean;
  ui: UI;
  addAccount: (data: Account) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  updateReply: (reply: Entry) => void;
  addReply: (reply: Entry) => void;
  deleteReply: (reply: Entry) => void;
  toggleUIProp: (what: ToggleType) => void;
  hideControls: boolean;
}

interface ListState {
  isHiddenPermitted: boolean;
  mutedData: string[];
  isMounted: boolean;
}

export class List extends Component<ListProps> {
  state: ListState = {
    isHiddenPermitted: false,
    mutedData: [],
    isMounted: false
  };

  componentWillUnmount() {
    document.getElementsByTagName("html")[0].style.position = "unset";
    this.setState({ isMounted: false });
  }

  componentDidMount() {
    this.setState({ isMounted: true });
    document.getElementsByTagName("html")[0].style.position = "relative";
    this.state.isMounted && this.fetchMutedUsers();
  }

  shouldComponentUpdate(nextProps: Readonly<Props>) {
    if (
      this.props.discussion === nextProps.discussion &&
      this.props.activeUser === nextProps.activeUser
    ) {
      return false;
    } else {
      return true;
    }
  }

  fetchMutedUsers = () => {
    const { activeUser } = this.props;
    if (activeUser) {
      getFollowing(activeUser.username, "", "ignore", 100).then((r) => {
        if (r) {
          let filterList = r.map((user) => user.following);
          this.state.isMounted && this.setState({ mutedData: filterList });
        }
      });
    }
  };

  render() {
    const { discussion, parent, activeUser, isRawContent } = this.props;
    const { isHiddenPermitted, mutedData } = this.state;

    const { list } = discussion;

    let filtered = list.filter(
      (x) => x.parent_author === parent.author && x.parent_permlink === parent.permlink
    );

    if (filtered.length === 0) {
      return null;
    }

    let mutedContent = filtered.filter(
      (item) =>
        activeUser &&
        mutedData.includes(item.author) &&
        item.depth === 1 &&
        item.parent_author === parent.author
    );
    let unmutedContent = filtered.filter((md) =>
      mutedContent.every((fd) => fd.post_id !== md.post_id)
    );
    let data = isHiddenPermitted ? [...unmutedContent, ...mutedContent] : unmutedContent;
    if (!activeUser) {
      data = filtered;
    }
    return (
      <div className="discussion-list">
        {data.map((d) => (
          <Item
            key={`${d.author}-${d.permlink}`}
            {...this.props}
            entry={d}
            hideControls={this.props.hideControls}
            isRawContent={isRawContent}
          />
        ))}
        {!isHiddenPermitted && mutedContent.length > 0 && activeUser && activeUser.username && (
          <div className="hidden-warning d-flex justify-content-between flex-1 align-items-center mt-3">
            <div className="flex-1">{_t("discussion.reveal-muted-long-description")}</div>
            <div onClick={() => this.setState({ isHiddenPermitted: true })} className="pointer p-3">
              <b>{_t("g.show")}</b>
            </div>
          </div>
        )}
      </div>
    );
  }
}

interface Props {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  users: User[];
  activeUser: ActiveUser | null;
  parent: Entry;
  community: Community | null;
  isRawContent: boolean;
  discussion: DiscussionType;
  ui: UI;
  addAccount: (data: Account) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  fetchDiscussion: (parent_author: string, parent_permlink: string) => void;
  sortDiscussion: (order: SortOrder) => void;
  resetDiscussion: () => void;
  updateReply: (reply: Entry) => void;
  addReply: (reply: Entry) => void;
  deleteReply: (reply: Entry) => void;
  toggleUIProp: (what: ToggleType) => void;
  hideControls: boolean;
}

interface State {
  visible: boolean;
  isMounted: boolean;
}

export class Discussion extends Component<Props, State> {
  state: State = {
    visible: !!this.props.activeUser,
    isMounted: false
  };

  componentDidMount() {
    this.setState({ isMounted: true });
    const { activeUser } = this.props;
    if (activeUser) {
      this.fetch();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.isRawContent !== this.props.isRawContent) {
      this.show();
    }
    const { parent } = this.props;
    if (parent.url !== prevProps.parent.url) {
      // url changed
      this.fetch();
    }

    const { discussion } = this.props;
    if (prevProps.discussion.list.length === 0 && discussion.list.length > 0) {
      const { location } = this.props;
      if (location.hash) {
        const permlink = location.hash.replace("#", "");
        const anchorId = `anchor-${permlink}`;
        const anchorEl = document.getElementById(anchorId);
        if (anchorEl) {
          anchorEl.scrollIntoView();
        }
      }
    }
  }

  componentWillUnmount() {
    const { resetDiscussion } = this.props;
    resetDiscussion();
    this.setState({ isMounted: false });
  }

  fetch = () => {
    const { parent, fetchDiscussion } = this.props;
    const { author, permlink } = parent;
    fetchDiscussion(author, permlink);
  };

  orderChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const order = e.target.value as SortOrder;
    const { sortDiscussion } = this.props;
    sortDiscussion(SortOrder[order]);
  };

  show = () => {
    this.setState({ visible: true });
    this.fetch();
  };

  render() {
    const { parent, discussion, activeUser, isRawContent } = this.props;
    const { visible } = this.state;
    const { loading, order } = discussion;
    const count = parent.children;

    if (loading) {
      return (
        <div className="discussion">
          <LinearProgress />
        </div>
      );
    }

    const join = (
      <div className="discussion-card">
        <div className="icon">{commentSvg}</div>
        <div className="label">{_t("discussion.join")}</div>
        {LoginRequired({
          ...this.props,
          children: <Button>{_t("discussion.btn-join")}</Button>
        })}
      </div>
    );

    if (!activeUser && count < 1) {
      return <div className="discussion">{join}</div>;
    }

    if (count < 1) {
      return <div className="discussion empty" />;
    }

    const strCount =
      count > 1 ? _t("discussion.n-replies", { n: count }) : _t("discussion.replies");

    if (!visible && count >= 1) {
      return (
        <div className="discussion">
          <div className="discussion-card">
            <div className="icon">{commentSvg}</div>
            <div className="label">{strCount}</div>
            {this.props.hideControls ? <></> : <Button onClick={this.show}>{_t("g.show")}</Button>}
          </div>
        </div>
      );
    }

    return (
      <div className="discussion" id="discussion">
        {!activeUser && <>{join}</>}
        <div className="discussion-header">
          <div className="count">
            {" "}
            {commentSvg} {strCount}
          </div>
          <span className="flex-spacer" />
          {this.props.hideControls ? (
            <></>
          ) : (
            <div className="order">
              <span className="order-label">{_t("discussion.order")}</span>
              <FormControl
                type="select"
                value={order}
                onChange={this.orderChanged}
                disabled={loading}
              >
                <option value="trending">{_t("discussion.order-trending")}</option>
                <option value="author_reputation">{_t("discussion.order-reputation")}</option>
                <option value="votes">{_t("discussion.order-votes")}</option>
                <option value="created">{_t("discussion.order-created")}</option>
              </FormControl>
            </div>
          )}
        </div>
        <List {...this.props} parent={parent} isRawContent={isRawContent} />
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    location: p.location,
    global: p.global,
    dynamicProps: p.dynamicProps,
    users: p.users,
    activeUser: p.activeUser,
    parent: p.parent,
    community: p.community,
    discussion: p.discussion,
    isRawContent: p.isRawContent,
    ui: p.ui,
    addAccount: p.addAccount,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    fetchDiscussion: p.fetchDiscussion,
    sortDiscussion: p.sortDiscussion,
    resetDiscussion: p.resetDiscussion,
    updateReply: p.updateReply,
    addReply: p.addReply,
    deleteReply: p.deleteReply,
    toggleUIProp: p.toggleUIProp,
    hideControls: p.hideControls
  };

  return <Discussion {...props} />;
};
