import React, { useState, useEffect } from "react"
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";
import { Button } from "react-bootstrap";

export const SortTrendingTagss = (props: any) => {

    const {
        sortTagsInAsc,
        sortTagsInDsc
      } = props;
      
      const [label, setLabel] = useState("sort tags");    

    let dropDownItems: MenuItem[] = [
        {
          label: <span>{_t("sort-trending-tags.ascending")}</span>,
        onClick: () => { sortTagsInAsc()
        setLabel(`${_t("sort-trending-tags.ascending")}`)
      }
        },
        {
          label: <span>{_t("sort-trending-tags.descending")}</span>,
        onClick: () => { sortTagsInDsc()
          setLabel(`${_t("sort-trending-tags.descending")}`)
        }}
      ];

  return (

    <div  className="sort-dropdown">
    <div>
        {/* <Button  className="sort-btn" style={{backgroundColor: "#2e3d51"}}> */}
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
        {/* </Button> */}

    </div>
    </div>
  );
};