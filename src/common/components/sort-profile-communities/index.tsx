import React, { useState, useEffect } from "react";
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";
import { sortSvg } from "../../img/svg";
import "./_index.scss";

export const SortCommunities = (props: any) => {
  const { sortCommunitiesInAsc, sortCommunitiesInDsc } = props;

  const [label, setLabel] = useState(_t("sort-trending-tags.sort"));

  let dropDownItems: MenuItem[] = [
    {
      label: <span id="ascending">{_t("sort-trending-tags.ascending")}</span>,
      onClick: () => {
        sortCommunitiesInAsc();
        setLabel(`${_t("sort-trending-tags.ascending")}`);
      }
    },
    {
      label: <span id="descending">{_t("sort-trending-tags.descending")}</span>,
      onClick: () => {
        sortCommunitiesInDsc();
        setLabel(`${_t("sort-trending-tags.descending")}`);
      }
    }
  ];

  return (
    <div className="sort-dropdown">
      <div>
        {(() => {
          let dropDownConfig: any;
          dropDownConfig = {
            history: null,
            label: label,
            items: dropDownItems
          };
          return (
            <div className="amount-actions">
              <span className="sort-svg">{sortSvg} </span>
              <DropDown {...dropDownConfig} header="" float="top" />
            </div>
          );
        })()}
      </div>
    </div>
  );
};
