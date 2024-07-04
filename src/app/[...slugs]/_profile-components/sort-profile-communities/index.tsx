import React, { useState } from "react";
import "./_index.scss";
import i18next from "i18next";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, MenuItem } from "@ui/dropdown";
import { sortSvg } from "@ui/svg";

export const SortCommunities = (props: any) => {
  const { sortCommunitiesInAsc, sortCommunitiesInDsc } = props;

  const [label, setLabel] = useState(i18next.t("sort-trending-tags.sort"));

  let dropDownItems: MenuItem[] = [
    {
      label: <span id="ascending">{i18next.t("sort-trending-tags.ascending")}</span>,
      onClick: () => {
        sortCommunitiesInAsc();
        setLabel(`${i18next.t("sort-trending-tags.ascending")}`);
      }
    },
    {
      label: <span id="descending">{i18next.t("sort-trending-tags.descending")}</span>,
      onClick: () => {
        sortCommunitiesInDsc();
        setLabel(`${i18next.t("sort-trending-tags.descending")}`);
      }
    }
  ];

  return (
    <div className="sort-dropdown">
      <div>
        <div className="amount-actions">
          <span className="sort-svg">{sortSvg}</span>
          <Dropdown>
            <DropdownToggle>{label}</DropdownToggle>
            <DropdownMenu align="top">
              {dropDownItems.map((item, i) => (
                <DropdownItem key={i} onClick={item.onClick}>
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
