import React, { Component } from "react";

import isEqual from "react-fast-compare";

import { Dropdown, DropdownButton } from "react-bootstrap";

import { Global } from "../../store/global/types";

import { ListStyle } from "../../store/global/types";

import Tooltip from "../tooltip";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import {
  viewModuleSvg,
  gridViewSvg,
  listSvg,
  viewStackedSvg,
} from "../../img/svg";

interface Props {
  global: Global;
  toggleListStyle: () => void;
}

export default class ListStyleToggle extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.global.listStyle, nextProps.global.listStyle);
  }

  changeStyle = (view) => {
    const { toggleListStyle } = this.props;

    toggleListStyle(view);
  };

  render() {
    const { global } = this.props;
    const { listStyle } = global;

    return (
      // <Tooltip content={_t("list-style.title")}>
      <DropdownButton
        title={
          <span className="btn-view">
            <i className="bi bi-list" /> {viewModuleSvg}
          </span>
        }
        className="feed-view"
        key="end"
      >
        <Dropdown.Item eventKey="grid" onClick={() => this.changeStyle("grid")}>
          {gridViewSvg} Card
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item eventKey="row" onClick={() => this.changeStyle("row")}>
          {listSvg} Classic
        </Dropdown.Item>
        {/* <Dropdown.Divider />
        <Dropdown.Item eventKey="3">{viewStackedSvg} Compact</Dropdown.Item> */}
      </DropdownButton>

      // <Dropdown>
      //   <Dropdown.Toggle>
      //     <span
      //       className={_c(
      //         `list-style-toggle ${
      //           listStyle === ListStyle.grid ? "toggled" : ""
      //         }`
      //       )}
      //       // onClick={() => {
      //       //   this.changeStyle();
      //       // }}
      //     >
      //       {viewModuleSvg}
      //     </span>
      //   </Dropdown.Toggle>

      //   <Dropdown.Menu>
      //     <Dropdown.Item>Action</Dropdown.Item>
      //     <Dropdown.Item>Another action</Dropdown.Item>
      //     <Dropdown.Item>Something else</Dropdown.Item>
      //   </Dropdown.Menu>
      // </Dropdown>
      // </Tooltip>
    );
  }
}
