import React, { useState } from 'react'
import DropDown from "../dropdown";
import { _t } from '../../i18n';

export const FilterFriends = (props: any) => {

    const { filter, updateFilterType } = props;

    const [label, setLabel] = useState("");

    const dropDown = (
        <div className="friends-filter">
            <div className="filter-options">
            {(() => {
            let dropDownConfig: any;
            dropDownConfig = {
                history: "",
                label: label ? label : "Filter",
                items: [
                {
                    label: <span>All</span>,
                    onClick: () => {
                    setLabel("All");
                    console.log(label)
                    filter("All");
                    updateFilterType("All")
                }
                },
                {
                    label: <span>Recently</span>,
                    onClick: () => {
                        setLabel("Recently");
                        console.log(label)
                        filter("Recently");
                    updateFilterType("Recently")
                    }
                },
                {
                    label: <span>This month</span>,
                    onClick: () => {
                    setLabel("This month");
                    filter("This month");
                    updateFilterType("This month")
                    }
                },
                {
                    label: <span>This year</span>,
                    onClick: () => {
                    setLabel("This year");
                    filter("This year");
                    updateFilterType("This year")
                    }
                },
                {
                    label: <span>One year</span>,
                    onClick: () => {
                    setLabel("One year");
                    filter("One year");
                    updateFilterType("One year")
                    }
                },
                {
                    label: <span>More than 1 year</span>,
                    onClick: () => {
                    setLabel("More than 1 year");
                    filter("More than 1 year");
                    updateFilterType("More than 1 year")
                    }
                }
                ]
            };
            return (
                <div className="dropdown-wrapper">
                <DropDown {...dropDownConfig} float="top" />
                </div>
            );
            })()}
            </div>
        </div>
    )

  return (
    <div>{dropDown}</div>
  )
}
