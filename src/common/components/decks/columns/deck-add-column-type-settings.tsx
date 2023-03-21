import { DeckGridItem } from "../types";
import React, { useState } from "react";
import { SearchByUsername } from "../../search-by-username";
import { useMappedStore } from "../../../store/use-mapped-store";
import { blogSvg, commentSvg } from "../../../img/svg";
import { Button } from "react-bootstrap";
import { useDeckGrid } from "../use-deck-grid";

const DeckAddColumnUserSettings = () => {
  const { activeUser } = useMappedStore();

  const { add } = useDeckGrid();

  const [username, setUsername] = useState("");
  const [contentType, setContentType] = useState<string | null>(null);

  const contentTypes = [
    { title: "Blogs", icon: blogSvg, type: "blogs" },
    { title: "Posts", icon: commentSvg, type: "posts" },
    {
      title: "Comments",
      icon: commentSvg,
      type: "comments"
    },
    {
      title: "Replies",
      icon: commentSvg,
      type: "replies"
    }
  ];

  return (
    <div className="deck-add-column-user-settings p-3">
      <div className="helper-text">
        Enter a username below and select which type of content You want to see
      </div>
      <div className="subtitle py-3">Username</div>
      <SearchByUsername setUsername={setUsername} activeUser={activeUser} />
      <div className="subtitle py-3 mt-3">Content type</div>
      <div className="content-type-list">
        {contentTypes.map(({ icon, title, type }) => (
          <div className="content-type-item" key={title} onClick={() => setContentType(type)}>
            {icon}
            <div className="title">{title}</div>
          </div>
        ))}
      </div>
      <Button
        disabled={!username || !contentType}
        className="w-100 mt-5 py-3 sticky-bottom"
        variant="primary"
        onClick={() =>
          add({
            key: "",
            type: "u",
            settings: {
              username,
              contentType
            }
          })
        }
      >
        Continue
      </Button>
    </div>
  );
};

const DeckAddColumnCommunitySettings = () => {
  return <div className="deck-add-column-community-settings"></div>;
};

const DeckAddColumnWalletSettings = () => {
  return <div className="deck-add-column-wallet-settings"></div>;
};

const DeckAddColumnNotificationsSettings = () => {
  return <div className="deck-add-column-notifications-settings"></div>;
};

const DeckAddColumnSearchSettings = () => {
  return <div className="deck-add-column-search-settings"></div>;
};

interface Props {
  type: DeckGridItem["type"];
}

export const DeckAddColumnTypeSettings = ({ type }: Props) => {
  return (
    <>
      {type === "u" ? <DeckAddColumnUserSettings /> : <></>}
      {type === "co" ? <DeckAddColumnCommunitySettings /> : <></>}
      {type === "w" ? <DeckAddColumnWalletSettings /> : <></>}
      {type === "n" ? <DeckAddColumnNotificationsSettings /> : <></>}
      {type === "s" ? <DeckAddColumnSearchSettings /> : <></>}
    </>
  );
};
