import React, { Component } from "react";
import isEqual from "react-fast-compare";
import DropDown, { MenuItem } from "../dropdown";
import { Global } from "../../store/global/types";
import { _t } from "../../i18n";
import { viewModuleSvg, gridView, listView, menuDownSvg, viewStackedSvg } from "../../img/svg";
import "./_index.scss";

interface Props {
  global: Global;
  toggleListStyle: (view: string | null) => void;
  iconClass?: string;
  float?: "left" | "right";
}

export default class ListStyleToggle extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.global.listStyle, nextProps.global.listStyle);
  }

  changeStyle = (view: string) => {
    const { toggleListStyle } = this.props;
    toggleListStyle(view);
  };

  render() {
    const { global, iconClass, float } = this.props;
    const { listStyle } = global;
    const dropDownItems: MenuItem[] = [
      {
        label: (
          <span className="gridMenu">
            {gridView} {_t("layouts.grid")}
          </span>
        ),
        selected: listStyle === "grid",
        onClick: () => {
          this.changeStyle("grid");
        }
      },
      {
        label: (
          <span className="gridMenu">
            {listView} {_t("layouts.classic")}
          </span>
        ),
        selected: listStyle === "row",
        onClick: () => {
          this.changeStyle("row");
        }
      }
    ];
    const dropDownConfig = {
      history: null,
      label: (
        <span className="view-feed">
          <span className={`view-layout ${iconClass ? iconClass : ""}`}>{viewModuleSvg}</span>{" "}
          <span className={`menu-down-icon ${iconClass ? iconClass : ""}`}>{menuDownSvg}</span>
        </span>
      ),
      items: dropDownItems,
      preElem: undefined
    };
    return (
      <div className="viewLayouts">
        <DropDown {...dropDownConfig} float={float || "right"} header="" />
      </div>
    );
  }
}
