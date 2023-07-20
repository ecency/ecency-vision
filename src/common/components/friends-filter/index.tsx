import React, { useState } from 'react'
import DropDown from "../dropdown";
import { _t } from '../../i18n';
import { FilterFriendsType } from "../../enums";

interface Props{
    filterList: (type: FilterFriendsType) => Promise<void>;
    updateFilterType: (type: FilterFriendsType) => void;
}

export const FilterFriends = (props: Props) => {

    const { filterList, updateFilterType } = props;

    const [label, setLabel] = useState("");


    const dropDown = (
        <div className="friends-filter">
            <div className="filter-options">
            {(() => {
            let dropDownConfig: any;
            dropDownConfig = {
                history: "",
                label: label ? label : _t("friends-filter.filter"),
                items: [
                {
                    label: <span>{_t("friends-filter.all")}</span>,
                    onClick: () => {
                    setLabel(_t("friends-filter.all"));
                    filterList(FilterFriendsType.All);
                    updateFilterType(FilterFriendsType.All)
                }
                },
                {
                    label: <span>{_t("friends-filter.recently")}</span>,
                    onClick: () => {
                        setLabel(_t("friends-filter.recently"));
                        filterList(FilterFriendsType.Recently);
                    updateFilterType(FilterFriendsType.Recently)
                    }
                },
                {
                    label: <span>{_t("friends-filter.this-month")}</span>,
                    onClick: () => {
                    setLabel(_t("friends-filter.this-month"));
                    filterList(FilterFriendsType.ThisMonth);
                    updateFilterType(FilterFriendsType.ThisMonth)
                    }
                },
                {
                    label: <span>{_t("friends-filter.this-year")}</span>,
                    onClick: () => {
                    setLabel(_t("friends-filter.this-year"));
                    filterList(FilterFriendsType.ThisYear);
                    updateFilterType(FilterFriendsType.ThisYear)
                    }
                },
                {
                    label: <span>{_t("friends-filter.one-year")}</span>,
                    onClick: () => {
                    setLabel(_t("friends-filter.one-year"));
                    filterList(FilterFriendsType.OneYear);
                    updateFilterType(FilterFriendsType.OneYear)
                    }
                },
                {
                    label: <span>{_t("friends-filter.two-years-more")}</span>,
                    onClick: () => {
                    setLabel(_t("friends-filter.two-years-more"));
                    filterList(FilterFriendsType.MoreThanOneYear);
                    updateFilterType(FilterFriendsType.MoreThanOneYear)
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
