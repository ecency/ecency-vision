import { useMappedStore } from "../../../../store/use-mapped-store";
import React, { useContext, useState } from "react";
import { DeckGridContext } from "../../deck-manager";
import { UserAvatar } from "../../../user-avatar";
import { DeckAddColumnSearchBox } from "./deck-add-column-search-box";
import { Button } from "react-bootstrap";
import { SettingsProps, UsernameDataItem } from "./common";
import {
  bookmarksIconSvg,
  delegationsIconSvg,
  favouritesIconSvg,
  followsIconSvg,
  mentionsIconSvg,
  reblogsIconSvg,
  repliesIconSvg,
  transfersIconSvg,
  voteIconSvg,
  walletAllIconSvg
} from "../../icons";
import { ICONS } from "../../consts";

export const DeckAddColumnNotificationsSettings = ({ deckKey }: SettingsProps) => {
  const { global } = useMappedStore();

  const { add } = useContext(DeckGridContext);

  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [contentType, setContentType] = useState<string | null>(null);
  const [recent, setRecent] = useState<UsernameDataItem[]>([]);

  const contentTypes = [
    { title: "All", type: "all" },
    { title: "Votes", type: "rvotes" },
    {
      title: "Mentions",
      type: "mentions"
    },
    {
      title: "Favourites",
      type: "nfavorites"
    },
    {
      title: "Bookmarks",
      type: "nbookmarks"
    },
    {
      title: "Follows",
      type: "follows"
    },
    {
      title: "Replies",
      type: "replies"
    },
    {
      title: "Reblogs",
      type: "reblogs"
    },
    {
      title: "Transfers",
      type: "transfers"
    },
    {
      title: "Delegations",
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
            {contentTypes.map(({ title, type }) => (
              <div
                className={"content-type-item " + (contentType === type ? "selected" : "")}
                key={title}
                onClick={() => setContentType(type)}
              >
                {ICONS.notifications[type]}
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
