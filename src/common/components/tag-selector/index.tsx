import React, { Component } from "react";

import { History } from "history";

import { Form, FormControl } from "react-bootstrap";

import { Global } from "../../store/global/types";

import TagLink from "../tag-link";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import { closeSvg } from "../../img/svg";

interface Props {
  global: Global;
  history: History;
  tags: string[];
  onChange: (tags: string[]) => void;
}

interface State {
  blur: boolean;
  value: string;
}

export default class TagSelector extends Component<Props, State> {
  state: State = {
    blur: false,
    value: "",
  };

  onFocus = () => {
    this.setState({ blur: true });
  };

  onBlur = () => {
    this.setState({ blur: false });
  };

  onChange = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const value = e.target.value.trim();
    this.setState({ value });
  };

  onKeyDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      this.add();
    }
  };

  add = () => {
    const { value } = this.state;
    const { tags, onChange } = this.props;
    const newTags = [...tags, value];
    onChange(newTags);
    this.setState({ value: "" });
  };

  delete = (tag: string) => {
    const { tags, onChange } = this.props;
    const newTags = tags.filter((x) => x !== tag);
    onChange(newTags);
  };

  render() {
    const { tags } = this.props;
    const { blur, value } = this.state;
    const placeholder =
      tags.length > 0
        ? _t("tag-selector.placeholder-has-tags")
        : blur
        ? _t("tag-selector.placeholder-focus")
        : _t("tag-selector.placeholder-empty");

    return (
      <>
        <div className={_c(`tag-selector ${tags.length > 0 ? "has-tags" : ""}`)}>
          <FormControl
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
            value={value}
            maxLength={20}
            placeholder={placeholder}
          />
          {tags.length > 0 && (
            <div className="tag-list">
              {tags.map((x) => {
                return (
                  <div key={x} className="tag-item">
                    <div className="item-inner">
                      <TagLink {...this.props} tag={x}>
                        <span>{x}</span>
                      </TagLink>
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
            </div>
          )}
        </div>
      </>
    );
  }
}
