import React, { useContext, useState } from "react";
import { SettingsProps } from "./common";
import { Button, Form } from "react-bootstrap";
import { DeckGridContext } from "../../deck-manager";
import { _t } from "../../../../i18n";

export const DeckAddColumnSearchSettings = ({ deckKey }: SettingsProps) => {
  const [query, setQuery] = useState("");
  const { add } = useContext(DeckGridContext);

  return (
    <div className="deck-add-column-search-settings p-3">
      <div className="helper-text">{_t("decks.columns.enter-search-query")}</div>
      <div className="subtitle py-3">{_t("decks.columns.search-query")}</div>
      <Form.Control
        type="text"
        autoFocus={true}
        placeholder=""
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
      {query !== "" ? (
        <Button
          disabled={!query}
          className="w-100 mt-5 py-3 sticky-bottom"
          variant="primary"
          onClick={() =>
            add({
              key: deckKey,
              type: "s",
              settings: {
                query,
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
