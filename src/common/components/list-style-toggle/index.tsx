import React, { Component } from "react";

import isEqual from "react-fast-compare";

// import { Dropdown, DropdownButton } from "react-bootstrap";
import DropDown from "../dropdown";

import { Global } from "../../store/global/types";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import {
  viewModuleSvg,
  gridViewSvg,
  listSvg,
  menuDownSvg,
} from "../../img/svg";

interface Props {
  global: Global;
  toggleListStyle: (view: string) => void;
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
    const { global } = this.props;
    const { listStyle } = global;

    const dropDownItems = [
      {
        label: <span className="gridMenu">{gridViewSvg} Card</span>,
        onClick: () => this.changeStyle("grid"),
      },
      {
        label: <span className="gridMenu">{listSvg} Classic</span>,
        onClick: () => this.changeStyle("row"),
      },
    ];

    const dropDownConfig = {
      history: history,
      label: (
        <span className='view-feed'>
          <span className='view-layout'>{viewModuleSvg}</span>{" "}
          <span className="menu-down-icon" >
            {menuDownSvg}
          </span>
        </span>
      ),
      items: dropDownItems,
      //   preElem: preDropDownElem,
    };

    return (
      <DropDown {...dropDownConfig} float="right" header="" />

      // <Tooltip content={_t("list-style.title")}>
      // <DropdownButton
      //   title={
      //     <span className="btn-view">
      //       <i className="bi bi-list" /> {viewModuleSvg}
      //     </span>
      //   }
      //   className="feed-view"
      //   key="end"
      // >
      //   <Dropdown.Item eventKey="grid" onClick={() => this.changeStyle("grid")}>
      //     {gridViewSvg} Card
      //   </Dropdown.Item>
      //   <Dropdown.Divider />
      //   <Dropdown.Item eventKey="row" onClick={() => this.changeStyle("row")}>
      //     {listSvg} Classic
      //   </Dropdown.Item>
      // </DropdownButton>
    );
  }
}
