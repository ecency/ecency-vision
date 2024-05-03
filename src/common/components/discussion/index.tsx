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
import { useBotsQuery, useFetchDiscussionsQuery } from "../../api/queries";
import { DiscussionBots } from "./discussion-bots";

setProxyBase(defaults.imageServer);

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
  const { data: botsList } = useBotsQuery();

  const count = useMemo(() => parent.children, [parent]);
  const strCount = useMemo(
    () => (count > 1 ? _t("discussion.n-replies", { n: count }) : _t("discussion.replies")),
    [count]
  );
  const filtered = useMemo(
    () =>
      data.filter(
        (x) => x.parent_author === parent.author && x.parent_permlink === parent.permlink
      ),
    [data, parent]
  );
  const botsData = useMemo(
    () => filtered.filter((entry) => botsList.includes(entry.author) && entry.children === 0),
    [filtered]
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
        <div className="count mr-4">
          {" "}
          {commentSvg} {strCount}
        </div>
        <DiscussionBots history={history} entries={botsData} />
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
