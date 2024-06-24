import i18next from "i18next";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import React, { useEffect, useState } from "react";
import * as ls from "@/utils/local-storage";
import { SearchQuery, SearchType } from "@/utils/search-query";
import { DateOpt } from "@/enums";
import { SearchSort } from "@/app/decks/_components/consts";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchAdvancedForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState<SearchType>(SearchType.ALL);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useLocalStorage<DateOpt>("recent_date");
  const [sort, setSort] = useState<SearchSort>(SearchSort.NEWEST);
  const [hideLow, setHideLow] = useState(false);

  useEffect(() => {
    const q = params.get("q");
    if (q) {
      const searchQuery = new SearchQuery(q);
      setAuthor(searchQuery.author);
      setType(searchQuery.type);
      setCategory(searchQuery.category);
      setTags(searchQuery.tags.join(","));
      setSearch(searchQuery.query);
    }

    setSort((params.get("sort") as SearchSort) ?? SearchSort.NEWEST);
    setHideLow(params.get("hd") !== "0");
    setDate((params.get("date") as DateOpt) ?? DateOpt.M);
  }, [params]);

  const searchChanged = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearch(e.currentTarget.value);
  const authorChanged = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setAuthor(e.target.value.trim());
  const typeChanged = (e: React.ChangeEvent<HTMLSelectElement>): void =>
    setType(e.target.value as SearchType);
  const categoryChanged = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setCategory(e.target.value.trim());
  const tagsChanged = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setTags(e.target.value.trim());
  const dateChanged = (e: React.ChangeEvent<HTMLSelectElement>): void =>
    setDate(e.target.value as DateOpt);

  const sortChanged = (e: React.ChangeEvent<HTMLSelectElement>): void =>
    setSort(e.target.value as SearchSort);

  const textInputDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      apply();
    }
  };

  const buildQuery = () => {
    let q = search;

    if (author) {
      q += ` author:${author}`;
    }

    if (type) {
      q += ` type:${type}`;
    }

    if (category) {
      q += ` category:${category}`;
    }

    if (tags) {
      q += ` tag:${tags}`;
    }

    return q;
  };

  const apply = () => {
    const q = buildQuery();

    const params = new URLSearchParams();
    params.append("q", q);
    params.append("date", date ?? DateOpt.M);
    params.append("sort", sort);
    params.append("adv", "1");
    if (!hideLow) params.append("hd", "0");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="advanced-section">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 sm:col-span-4 mb-4">
          <label>{i18next.t("search-comment.search")}</label>
          <FormControl
            type="text"
            placeholder={i18next.t("search-comment.search-placeholder")}
            value={search}
            onChange={searchChanged}
            onKeyDown={textInputDown}
          />
        </div>
        <div className="col-span-12 sm:col-span-4 mb-4">
          <label>{i18next.t("search-comment.author")}</label>
          <FormControl
            type="text"
            placeholder={i18next.t("search-comment.author-placeholder")}
            value={author}
            onChange={authorChanged}
            onKeyDown={textInputDown}
          />
        </div>
        <div className="col-span-12 sm:col-span-2 mb-4">
          <label>{i18next.t("search-comment.type")}</label>
          <FormControl type="select" value={type} onChange={typeChanged}>
            {Object.values(SearchType).map((x) => (
              <option value={x} key={x}>
                {i18next.t(`search-comment.type-${x}`)}
              </option>
            ))}
          </FormControl>
        </div>
        <div className="col-span-12 sm:col-span-2 mb-4">
          <label>{i18next.t("search-comment.category")}</label>
          <FormControl
            type="text"
            placeholder={i18next.t("search-comment.category-placeholder")}
            value={category}
            onChange={categoryChanged}
            onKeyDown={textInputDown}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 sm:col-span-8 mb-4">
          <label>{i18next.t("search-comment.tags")}</label>
          <FormControl
            type="text"
            placeholder={i18next.t("search-comment.tags-placeholder")}
            value={tags}
            onChange={tagsChanged}
            onKeyDown={textInputDown}
          />
        </div>
        <div className="col-span-12 sm:col-span-2 mb-4">
          <label>{i18next.t("search-comment.date")}</label>
          <FormControl type="select" value={ls.get("recent_date", "month")} onChange={dateChanged}>
            {Object.values(DateOpt).map((x) => (
              <option value={x} key={x}>
                {i18next.t(`search-comment.date-${x}`)}
              </option>
            ))}
          </FormControl>
        </div>
        <div className="col-span-12 sm:col-span-2 mb-4">
          <label>{i18next.t("search-comment.sort")}</label>
          <FormControl type="select" value={sort} onChange={sortChanged}>
            {Object.values(SearchSort).map((x) => (
              <option value={x} key={x}>
                {i18next.t(`search-comment.sort-${x}`)}
              </option>
            ))}
          </FormControl>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <FormControl
          id="hide-low"
          type="checkbox"
          label={i18next.t("search-comment.hide-low")}
          checked={hideLow}
          onChange={(v) => setHideLow(v)}
        />

        <Button onClick={apply}>{i18next.t("g.apply")}</Button>
      </div>
    </div>
  );
}
