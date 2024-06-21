import React, { useState } from "react";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import "./_index.scss";
import { searchPath } from "@/api/search-api";
import { useGlobalStore } from "@/core/global-store";
import { lookupAccounts } from "@/api/hive";
import { UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { useIsMobile } from "@/utils";

const Loading = () => <div>{i18next.t("g.loading")}</div>;

let timer: any = null;

export function TextareaAutocomplete(props: any) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const isMobile = useIsMobile();

  const [value, setValue] = useState(props.value);
  const [rows, setRows] = useState(props.minrows || 10);
  const [minrows, setMinrows] = useState(props.minrows || 10);
  const [maxrows, setMaxrows] = useState(props.maxrows || 20);

  const { rows: propRows, isComment, disableRows, ...other } = props;
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 992;
  const attrs = { ...other };

  if ((!disableRows || !isDesktop) && typeof window !== "undefined") {
    attrs.rows = isComment ? rows : rows;
  }

  const handleChange = (event: any) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 570;
    if (isMobile) {
      const textareaLineHeight = 24;

      const previousRows = event.target.rows;
      event.target.rows = minrows; // reset number of rows in textarea

      const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

      if (currentRows === previousRows) {
        event.target.rows = currentRows;
      }

      if (currentRows >= maxrows) {
        event.target.rows = maxrows;
        event.target.scrollTop = event.target.scrollHeight;
      }
      setRows(currentRows < maxrows ? currentRows : maxrows);
    }

    setValue(event.target.value);
    props.onChange(event);
  };

  return (
    <ReactTextareaAutocomplete
      {...attrs}
      loadingComponent={Loading}
      value={value}
      placeholder={props.placeholder}
      onChange={handleChange}
      {...(isComment ? {} : { boundariesElement: ".body-input" })}
      minChar={2}
      dropdownStyle={{ zIndex: 14 }}
      trigger={{
        ["@"]: {
          dataProvider: (token) => {
            clearTimeout(timer);
            return new Promise((resolve) => {
              timer = setTimeout(async () => {
                if (token.includes("/")) {
                  let ignoreList = [
                    "engine",
                    "wallet",
                    "points",
                    "communities",
                    "settings",
                    "permissions",
                    "comments",
                    "replies",
                    "blog",
                    "posts",
                    "feed",
                    "referrals",
                    "followers",
                    "following"
                  ];
                  let searchIsInvalid = ignoreList.some((item) => token.includes(`/${item}`));
                  if (!searchIsInvalid) {
                    searchPath(activeUser!.username, token).then((resp) => {
                      resolve(resp);
                    });
                  } else {
                    resolve([]);
                  }
                } else {
                  let suggestions = await lookupAccounts(token.toLowerCase(), 5);
                  resolve(suggestions);
                }
              }, 300);
            });
          },
          component: (props: any) => {
            let textToShow: string = props.entity.includes("/")
              ? props.entity.split("/")[1]
              : props.entity;
            let charLimit = isMobile ? 16 : 30;

            if (textToShow.length > charLimit && props.entity.includes("/")) {
              textToShow =
                textToShow.substring(0, charLimit - 5) +
                "..." +
                textToShow.substring(textToShow.length - 6, textToShow.length - 1);
            }

            return (
              <>
                {props.entity.includes("/") ? null : (
                  <UserAvatar username="props.entity" size="small" />
                )}
                <span style={{ marginLeft: "8px" }}>{textToShow}</span>
              </>
            );
          },
          output: (item: any, trigger) => `@${item}`
        }
      }}
    />
  );
}
