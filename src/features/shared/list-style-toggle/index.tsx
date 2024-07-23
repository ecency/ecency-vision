import React from "react";
import "./_index.scss";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { gridView, listView, menuDownSvg, viewModuleSvg } from "@ui/svg";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { ListStyle } from "@/enums";

interface Props {
  iconClass?: string;
  float?: "left" | "right";
}

export function ListStyleToggle({ iconClass, float }: Props) {
  const listStyle = useGlobalStore((state) => state.listStyle);
  const changeStyle = useGlobalStore((state) => state.setListStyle);

  return (
    <div className="viewLayouts">
      <Dropdown>
        <DropdownToggle>
          <span className="view-feed">
            <span className={`view-layout ${iconClass ? iconClass : ""}`}>{viewModuleSvg}</span>{" "}
            <span className={`menu-down-icon ${iconClass ? iconClass : ""}`}>{menuDownSvg}</span>
          </span>
        </DropdownToggle>
        <DropdownMenu align={float ?? "left"}>
          <DropdownItem
            onClick={() => changeStyle(ListStyle.grid)}
            selected={listStyle === ListStyle.grid}
          >
            <span className="gridMenu">
              {gridView} {i18next.t("layouts.grid")}
            </span>
          </DropdownItem>
          <DropdownItem
            onClick={() => changeStyle(ListStyle.row)}
            selected={listStyle === ListStyle.row}
          >
            <span className="gridMenu">
              {listView} {i18next.t("layouts.classic")}
            </span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}