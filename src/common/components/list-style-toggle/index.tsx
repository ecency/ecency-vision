import React, { Component } from "react";

import isEqual from "react-fast-compare";

// import { Dropdown, DropdownButton } from "react-bootstrap";
import DropDown, {MenuItem} from "../dropdown";

import { Global } from "../../store/global/types";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import {
    viewModuleSvg,
    gridView,
    listView,
    menuDownSvg,
    viewStackedSvg,
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
        debugger
        toggleListStyle(view);
    };

    render() {
        const { global } = this.props;
        const { listStyle } = global;
        debugger
        const dropDownItems: MenuItem[] = [
            {
                label: <span className="gridMenu">{gridView} {_t("layouts.grid")}</span>,
                active: listStyle === "grid",
                onClick: () => {this.changeStyle("grid")},
            },
            {
                label: <span className="gridMenu">{listView} {_t("layouts.classic")}</span>,
                active: listStyle === "row",
                onClick: () => {this.changeStyle("row")},
            },
            {
                label: <span className="gridMenu">{viewStackedSvg} {_t("layouts.deck")}</span>,
                active: listStyle === "deck",
                onClick: () => {this.changeStyle("deck")},
            },
        ];

        const dropDownConfig = {
            history: null,
            label: (
                <span className="view-feed">
                    <span className="view-layout">{viewModuleSvg}</span>{" "}
                    <span className="menu-down-icon">{menuDownSvg}</span>
                </span>
            ),
            items: dropDownItems,
            preElem: undefined,
        };
        return (
            <div className="viewLayouts">
                <DropDown {...dropDownConfig} float="right" header="" />
            </div>
        );
    }
}
