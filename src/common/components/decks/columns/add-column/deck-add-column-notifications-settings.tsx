import { useMappedStore } from "../../../../store/use-mapped-store";
import React, { useContext, useState } from "react";
import { DeckGridContext } from "../../deck-manager";
import { blogSvg, commentSvg } from "../../../../img/svg";
import { UserAvatar } from "../../../user-avatar";
import { DeckAddColumnSearchBox } from "./deck-add-column-search-box";
import { Button } from "react-bootstrap";
import { SettingsProps, UsernameDataItem } from "./common";

export const DeckAddColumnNotificationsSettings = ({ deckKey }: SettingsProps) => {
  const { global } = useMappedStore();

  const { add } = useContext(DeckGridContext);

  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [contentType, setContentType] = useState<string | null>(null);
  const [recent, setRecent] = useState<UsernameDataItem[]>([]);

  const contentTypes = [
    { title: "All", icon: blogSvg, type: "all" },
    { title: "Votes", icon: commentSvg, type: "rvotes" },
    {
      title: "Mentions",
      icon: commentSvg,
      type: "mentions"
    },
    {
      title: "Favourites",
      icon: commentSvg,
      type: "nfavorites"
    },
    {
      title: "Bookmarks",
      icon: commentSvg,
      type: "nbookmarks"
    },
    {
      title: "Follows",
      icon: commentSvg,
      type: "follows"
    },
    {
      title: "Replies",
      icon: commentSvg,
      type: "replies"
    },
    {
      title: "Reblogs",
      icon: commentSvg,
      type: "reblogs"
    },
    {
      title: "Transfers",
      icon: commentSvg,
      type: "transfers"
    },
    {
      title: "Delegations",
      icon: commentSvg,
      type: "delegations"
    }
  ];

  return (
    <div className="deck-add-column-user-settings p-3">
      <div className="helper-text">
        Enter a username below and select which type of content You want to see
      </div>
      <div className="subtitle py-3">Username</div>
      {username ? (
        <div className="selected-user" onClick={() => setUsername("")}>
          <UserAvatar size="medium" global={global} username={username} />
          <div className="username">{username}</div>
          <div className="click-to-change">Click to change</div>
        </div>
      ) : (
        <DeckAddColumnSearchBox
          username={username}
          setUsername={setUsername}
          recentList={recent}
          setItem={({ tag }) => setTag(tag ?? "")}
        />
      )}
      {username !== "" ? (
        <>
          <div className="subtitle py-3 mt-3">Content type</div>
          <div className="content-type-list">
            {contentTypes.map(({ icon, title, type }) => (
              <div className="content-type-item" key={title} onClick={() => setContentType(type)}>
                {icon}
                <div className="title">{title}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <></>
      )}
      {username !== "" && contentType !== null ? (
        <Button
          disabled={!username || !contentType}
          className="w-100 mt-5 py-3 sticky-bottom"
          variant="primary"
          onClick={() =>
            add({
              key: deckKey,
              type: "n",
              settings: {
                username,
                contentType,
                updateIntervalMs: 60000,
                tag
              }
            })
          }
        >
          Continue
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
