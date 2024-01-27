import React, { useEffect, useMemo, useState } from "react";
import { History } from "history";
import defaults from "../../constants/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import { Entry } from "../../store/entries/types";
import { Community } from "../../store/communities";
import { SortOrder } from "../../store/discussion/types";
import LinearProgress from "../linear-progress";
import LoginRequired from "../login-required";
import { _t } from "../../i18n";
import { commentSvg } from "../../img/svg";
import "./_index.scss";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { useMappedStore } from "../../store/use-mapped-store";
import { DiscussionList } from "./discussion-list";
import usePrevious from "react-use/lib/usePrevious";
import { useFetchDiscussionsQuery } from "../../api/queries";

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
      stats: { ...entry.stats, total_votes: votes.length },
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
      <div className="relative">
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
            <div className="flex items-center" id={`${entry.author}-${entry.permlink}`}>
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
            const isHidden = entry?.net_rshares < -7000000000 && entry?.active_votes?.length > 3; // 1000 HP
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
          <div className="hidden-warning flex justify-between flex-1 items-center mt-3">
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
  parent: Entry;
  community: Community | null;
  isRawContent: boolean;
  hideControls: boolean;
}

export function Discussion({ hideControls, isRawContent, parent, community, history }: Props) {
  const { activeUser, toggleUIProp, deleteUser, updateActiveUser, setActiveUser, users, ui } =
    useMappedStore();
  const previousIsRawContent = usePrevious(isRawContent);

  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState(SortOrder.trending);

  const { isLoading, data } = useFetchDiscussionsQuery(parent, order, {
    enabled: visible && !!parent
  });

  const count = useMemo(() => parent.children, [parent]);
  const strCount = useMemo(
    () => (count > 1 ? _t("discussion.n-replies", { n: count }) : _t("discussion.replies")),
    [count]
  );

  useEffect(() => {
    if (previousIsRawContent !== isRawContent) {
      show();
    }
  }, [isRawContent, previousIsRawContent]);
  useEffect(() => setVisible(!!activeUser), [activeUser]);

  const show = () => setVisible(true);

  const join = (
    <div className="discussion-card">
      <div className="icon">{commentSvg}</div>
      <div className="label">{_t("discussion.join")}</div>
      <LoginRequired
        toggleUIProp={toggleUIProp}
        deleteUser={deleteUser}
        updateActiveUser={updateActiveUser}
        setActiveUser={setActiveUser}
        users={users}
        activeUser={activeUser}
        ui={ui}
      >
        <Button>{_t("discussion.btn-join")}</Button>
      </LoginRequired>
    </div>
  );

  if (isLoading) {
    return (
      <div className="discussion">
        <LinearProgress />
      </div>
    );
  }

  if (!activeUser && count < 1) {
    return <div className="discussion">{join}</div>;
  }

  if (count < 1) {
    return <div className="discussion empty" />;
  }

  if (!visible && count >= 1) {
    return (
      <div className="discussion">
        <div className="discussion-card">
          <div className="icon">{commentSvg}</div>
          <div className="label">{strCount}</div>
          {hideControls ? <></> : <Button onClick={show}>{_t("g.show")}</Button>}
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
        {hideControls ? (
          <></>
        ) : (
          <div className="order">
            <span className="order-label">{_t("discussion.order")}</span>
            <FormControl
              type="select"
              value={order}
              onChange={(e: any) => setOrder(e.target.value)}
              disabled={isLoading}
            >
              <option value="trending">{_t("discussion.order-trending")}</option>
              <option value="author_reputation">{_t("discussion.order-reputation")}</option>
              <option value="votes">{_t("discussion.order-votes")}</option>
              <option value="created">{_t("discussion.order-created")}</option>
            </FormControl>
          </div>
        )}
      </div>
      <DiscussionList
        root={parent}
        discussionList={data}
        history={history}
        hideControls={hideControls}
        parent={parent}
        isRawContent={isRawContent}
        community={community}
      />
    </div>
  );
}
