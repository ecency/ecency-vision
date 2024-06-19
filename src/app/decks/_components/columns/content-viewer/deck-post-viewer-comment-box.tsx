import Comment from "../../../../components/comment";
import { useMappedStore } from "../../../../store/use-mapped-store";
import React, { useState } from "react";
import { _t } from "../../../../i18n";
import { Entry } from "../../../../store/entries/types";
import { useLocation } from "react-router";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../../../helper/posting";
import { version } from "../../../../../../package.json";
import { useCreateReply } from "../../../../api/mutations";

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
    toggleUIProp
  } = useMappedStore();

  const location = useLocation();

  const [isReplying, setIsReplying] = useState(false);
  const [isCommented, setIsCommented] = useState(false);

  const { mutateAsync: createReply } = useCreateReply(entry, undefined, () => {
    onReplied();
    setIsCommented(true);
    setIsReplying(false);
  });

  const submitReply = async (text: string) => {
    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    const permlink = createReplyPermlink(entry.author);
    const tags = entry.json_metadata.tags || ["ecency"];

    const jsonMeta = makeJsonMetaDataReply(tags, version);

    setIsReplying(true);

    return createReply({ jsonMeta, text, permlink, point: true });
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
