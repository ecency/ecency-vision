import React, { useEffect, useMemo, useState } from "react";
import { History } from "history";
import defaults from "../../constants/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import { Entry } from "../../store/entries/types";
import { Community } from "../../store/communities";
import { Discussion as DiscussionType, SortOrder } from "../../store/discussion/types";
import LinearProgress from "../linear-progress";
import LoginRequired from "../login-required";
import { _t } from "../../i18n";
import { commentSvg } from "../../img/svg";
import "./_index.scss";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { useMappedStore } from "../../store/use-mapped-store";
import { DiscussionList } from "./discussion-list";
import { useUnmount } from "react-use";
import usePrevious from "react-use/lib/usePrevious";
import { useLocation } from "react-router";

setProxyBase(defaults.imageServer);

setProxyBase(defaults.imageServer);

interface Props {
  history: History;
  parent: Entry;
  community: Community | null;
  isRawContent: boolean;
  discussion: DiscussionType;
  hideControls: boolean;
}

export function Discussion({
  hideControls,
  isRawContent,
  parent,
  community,
  history,
  discussion
}: Props) {
  const {
    activeUser,
    toggleUIProp,
    deleteUser,
    updateActiveUser,
    setActiveUser,
    users,
    ui,
    fetchDiscussion,
    sortDiscussion,
    resetDiscussion
  } = useMappedStore();
  const previousIsRawContent = usePrevious(isRawContent);
  const previousParent = usePrevious(parent);
  const previousDiscussion = usePrevious(discussion);

  const [visible, setVisible] = useState(false);

  const location = useLocation();
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
  useEffect(() => {
    if (activeUser) {
      fetch();
    }
  }, [activeUser]);
  useEffect(() => {
    if (parent.url !== previousParent?.url) {
      fetch();
    }
  }, [parent, previousParent]);
  useEffect(() => {
    if (previousDiscussion?.list.length === 0 && discussion.list.length > 0) {
      if (location.hash) {
        const permlink = location.hash.replace("#", "");
        const anchorId = `anchor-${permlink}`;
        const anchorEl = document.getElementById(anchorId);
        if (anchorEl) {
          anchorEl.scrollIntoView();
        }
      }
    }
  }, []);
  useEffect(() => setVisible(!!activeUser), [activeUser]);
  useUnmount(() => resetDiscussion());

  const fetch = () => fetchDiscussion(parent.author, parent.permlink);

  const orderChanged = (e: React.ChangeEvent<HTMLSelectElement>) =>
    sortDiscussion(SortOrder[e.target.value as SortOrder]);

  const show = () => {
    setVisible(true);
    fetch();
  };

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

  if (discussion.loading) {
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
              value={discussion.order}
              onChange={orderChanged}
              disabled={discussion.loading}
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
        history={history}
        hideControls={hideControls}
        discussion={discussion}
        parent={parent}
        isRawContent={isRawContent}
        community={community}
      />
    </div>
  );
}
