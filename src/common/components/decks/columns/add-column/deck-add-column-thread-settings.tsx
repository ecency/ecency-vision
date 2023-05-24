import { _t } from "../../../../i18n";
import { UserAvatar } from "../../../user-avatar";
import { Button, Dropdown } from "react-bootstrap";
import React, { useContext, useState } from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { SettingsProps } from "./common";
import { PREFIX } from "../../../../util/local-storage";
import { DeckGridContext } from "../../deck-manager";
import { AVAILABLE_THREAD_HOSTS } from "../../consts";

export const DeckAddColumnThreadSettings = ({ deckKey }: SettingsProps) => {
  const { global } = useMappedStore();
  const { add } = useContext(DeckGridContext);

  const [username, setUsername] = useState("");
  const [host, setHost] = useLocalStorage(PREFIX + "_dtf_ac", "all");

  return (
    <div className="deck-add-column-user-settings p-3">
      <div className="helper-text mb-3">{_t("decks.columns.add-thread-host-text")}</div>
      <Dropdown>
        <Dropdown.Toggle as="div">
          <div className="selected-user">
            <UserAvatar
              size="medium"
              global={global}
              username={host === "all" ? "ecency" : host!!}
            />
            <div className="username">
              {host === "all" ? _t("decks.columns.all-thread-hosts") : host}
            </div>
            <div className="click-to-change">{_t("decks.columns.click-to-change")}</div>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {["all", ...AVAILABLE_THREAD_HOSTS].map((v) => (
            <Dropdown.Item key={v} onClick={() => setHost(v)} className="thread-host-item">
              <UserAvatar size="small" global={global} username={v === "all" ? "ecency" : v} />
              {v === "all" ? _t("decks.columns.all-thread-hosts") : v}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {host !== "" ? (
        <Button
          disabled={!host}
          className="w-100 mt-5 py-3 sticky-bottom"
          variant="primary"
          onClick={() =>
            add({
              key: deckKey,
              type: "th",
              settings: {
                host,
                updateIntervalMs: 60000
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
