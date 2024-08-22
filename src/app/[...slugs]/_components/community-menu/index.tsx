"use client";

import React, { useEffect, useState } from "react";
import { Community } from "@/entities";
import { EntryFilter } from "@/enums";
import Link from "next/link";
import { DropdownItem } from "@ui/dropdown";
import i18next from "i18next";
import { ListStyleToggle } from "@/features/shared";
import { PageMenu, PageMenuItems, PageMenuLink, PageMenuMobileDropdown } from "@ui/page-menu";

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
    <PageMenu className="pb-4 pt-4 md:pt-0">
      <PageMenuMobileDropdown isSelected={isFilterInItems()} label={label}>
        {menuItems.map((x) => (
          <DropdownItem key={x} selected={props.filter === x}>
            <Link href={`/${x}/${props.community.name}`}>
              {i18next.t(`entry-filter.filter-${x}`)}
            </Link>
          </DropdownItem>
        ))}
      </PageMenuMobileDropdown>
      <PageMenuItems>
        {menuItems
          .map((x) => ({
            label: i18next.t(`entry-filter.filter-${x}`),
            href: `/${x}/${props.community.name}`,
            selected: props.filter === x
          }))
          .map((menuItem) => (
            <PageMenuLink
              label={menuItem.label}
              isSelected={menuItem.selected}
              href={menuItem.href!}
              key={`community-menu-item-${menuItem.label}`}
            />
          ))}
        <PageMenuLink
          href={`/subscribers/${props.community.name}`}
          isSelected={props.filter === "subscribers"}
          label={i18next.t("community.subscribers")}
        />
        <PageMenuLink
          href={`/activities/${props.community.name}`}
          isSelected={props.filter === "activities"}
          label={i18next.t("community.activities")}
        />
      </PageMenuItems>
      <div className="menu-items">
        <div className="hidden lg:flex items-center"></div>
      </div>
      {/*@ts-ignore*/}
      {EntryFilter[props.filter!] && <ListStyleToggle float="right" />}
    </PageMenu>
  );
};
