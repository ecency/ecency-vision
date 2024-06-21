import { SearchDeckGridItem } from "../../types";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { DeckHeaderSettingsItem } from "../../header/deck-header-settings-item";
import { DateOpt, SearchSort } from "../../consts";
import useLocalStorage from "react-use/lib/useLocalStorage";
import "./_deck-search-column-settings.scss";
import { DeckGridContext } from "../../deck-manager";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import i18next from "i18next";
import { SearchType } from "@/utils/search-query";

interface Props {
  id: string;
  settings: SearchDeckGridItem["settings"];
}

export const DeckSearchColumnSettings = ({ id, settings }: Props) => {
  const { updateColumnSpecificSettings } = useContext(DeckGridContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  // Advanced settings
  const [query, setQuery] = useState(settings.query ?? "");
  const [lsDate, setLsDate] = useLocalStorage<string>("recent_date", DateOpt.W);
  const [author, setAuthor] = useState(settings.author ?? "");
  const [tags, setTags] = useState(settings.tags ?? "");
  const [type, setType] = useState(settings.type ?? "");
  const [category, setCategory] = useState(settings.category ?? "");
  const [date, setDate] = useState(settings.date ?? lsDate);
  const [sort, setSort] = useState(settings.sort ?? "");
  const [hideLow, setHideLow] = useState(settings.hideLow ?? false);

  useEffect(() => {
    setIsDisabled(!query);
  }, [query]);

  return (
    <DeckHeaderSettingsItem
      className="deck-search-column-settings"
      title={i18next.t("decks.columns.filters")}
      hasBorderBottom={false}
    >
      <div className="form-list">
        <FormControl
          type="text"
          autoFocus={true}
          placeholder={i18next.t("decks.columns.search-query")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FormControl
          type="text"
          autoFocus={true}
          placeholder={i18next.t("decks.username")}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <div className="grid grid-cols-2">
          <div>
            <FormControl
              type="select"
              value={type}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
            >
              {Object.values(SearchType).map((x) => (
                <option value={x} key={x}>
                  {i18next.t(`search-comment.type-${x}`)}
                </option>
              ))}
            </FormControl>
          </div>
          <div>
            <FormControl
              type="text"
              placeholder={i18next.t("search-comment.category-placeholder")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        <FormControl
          type="text"
          placeholder={i18next.t("search-comment.tags-placeholder")}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="grid grid-cols-2">
          <div>
            <FormControl
              type="select"
              value={date}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setDate(e.target.value)}
            >
              {Object.values(DateOpt).map((x) => (
                <option value={x} key={x}>
                  {i18next.t(`search-comment.date-${x}`)}
                </option>
              ))}
            </FormControl>
          </div>
          <div>
            <FormControl
              type="select"
              value={sort}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}
            >
              {Object.values(SearchSort).map((x) => (
                <option value={x} key={x}>
                  {i18next.t(`search-comment.sort-${x}`)}
                </option>
              ))}
            </FormControl>
          </div>
        </div>
        <FormControl
          type="checkbox"
          className="py-2"
          label={i18next.t("search-comment.hide-low")}
          checked={hideLow}
          onChange={(v) => setHideLow(v)}
        />
        <Button
          outline={true}
          size="sm"
          disabled={isLoading || isDisabled}
          onClick={() => {
            setIsLoading(true);
            updateColumnSpecificSettings(id, {
              query,
              author,
              type,
              category,
              tags,
              date,
              sort,
              hideLow
            });
            setTimeout(() => setIsLoading(false), 1000);
          }}
        >
          {isLoading ? i18next.t("g.applying") : i18next.t("g.apply")}
        </Button>
      </div>
    </DeckHeaderSettingsItem>
  );
};
