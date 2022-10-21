import React, { useState, useEffect } from "react"
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";;

export const SortCommunities = (props: any) => {

    const {
        sortCommunitiesInAsc,
        sortCommunitiesInDsc
      } = props;
      
      const [label, setLabel] = useState("sort tags");    

    let dropDownItems: MenuItem[] = [
        {
          label: <span>{_t("sort-trending-tags.ascending")}</span>,
        onClick: () => { sortCommunitiesInAsc()
        setLabel(`${_t("sort-trending-tags.ascending")}`)
      }
        },
        {
          label: <span>{_t("sort-trending-tags.descending")}</span>,
        onClick: () => { sortCommunitiesInDsc()
          setLabel(`${_t("sort-trending-tags.descending")}`)
        }}
      ];

  return (

    <div  className="sort-dropdown">
    <div>
      {(() => {
        let dropDownConfig: any;
          dropDownConfig = {
            history: null,
            label:  label,
            items: dropDownItems
          };
        return (
          <div className="amount-actions">
           <DropDown {...dropDownConfig} header="" float="top" />
          </div>
        );
      })()}
    </div>
    </div>
  );
};