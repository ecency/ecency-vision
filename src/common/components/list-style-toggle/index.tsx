import React, { Component } from "react";

import isEqual from "react-fast-compare";

import { State as GlobalState } from "../../store/global/types";

import { ListStyle } from "../../store/global/types";

import Tooltip from "../tooltip";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import { viewModuleSvg } from "../../img/svg";

interface Props {
  global: GlobalState;
  toggleListStyle: () => void;
}

export default class ListStyleToggle extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.global.listStyle, nextProps.global.listStyle);
  }

  changeStyle = () => {
    const { toggleListStyle } = this.props;

    toggleListStyle();
  };

  render() {
    const { global } = this.props;
    const { listStyle } = global;

    return (
      <Tooltip content={_t("list-style.title")}>
        <span
          className={_c(`list-style-toggle ${listStyle === ListStyle.grid ? "toggled" : ""}`)}
          onClick={() => {
            this.changeStyle();
          }}
        >
          {viewModuleSvg}
        </span>
      </Tooltip>
    );
  }
}
