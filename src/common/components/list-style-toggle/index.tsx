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
    toggleListStyle: (view: string | null) => void;
}

export default class ListStyleToggle extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(
            this.props.global.listStyle,
            nextProps.global.listStyle
        );
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
                active: global.listStyle === "grid",
                onClick: () => this.changeStyle("grid"),
            },
            {
                label: <span className="gridMenu">{listSvg} Classic</span>,
                active: global.listStyle === "row",
                onClick: () => this.changeStyle("row"),
            },
        ];

        const dropDownConfig = {
            history: history,
            label: (
                <span className="view-feed">
                    <span className="view-layout">{viewModuleSvg}</span>{" "}
                    <span className="menu-down-icon">{menuDownSvg}</span>
                </span>
            ),
            items: dropDownItems,
            //   preElem: preDropDownElem,
        };

        return (
            <div className="viewLayouts">
                <DropDown {...dropDownConfig} float="right" header="" />
            </div>
        );
    }
}
