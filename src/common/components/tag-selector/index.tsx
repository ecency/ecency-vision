import React, { Component } from "react";

import { History } from "history";

import isEqual from "react-fast-compare";
import { ItemInterface, ReactSortable } from "react-sortablejs";

import { Global } from "../../store/global/types";
import { TrendingTags } from "../../store/trending-tags/types";

import SuggestionList from "../suggestion-list";
import { error } from "../feedback";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import { closeSvg, poundSvg } from "../../img/svg";
import "./_index.scss";
import { FormControl } from "@ui/input";

interface Props {
  global: Global;
  history: History;
  trendingTags: TrendingTags;
  tags: string[];
  maxItem: number;
  onChange: (tags: string[]) => void;
  onValid: (value: boolean) => void;
}

interface State {
  hasFocus: boolean;
  value: string;
  warning: string;
}

export class TagSelector extends Component<Props, State> {
  state: State = {
    hasFocus: false,
    value: "",
    warning: ""
  };

  constructor(props: any) {
    super(props);
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>): boolean {
    return !isEqual(this.props.tags, nextProps.tags) || !isEqual(this.state, nextState);
  }

  filter = (cats: string[]) => {
    cats.length > 10
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_tags") })
      : cats.find((c) => c.length > 24)
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_length") })
      : cats.find((c) => c.split("-").length > 2)
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_dash") })
      : cats.find((c) => c.indexOf(",") >= 0)
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_space") })
      : cats.find((c) => /[A-Z]/.test(c))
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_lowercase") })
      : cats.find((c) => !/^[a-z0-9-#]+$/.test(c))
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_characters") })
      : cats.find((c) => !/^[a-z-#]/.test(c))
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_firstchar") })
      : cats.find((c) => !/[a-z0-9]$/.test(c))
      ? this.setState({ ...this.state, warning: _t("tag-selector.limited_lastchar") })
      : this.setState({ ...this.state, warning: "" });
  };

  focusInput = () => {
    const input = document.getElementById("the-tag-input");
    input?.focus();
  };

  onFocus = () => {
    this.setState({ hasFocus: true });
  };

  onBlur = () => {
    this.setState({ hasFocus: false });
    const { value } = this.state;
    this.add(value);
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLocaleLowerCase().trim().replace(/,/g, " ").replace(/#/g, "");
    let cats = value.split(" ");
    if (cats.length > 0) {
      this.filter(cats);
      this.setState({ value: cats.join(" ") });
    }

    const rawValue = e.target.value.toLocaleLowerCase();
    if (rawValue.endsWith(" ") || rawValue.endsWith(",")) {
      e.preventDefault();
      const { value } = this.state;
      this.add(value);
    }
  };

  handlePaste = async (e: any) => {
    let clipboardData, pastedData;

    e.stopPropagation();
    e.preventDefault();
    clipboardData = e.clipboardData;
    pastedData = clipboardData.getData("Text");
    this.setState({ value: "" });

    let isMultiTagsWithSpace = pastedData.split(" ").join(",").split("\n").join(",").split(",");
    if (isMultiTagsWithSpace.length > 1) {
      for (const item of isMultiTagsWithSpace) {
        await this.filter(item.split(" "));
        if (this.state.warning === "") {
          setTimeout(() => this.add(item), 250);
        }
      }
    }
  };

  onKeyDown = (e: React.KeyboardEvent) => {
    if (
      (13 === e.which || 13 === e.keyCode || 13 === e.charCode || "Enter" === e.key) &&
      this.state.warning === ""
    ) {
      e.preventDefault();
      const { value } = this.state;
      this.add(value);
    }
  };

  add = (value: string): boolean => {
    const { tags, maxItem, onChange } = this.props;

    if (value === "") {
      return false;
    }

    if (tags.includes(value)) {
      return false;
    }

    if (tags.length >= maxItem) {
      error(_t("tag-selector.error-max", { n: maxItem }));
      return false;
    }

    const newTags = [...tags, value];
    onChange(newTags);
    this.setState({ value: "" });
    return true;
  };

  delete = (tag: string) => {
    const { tags, onChange } = this.props;
    const newTags = tags.filter((x) => x !== tag);
    onChange(newTags);
  };

  onSort = (items: ItemInterface[]) => {
    const { onChange } = this.props;
    const newTags = items.map((x: ItemInterface) => x.name);
    onChange(newTags);
  };

  componentDidUpdate(prevProps: any, prevState: any) {
    if (prevState.warning !== this.state.warning && this.state.warning !== "") {
      this.props.onValid(true);
    } else {
      this.props.onValid(false);
    }
  }

  render() {
    const { tags, trendingTags } = this.props;
    const { hasFocus, value } = this.state;
    const placeholder =
      tags && tags.length > 0
        ? _t("tag-selector.placeholder-has-tags")
        : hasFocus
        ? _t("tag-selector.placeholder-focus")
        : _t("tag-selector.placeholder-empty");

    let suggestions: string[] = [];

    if (value) {
      suggestions = trendingTags.list
        .filter((x: string) => x.toLowerCase().indexOf(value.toLowerCase()) === 0)
        .filter((x: string) => !tags.includes(x))
        .slice(0, 40);
    }

    return (
      <>
        <div className={_c(`tag-selector ${tags.length > 0 ? "has-tags" : ""}`)}>
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
            header={_t("tag-selector.suggestion-header")}
            onSelect={(value: string) => {
              if (this.add(value)) {
                setTimeout(() => {
                  // delay focus due to click out issue on suggestion list
                  this.focusInput();
                }, 200);
              }
            }}
          >
            <FormControl
              type="text"
              noStyles={true}
              className="form-control px-3 py-1 w-full outline-none shadow-0"
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              onKeyDown={this.onKeyDown}
              tabIndex={0}
              onChange={this.onChange}
              value={value}
              maxLength={24}
              onPaste={this.handlePaste}
              placeholder={placeholder}
              autoComplete="off"
              id="the-tag-input"
              spellCheck={true}
            />
          </SuggestionList>
          {this.state.warning && <span className="warning">{this.state.warning}</span>}
          {tags.length > 0 && (
            <ReactSortable
              animation={200}
              swapThreshold={1}
              ghostClass="tag-item-ghost"
              className="tag-list"
              list={[...tags.map((x) => ({ id: x, name: x }))]}
              setList={this.onSort}
              handle=".item-inner"
            >
              {tags.map((x) => {
                return (
                  <div key={x} className="tag-item">
                    <div className="item-inner">
                      <span>{x}</span>
                    </div>
                    <span
                      className="item-delete"
                      onClick={() => {
                        this.delete(x);
                      }}
                    >
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
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    history: p.history,
    trendingTags: p.trendingTags,
    tags: p.tags,
    maxItem: p.maxItem,
    onChange: p.onChange,
    onValid: p.onValid
  };

  return <TagSelector {...props} />;
};
