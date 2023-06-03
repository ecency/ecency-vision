import Comment from "../../../comment";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { useState } from "react";
import { _t } from "../../../../i18n";
import { Entry } from "../../../../store/entries/types";
import { useLocation } from "react-router";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../../../helper/posting";
import { comment, formatError } from "../../../../api/operations";
import tempEntry from "../../../../helper/temp-entry";
import { FullAccount } from "../../../../store/accounts/types";
import * as ss from "../../../../util/session-storage";
import { error } from "../../../feedback";
import { version } from "../../../../../../package.json";
import React from "react";

interface Props {
  entry: Entry;
  onReplied: () => void;
}

export const DeckPostViewerCommentBox = ({ entry, onReplied }: Props) => {
  const {
    users,
    activeUser,
    ui,
    global,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    toggleUIProp,
    addReply
  } = useMappedStore();

  const location = useLocation();

  const [isReplying, setIsReplying] = useState(false);
  const [isCommented, setIsCommented] = useState(false);

  const submitReply = async (text: string) => {
    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    const { author: parentAuthor, permlink: parentPermlink } = entry;
    const author = activeUser.username;
    const permlink = createReplyPermlink(entry.author);
    const tags = entry.json_metadata.tags || ["ecency"];

    const jsonMeta = makeJsonMetaDataReply(tags, version);

    setIsReplying(true);

    try {
      await comment(author, parentAuthor, parentPermlink, permlink, "", text, jsonMeta, null, true);
      ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);
      addReply(
        tempEntry({
          author: activeUser.data as FullAccount,
          permlink,
          parentAuthor,
          parentPermlink,
          title: "",
          body: text,
          tags,
          description: null
        })
      );

      onReplied();
      setIsCommented(true);
    } catch (e) {
      error(...formatError(e));
    } finally {
      setIsCommented(false);
      setIsReplying(false);
    }
  };
  return (
    <Comment
      defText={""}
      submitText={_t("g.reply")}
      users={users}
      activeUser={activeUser}
      ui={ui}
      global={global}
      entry={entry}
      location={location}
      setActiveUser={setActiveUser}
      updateActiveUser={updateActiveUser}
      deleteUser={deleteUser}
      toggleUIProp={toggleUIProp}
      onSubmit={submitReply}
      isCommented={isCommented}
      inProgress={isReplying}
    />
  );
};
