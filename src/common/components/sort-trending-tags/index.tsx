import React, { useState, useEffect } from "react"
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";
import { Button } from "react-bootstrap";

export const SortTrendingTagss = (props: any) => {

    const {
        sortTagsInAsc,
        sortTagsInDsc
      } = props;
    

    let dropDownItems: MenuItem[] = [
        {
          label: <span>{_t("sort-trending-tags.ascending")}</span>,
        onClick: () => sortTagsInAsc()
        },
        {
          label: <span>{_t("sort-trending-tags.descending")}</span>,
        onClick: () => sortTagsInDsc()
        }
      ];

  return (

    <div>
    <div>
        <Button  className="sort-btn" style={{backgroundColor: "#2e3d51"}}>
      {(() => {
        let dropDownConfig: any;
          dropDownConfig = {
            history: null,
            label:  (
                    sortTagsInAsc() 
                    ? _t("sort-trending-tags.ascending")
                    : sortTagsInDsc()
                    ? _t("sort-trending-tags.descending")
                    : null 
            ),
            items: dropDownItems
          };
        return (
          <div className="amount-actions">
           <DropDown {...dropDownConfig} header="" float="top" />
          </div>
        );
      })()}
        </Button>

    </div>
    </div>
  )
}