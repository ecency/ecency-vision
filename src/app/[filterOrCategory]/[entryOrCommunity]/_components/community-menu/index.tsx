import React, { useEffect, useState } from "react";
import "./_index.scss";
import { Community } from "@/entities";
import { EntryFilter } from "@/enums";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import i18next from "i18next";
import { classNameObject } from "@ui/util";
import { ListStyleToggle } from "@/features/shared";

interface Props {
  community: Community;
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

  const params = useSearchParams();

  useEffect(() => {
    const filter = params.get("filter");
    let newLabel: string | undefined;

    if (filter === EntryFilter.trending) {
      newLabel = i18next.t("community.posts");
    } else if (menuItems.some((item) => item === filter)) {
      newLabel = i18next.t(`entry-filter.filter-${filter}`);
    } else if (label && !newLabel) {
      newLabel = label;
    } else {
      newLabel = i18next.t(`entry-filter.filter-${menuItems[0]}`);
    }
    setLabel(newLabel);
  }, [params]);

  const isFilterInItems = () => menuItems.some((item) => params.get("filter") === item);

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
                  <DropdownItem key={x} selected={params.get("filter") === x}>
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
                selected: params.get("filter") === x
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
          href={`/subscribers/${params.get("name")}`}
          className={classNameObject({
            "community-menu-item flex": true,
            "selected-item": params.get("filter") === "subscribers"
          })}
        >
          {i18next.t("community.subscribers")}
        </Link>
        <Link
          href={`/activities/${params.get("name")}`}
          className={classNameObject({
            "community-menu-item flex": true,
            "selected-item": params.get("filter") === "activities"
          })}
        >
          {i18next.t("community.activities")}
        </Link>
      </div>

      {/*@ts-ignore*/}
      {EntryFilter[params.get("filter")!] && (
        <div className="page-tools">
          <ListStyleToggle />
        </div>
      )}
    </div>
  );
};
