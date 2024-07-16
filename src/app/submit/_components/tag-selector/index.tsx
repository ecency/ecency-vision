import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./_index.scss";
import { FormControl } from "@ui/input";
import i18next from "i18next";
import { error, SuggestionList } from "@/features/shared";
import { closeSvg, poundSvg } from "@ui/svg";
import { ItemInterface, ReactSortable } from "react-sortablejs";
import { useTrendingTagsQuery } from "@/api/queries";
import usePrevious from "react-use/lib/usePrevious";

interface Props {
  tags: string[];
  maxItem: number;
  onChange: (tags: string[]) => void;
  onValid: (value: boolean) => void;
}

export function TagSelector({ tags, onChange, onValid, maxItem }: Props) {
  const { data: trendingTags } = useTrendingTagsQuery();

  const [hasFocus, setHasFocus] = useState(false);
  const [value, setValue] = useState("");
  const [warning, setWarning] = useState("");
  const previousWarning = usePrevious(warning);

  const placeholder = useMemo(
    () =>
      tags && tags.length > 0
        ? i18next.t("tag-selector.placeholder-has-tags")
        : hasFocus
          ? i18next.t("tag-selector.placeholder-focus")
          : i18next.t("tag-selector.placeholder-empty"),
    [hasFocus, tags]
  );

  let suggestions = useMemo(
    () =>
      value
        ? trendingTags
            ?.filter((x: string) => x.toLowerCase().indexOf(value.toLowerCase()) === 0)
            .filter((x: string) => !tags.includes(x))
            .slice(0, 40)
        : [],
    [tags, trendingTags, value]
  );

  const focusInput = useCallback(() => {
    const input = document.getElementById("the-tag-input");
    input?.focus();
  }, []);
  const onFocus = useCallback(() => setHasFocus(true), []);
  const filter = useCallback((cats: string[]) => {
    cats.length > 10
      ? setWarning(i18next.t("tag-selector.limited_tags"))
      : cats.find((c) => c.length > 24)
        ? setWarning(i18next.t("tag-selector.limited_length"))
        : cats.find((c) => c.split("-").length > 2)
          ? setWarning(i18next.t("tag-selector.limited_dash"))
          : cats.find((c) => c.indexOf(",") >= 0)
            ? setWarning(i18next.t("tag-selector.limited_space"))
            : cats.find((c) => /[A-Z]/.test(c))
              ? setWarning(i18next.t("tag-selector.limited_lowercase"))
              : cats.find((c) => !/^[a-z0-9-#]+$/.test(c))
                ? setWarning(i18next.t("tag-selector.limited_characters"))
                : cats.find((c) => !/^[a-z-#]/.test(c))
                  ? setWarning(i18next.t("tag-selector.limited_firstchar"))
                  : cats.find((c) => !/[a-z0-9]$/.test(c))
                    ? setWarning(i18next.t("tag-selector.limited_lastchar"))
                    : setWarning("");
  }, []);
  const add = useCallback(
    (value: string): boolean => {
      if (value === "") {
        return false;
      }

      if (tags.includes(value)) {
        return false;
      }

      if (tags.length >= maxItem) {
        error(i18next.t("tag-selector.error-max", { n: maxItem }));
        return false;
      }

      const newTags = [...tags, value];
      onChange(newTags);
      setValue("");
      return true;
    },
    [maxItem, onChange, tags]
  );
  const handlePaste = useCallback(
    async (e: any) => {
      let clipboardData, pastedData;

      e.stopPropagation();
      e.preventDefault();
      clipboardData = e.clipboardData;
      pastedData = clipboardData.getData("Text");
      setValue("");

      let isMultiTagsWithSpace = pastedData.split(" ").join(",").split("\n").join(",").split(",");
      if (isMultiTagsWithSpace.length > 1) {
        for (const item of isMultiTagsWithSpace) {
          await filter(item.split(" "));
          if (warning === "") {
            setTimeout(() => add(item), 250);
          }
        }
      }
    },
    [add, filter, warning]
  );
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        (13 === e.which || 13 === e.keyCode || 13 === e.charCode || "Enter" === e.key) &&
        warning === ""
      ) {
        e.preventDefault();
        add(value);
      }
    },
    [add, value, warning]
  );
  const deleteFn = useCallback(
    (tag: string) => {
      const newTags = tags.filter((x) => x !== tag);
      onChange(newTags);
    },
    [onChange, tags]
  );
  const onSort = useCallback(
    (items: ItemInterface[]) => {
      const newTags = items.map((x: ItemInterface) => x.name);
      onChange(newTags);
    },
    [onChange]
  );
  const onChangeFn = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLocaleLowerCase().trim().replace(/,/g, " ").replace(/#/g, "");
      let cats = value.split(" ");
      if (cats.length > 0) {
        filter(cats);
        setValue(cats.join(""));
      }

      const rawValue = e.target.value.toLocaleLowerCase();
      if (rawValue.endsWith(" ") || rawValue.endsWith(",")) {
        e.preventDefault();
        add(value);
      }
    },
    [add, filter]
  );
  const onBlur = useCallback(() => {
    setHasFocus(false);
    add(value);
  }, [add, value]);

  useEffect(() => {
    onValid(previousWarning !== warning && warning !== "");
  }, [warning, previousWarning, onValid]);

  return (
    <>
      <div
        id="submit-tags-selector"
        className={`tag-selector ${tags.length > 0 ? "has-tags" : ""}`}
      >
        <SuggestionList
          renderer={(x: string) => {
            return (
              <>
                {poundSvg} {x}
              </>
            );
          }}
          items={suggestions}
          listStyle={{
            top: "0"
          }}
          header={i18next.t("tag-selector.suggestion-header")}
          onSelect={(value: string) => {
            if (add(value)) {
              setTimeout(() => {
                // delay focus due to click out issue on suggestion list
                focusInput();
              }, 200);
            }
          }}
        >
          <FormControl
            type="text"
            noStyles={true}
            className="form-control px-3 py-1 w-full outline-none shadow-0"
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            tabIndex={0}
            onChange={onChangeFn}
            value={value}
            maxLength={24}
            onPaste={handlePaste}
            placeholder={placeholder}
            autoComplete="off"
            id="the-tag-input"
            spellCheck={true}
          />
        </SuggestionList>
        {warning && <span className="warning">{warning}</span>}
        {tags.length > 0 && (
          <ReactSortable
            animation={200}
            swapThreshold={1}
            ghostClass="tag-item-ghost"
            className="tag-list"
            list={[...tags.map((x) => ({ id: x, name: x }))]}
            setList={onSort}
            handle=".item-inner"
          >
            {tags.map((x) => {
              return (
                <div key={x} className="tag-item">
                  <div className="item-inner">
                    <span>{x}</span>
                  </div>
                  <span className="item-delete" onClick={() => deleteFn(x)}>
                    {closeSvg}
                  </span>
                </div>
              );
            })}
          </ReactSortable>
        )}
      </div>
    </>
  );
}
