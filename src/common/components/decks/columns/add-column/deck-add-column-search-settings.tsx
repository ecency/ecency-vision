import React, { ChangeEvent, useContext, useState } from "react";
import { SettingsProps } from "./common";
import { Button, Form } from "react-bootstrap";
import { DeckGridContext } from "../../deck-manager";
import { _t } from "../../../../i18n";
import { ButtonGroup } from "@ui/button-group";
import { SearchType } from "../../../../helper/search-query";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { DateOpt, SearchSort } from "../../consts";
import { FormControl } from "@ui/input";

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
          <Form.Group className="mt-3">
            <Form.Label>{_t("decks.author")}</Form.Label>
            <FormControl
              type="text"
              autoFocus={true}
              placeholder={_t("decks.username")}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{_t("search-comment.type")}</Form.Label>
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
          </Form.Group>
          <Form.Group>
            <Form.Label>{_t("search-comment.category")}</Form.Label>
            <FormControl
              type="text"
              placeholder={_t("search-comment.category-placeholder")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{_t("search-comment.tags")}</Form.Label>
            <FormControl
              type="text"
              placeholder={_t("search-comment.tags-placeholder")}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{_t("search-comment.date")}</Form.Label>
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
          </Form.Group>
          <Form.Group>
            <Form.Label>{_t("search-comment.sort")}</Form.Label>
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
          </Form.Group>
          <Form.Group>
            <Form.Check
              label={_t("search-comment.hide-low")}
              checked={hideLow}
              onChange={(e) => setHideLow(e.target.checked)}
            />
          </Form.Group>
        </>
      )}
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
