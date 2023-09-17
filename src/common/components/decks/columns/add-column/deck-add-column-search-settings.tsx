import React, { ChangeEvent, useContext, useState } from "react";
import { SettingsProps } from "./common";
import { DeckGridContext } from "../../deck-manager";
import { _t } from "../../../../i18n";
import { ButtonGroup } from "@ui/button-group";
import { SearchType } from "../../../../helper/search-query";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { DateOpt, SearchSort } from "../../consts";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { FormCheck } from "react-bootstrap";

export const DeckAddColumnSearchSettings = ({ deckKey }: SettingsProps) => {
  const [query, setQuery] = useState("");
  const { add } = useContext(DeckGridContext);
  const [mode, setMode] = useState(0);

  // Advanced settings
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useLocalStorage<string>("recent_date", DateOpt.W);
  const [sort, setSort] = useState("");
  const [hideLow, setHideLow] = useState(false);

  return (
    <div className="deck-add-column-search-settings p-3">
      <div className="helper-text">{_t("decks.columns.enter-search-query")}</div>
      <ButtonGroup
        className="my-3"
        labels={[_t("decks.simple"), _t("decks.advanced")]}
        selected={mode}
        setSelected={(m) => setMode(m)}
      />

      <div className="subtitle py-3">{_t("decks.columns.search-query")}</div>
      <FormControl
        type="text"
        autoFocus={true}
        placeholder=""
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {mode === 1 && (
        <>
          <div className="mt-3 mb-4">
            <label>{_t("decks.author")}</label>
            <FormControl
              type="text"
              autoFocus={true}
              placeholder={_t("decks.username")}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label>{_t("search-comment.type")}</label>
            <FormControl
              type="select"
              value={type}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
            >
              {Object.values(SearchType).map((x) => (
                <option value={x} key={x}>
                  {_t(`search-comment.type-${x}`)}
                </option>
              ))}
            </FormControl>
          </div>
          <div className="mb-4">
            <label>{_t("search-comment.category")}</label>
            <FormControl
              type="text"
              placeholder={_t("search-comment.category-placeholder")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label>{_t("search-comment.tags")}</label>
            <FormControl
              type="text"
              placeholder={_t("search-comment.tags-placeholder")}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label>{_t("search-comment.date")}</label>
            <FormControl
              type="select"
              value={date}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setDate(e.target.value)}
            >
              {Object.values(DateOpt).map((x) => (
                <option value={x} key={x}>
                  {_t(`search-comment.date-${x}`)}
                </option>
              ))}
            </FormControl>
          </div>
          <div className="mb-4">
            <label>{_t("search-comment.sort")}</label>
            <FormControl
              type="select"
              value={sort}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}
            >
              {Object.values(SearchSort).map((x) => (
                <option value={x} key={x}>
                  {_t(`search-comment.sort-${x}`)}
                </option>
              ))}
            </FormControl>
          </div>
          <div className="mb-4">
            <FormCheck
              label={_t("search-comment.hide-low")}
              checked={hideLow}
              onChange={(e) => setHideLow(e.target.checked)}
            />
          </div>
        </>
      )}
      {query !== "" ? (
        <Button
          disabled={!query}
          className="w-full mt-5 sticky bottom-0"
          onClick={() =>
            add({
              key: deckKey,
              type: "s",
              settings: {
                query,
                ...(mode === 1 ? { author, tags, date, category, type, sort, hideLow } : {}),
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
