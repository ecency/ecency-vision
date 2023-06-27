import React from "react";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import "@webscopeio/react-textarea-autocomplete/style.css";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import { _t } from "../../i18n";

import { lookupAccounts } from "../../api/hive";
import { searchPath } from "../../api/search-api";
import { isMobile } from "../../util/is-mobile";
import NoSSR from "../../util/no-ssr";
import "./_index.scss";

interface State {
  value: string;
  rows: number;
  minrows: number;
  maxrows: number;
}

const Loading = () => <div>{_t("g.loading")}</div>;

let timer: any = null;

export default class TextareaAutocomplete extends BaseComponent<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: this.props.value,
      rows: this.props.minrows || 10,
      minrows: this.props.minrows || 10,
      maxrows: this.props.maxrows || 20
    };
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.props.value });
    }
  }

  handleChange = (event: any) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 570;
    if (isMobile) {
      const textareaLineHeight = 24;
      const { minrows, maxrows } = this.state;

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
      this.setState({
        rows: currentRows < maxrows ? currentRows : maxrows
      });
    }

    this.setState({
      value: event.target.value
    });
    this.props.onChange(event);
  };

  render() {
    const { activeUser, rows, isComment, disableRows, ...other } = this.props;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 992;
    const attrs = { ...other };

    if ((!disableRows || !isDesktop) && typeof window !== "undefined") {
      attrs.rows = isComment ? rows : this.state.rows;
    }

    return (
      <NoSSR>
        <ReactTextareaAutocomplete
          {...attrs}
          loadingComponent={Loading}
          value={this.state.value}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
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
                        searchPath(activeUser, token).then((resp) => {
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
                let charLimit = isMobile() ? 16 : 30;

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
      </NoSSR>
    );
  }
}
