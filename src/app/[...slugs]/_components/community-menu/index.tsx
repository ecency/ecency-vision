"use client";

import React, { useEffect, useState } from "react";
import "./_index.scss";
import { Community } from "@/entities";
import { EntryFilter } from "@/enums";
import Link from "next/link";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import i18next from "i18next";
import { classNameObject } from "@ui/util";
import { ListStyleToggle } from "@/features/shared";

interface Props {
  community: Community;
  filter: string;
}

export const CommunityMenu = (props: Props) => {
  const [menuItems, setMenuItems] = useState([
    EntryFilter.trending,
    EntryFilter.hot,
    EntryFilter.created,
    EntryFilter.payout,
    EntryFilter.muted
  ]);
  const [label, setLabel] = useState<string>(EntryFilter.hot);

  useEffect(() => {
    let newLabel: string | undefined;

    if (props.filter === EntryFilter.trending) {
      newLabel = i18next.t("community.posts");
    } else if (menuItems.some((item) => item === props.filter)) {
      newLabel = i18next.t(`entry-filter.filter-${props.filter}`);
    } else if (label && !newLabel) {
      newLabel = label;
    } else {
      newLabel = i18next.t(`entry-filter.filter-${menuItems[0]}`);
    }
    setLabel(newLabel);
  }, [props.filter, label, menuItems]);

  const isFilterInItems = () => menuItems.some((item) => props.filter === item);

  return (
    <div className="community-menu">
      <div className="menu-items">
        <>
          <span
            className={
              "flex community-menu-item lg:hidden " + (isFilterInItems() ? "selected-item" : "")
            }
          >
            <Dropdown>
              <DropdownToggle>{label}</DropdownToggle>
              <DropdownMenu align="left">
                {menuItems.map((x) => (
                  <DropdownItem key={x} selected={props.filter === x}>
                    <Link href={`/${x}/${props.community.name}`}>
                      {i18next.t(`entry-filter.filter-${x}`)}
                    </Link>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </span>
          <div className="hidden lg:flex items-center">
            {menuItems
              .map((x) => ({
                label: i18next.t(`entry-filter.filter-${x}`),
                href: `/${x}/${props.community.name}`,
                selected: props.filter === x
              }))
              .map((menuItem) => (
                <Link
                  className={classNameObject({
                    "community-menu-item flex": true,
                    "selected-item": menuItem.selected
                  })}
                  href={menuItem.href!}
                  key={`community-menu-item-${menuItem.label}`}
                >
                  {menuItem.label}
                </Link>
              ))}
          </div>
        </>

        <Link
          href={`/subscribers/${props.community.name}`}
          className={classNameObject({
            "community-menu-item flex": true,
            "selected-item": props.filter === "subscribers"
          })}
        >
          {i18next.t("community.subscribers")}
        </Link>
        <Link
          href={`/activities/${props.community.name}`}
          className={classNameObject({
            "community-menu-item flex": true,
            "selected-item": props.filter === "activities"
          })}
        >
          {i18next.t("community.activities")}
        </Link>
      </div>

      {/*@ts-ignore*/}
      {EntryFilter[props.filter!] && (
        <div className="page-tools">
          <ListStyleToggle />
        </div>
      )}
    </div>
  );
};
