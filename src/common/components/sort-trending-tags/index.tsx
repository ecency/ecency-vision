import React, { useState, useEffect } from "react"
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";
import { Button } from "react-bootstrap";
// import  sortTagsInDsc from "../trending-tags-card";

export const SortTrendingTagss = (props: any) => {

  return (

    <div>
    <div>
        <Button  className="sort-btn" style={{backgroundColor: "#2e3d51"}}>
      {(() => {
        let dropDownConfig: any;
          dropDownConfig = {
            history: "",
            label: "",
            items: [
              {
                label: _t("sort-trending-tags.ascending"),
                onClick: () => {
                    
                }
              },
              {
                label: _t("sort-trending-tags.descending"),
                onClick: () => {
                
                }
              }
            ]
          };
        return (
          <div className="amount-actions">
           <DropDown {...dropDownConfig} label={"Sort tags"} float="top" />
          </div>
        );
      })()}
        </Button>

    </div>
    </div>
  )
}