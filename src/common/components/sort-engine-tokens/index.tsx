import React, { useState, useEffect } from 'react'
import DropDown, { MenuItem } from "../dropdown";
import { _t } from "../../i18n";

export const SortEngineTokens = () => {
    
    

  return (

    <div className="balance-values">
    <div className="amount">
      {(() => {
        let dropDownConfig: any;
          dropDownConfig = {
            history: "",
            label: "",
            items: [
              {
                label: _t("sort-engine-tokens.sort-in-ascending"),
                onClick: () => {
               
                }
              },
              {
                label: _t("sort-engine-tokens.sort-in-descending"),
                onClick: () => {
                  
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-balance"),
                onClick: () => {
                 
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-stake"),
                onClick: () => {
                 
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-delegations-in"),
                onClick: () => {
                  
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-delegations-out"),
                onClick: () => {
                 
                }
              },
              {
                label: _t("sort-engine-tokens.sort-by-precision"),
                onClick: () => {
                 
                }
              }
            ]
          };
        return (
          <div className="amount-actions">
           <DropDown {...dropDownConfig} label={"Sort engine tokens"} float="top" />
          </div>
        );
      })()}

    </div>
    </div>
  )
}
