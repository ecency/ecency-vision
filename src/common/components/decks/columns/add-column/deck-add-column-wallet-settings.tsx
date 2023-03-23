import { useMappedStore } from "../../../../store/use-mapped-store";
import React, { useContext, useState } from "react";
import { DeckGridContext } from "../../deck-manager";
import { UserAvatar } from "../../../user-avatar";
import { DeckAddColumnSearchBox } from "./deck-add-column-search-box";
import { Button } from "react-bootstrap";
import { SettingsProps, UsernameDataItem } from "./common";
import { blogSvg, commentSvg } from "../../../../img/svg";

export const DeckAddColumnWalletSettings = ({ deckKey }: SettingsProps) => {
  const { global } = useMappedStore();

  const { add } = useContext(DeckGridContext);

  const [username, setUsername] = useState("");
  const [contentType, setContentType] = useState<string | null>(null);
  const [recent, setRecent] = useState<UsernameDataItem[]>([]);

  const contentTypes = [
    { title: "All history", icon: blogSvg, type: "all" },
    { title: "Transfers", icon: commentSvg, type: "transfers" },
    {
      title: "Market orders",
      icon: commentSvg,
      type: "market-orders"
    },
    {
      title: "Interests",
      icon: commentSvg,
      type: "interests"
    },
    {
      title: "Stake operations",
      icon: commentSvg,
      type: "stake-operations"
    },
    {
      title: "Rewards",
      icon: commentSvg,
      type: "rewards"
    }
  ];

  return (
    <div className="deck-add-column-user-settings p-3">
      <div className="helper-text">
        Enter a username below and select which type of wallet transactions You want to see
      </div>
      <div className="subtitle py-3">Username</div>
      {username ? (
        <div className="selected-user" onClick={() => setUsername("")}>
          <UserAvatar size="medium" global={global} username={username} />
          <div className="username">@{username}</div>
          <div className="click-to-change">Click to change</div>
        </div>
      ) : (
        <DeckAddColumnSearchBox username={username} setUsername={setUsername} recentList={recent} />
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
              type: "w",
              settings: {
                username,
                contentType,
                updateIntervalMs: 60000
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
