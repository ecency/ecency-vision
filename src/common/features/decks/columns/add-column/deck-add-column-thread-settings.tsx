import { _t } from "../../../../i18n";
import { UserAvatar } from "../../../../components/user-avatar";
import React, { useContext, useState } from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { SettingsProps } from "./common";
import { PREFIX } from "../../../../util/local-storage";
import { DeckGridContext } from "../../deck-manager";
import { AVAILABLE_THREAD_HOSTS } from "../../consts";
import { Button } from "@ui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";

export const DeckAddColumnThreadSettings = ({ deckKey }: SettingsProps) => {
  const { global } = useMappedStore();
  const { add } = useContext(DeckGridContext);

  const [username, setUsername] = useState("");
  const [host, setHost] = useLocalStorage(PREFIX + "_dtf_ac", "all");

  return (
    <div className="deck-add-column-user-settings p-3">
      <div className="helper-text mb-3">{_t("decks.columns.add-thread-host-text")}</div>
      <Dropdown>
        <DropdownToggle>
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
        </DropdownToggle>
        <DropdownMenu>
          {["all", ...AVAILABLE_THREAD_HOSTS].map((v) => (
            <DropdownItem key={v} onClick={() => setHost(v)} className="thread-host-item">
              <UserAvatar size="small" global={global} username={v === "all" ? "ecency" : v} />
              {v === "all" ? _t("decks.columns.all-thread-hosts") : v}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      {host !== "" ? (
        <Button
          disabled={!host}
          className="w-full mt-5 sticky bottom-0"
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
