import React, { useMemo, useState } from "react";
import i18next from "i18next";
import { FilterFriendsType } from "@/enums";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";

interface Props {
  updateFilterType: (type: FilterFriendsType) => void;
}

export const FilterFriends = ({ updateFilterType }: Props) => {
  const [label, setLabel] = useState("");
  const items = useMemo(
    () => [
      {
        label: <span>{i18next.t("friends-filter.all")}</span>,
        onClick: () => {
          setLabel(i18next.t("friends-filter.all"));
          updateFilterType(FilterFriendsType.All);
        }
      },
      {
        label: <span>{i18next.t("friends-filter.recently")}</span>,
        onClick: () => {
          setLabel(i18next.t("friends-filter.recently"));
          updateFilterType(FilterFriendsType.Recently);
        }
      },
      {
        label: <span>{i18next.t("friends-filter.this-month")}</span>,
        onClick: () => {
          setLabel(i18next.t("friends-filter.this-month"));
          updateFilterType(FilterFriendsType.ThisMonth);
        }
      },
      {
        label: <span>{i18next.t("friends-filter.this-year")}</span>,
        onClick: () => {
          setLabel(i18next.t("friends-filter.this-year"));
          updateFilterType(FilterFriendsType.ThisYear);
        }
      },
      {
        label: <span>{i18next.t("friends-filter.one-year")}</span>,
        onClick: () => {
          setLabel(i18next.t("friends-filter.one-year"));
          updateFilterType(FilterFriendsType.OneYear);
        }
      },
      {
        label: <span>{i18next.t("friends-filter.two-years-more")}</span>,
        onClick: () => {
          setLabel(i18next.t("friends-filter.two-years-more"));
          updateFilterType(FilterFriendsType.MoreThanOneYear);
        }
      }
    ],
    [updateFilterType]
  );

  return (
    <div>
      <div className="friends-filter">
        <div className="filter-options">
          <div className="dropdown-wrapper">
            <Dropdown>
              <DropdownToggle>{label ? label : i18next.t("friends-filter.filter")}</DropdownToggle>
              <DropdownMenu>
                {items.map((item, i) => (
                  <DropdownItem key={i} onClick={item.onClick}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};
