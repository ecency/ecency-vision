import { useMappedStore } from "../../../../store/use-mapped-store";
import React, { useContext, useState } from "react";
import { DeckGridContext } from "../../deck-manager";
import { UserAvatar } from "../../../user-avatar";
import { DeckAddColumnSearchBox } from "./deck-add-column-search-box";
import { Button } from "react-bootstrap";
import { SettingsProps, UsernameDataItem } from "./common";
import { ICONS } from "../../consts";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../../util/local-storage";
import { _t } from "../../../../i18n";
import { COMMUNITY_CONTENT_TYPES } from "../../consts";

export const DeckAddColumnCommunitySettings = ({ deckKey }: SettingsProps) => {
  const { global } = useMappedStore();

  const { add } = useContext(DeckGridContext);

  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [contentType, setContentType] = useState<string | null>(null);
  const [recent, setRecent] = useLocalStorage<UsernameDataItem[]>(PREFIX + "_dcr", []);

  const updateRecent = (name?: string, tag?: string) => {};

  return (
    <div className="deck-add-column-user-settings p-3">
      <div className="helper-text">{_t("decks.columns.add-username-text")}</div>
      <div className="subtitle py-3">{_t("decks.columns.community")}</div>
      {username ? (
        <div className="selected-user" onClick={() => setUsername("")}>
          <UserAvatar size="medium" global={global} username={tag} />
          <div className="username">{username}</div>
          <div className="click-to-change">{_t("decks.columns.click-to-change")}</div>
        </div>
      ) : (
        <DeckAddColumnSearchBox
          isCommunity={true}
          username={username}
          setUsername={(v) => {
            setUsername(v);
          }}
          recentList={recent ?? []}
          setItem={({ tag }) => {
            setTag(tag ?? "");
          }}
        />
      )}
      {username !== "" ? (
        <>
          <div className="subtitle py-3 mt-3">Content type</div>
          <div className="content-type-list">
            {COMMUNITY_CONTENT_TYPES.map(({ title, type }) => (
              <div
                className={"content-type-item " + (contentType === type ? "selected" : "")}
                key={title}
                onClick={() => setContentType(type)}
              >
                {ICONS.co[type]}
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
              type: "co",
              settings: {
                username,
                contentType,
                updateIntervalMs: 60000,
                tag
              }
            })
          }
        >
          {_t("g.continue")}
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
