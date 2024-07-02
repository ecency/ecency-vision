"use client";

import React from "react";
import "./_index.scss";
import { ListStyleToggle } from "@/features/shared";
import { ProfileFilter } from "@/enums";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import i18next from "i18next";
import { kebabMenuHorizontalSvg, menuDownSvg } from "@ui/svg";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";

interface Props {
  username: string;
  section: string;
}

export function ProfileMenu({ username, section }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const kebabMenuItems = ["trail", "replies", "communities"]
    .map((x) => ({
      label: i18next.t(`profile.section-${x}`),
      href: `/@${username}/${x}`,
      selected: section === x,
      id: x
    }))
    .filter((item) => !item.selected);

  const menuItems = [
    ...[ProfileFilter.blog, ProfileFilter.posts, ProfileFilter.comments].map((x) => {
      return {
        label: i18next.t(`profile.section-${x}`),
        href: `/@${username}/${x}`,
        selected: section === x,
        id: x
      };
    }),
    ...kebabMenuItems
  ];

  const dropDownMenuItems = [
    ...menuItems,
    ...(username === activeUser?.username
      ? kebabMenuItems
      : kebabMenuItems.filter((item) => item.id != "communities"))
  ];

  let showDropdown = dropDownMenuItems.filter((item) => item.id === section).length > 0;

  return (
    <div className="profile-menu">
      <div className="profile-menu-items">
        <>
          <span
            className={`flex lg:hidden ${showDropdown ? "selected-item profile-menu-item" : ""}`}
          >
            {showDropdown ? (
              <Dropdown>
                <DropdownToggle>
                  {dropDownMenuItems.filter((item) => item.id === section).length > 0
                    ? i18next.t(`profile.section-${section}`)
                    : ""}
                </DropdownToggle>
                <DropdownMenu align="left">
                  {dropDownMenuItems.map((item) => (
                    <DropdownItem selected={item.selected} key={item.id}>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Link
                className={`${!showDropdown ? "profile-menu-item " : ""}${
                  section === "blog" ? "selected-item" : ""
                }`}
                href={`/@${username}/blog`}
              >
                {i18next.t(`profile.section-blog`)}{" "}
                <span className="menu-down-icon">{menuDownSvg}</span>
              </Link>
            )}
          </span>
          <div className="hidden lg:flex items-center">
            {menuItems.map((menuItem) => (
              <Link
                className={`profile-menu-item flex ${menuItem.selected ? "selected-item" : ""}`}
                href={menuItem.href!}
                key={`profile-menu-item-${menuItem.label}`}
              >
                {menuItem.label}
              </Link>
            ))}
          </div>
        </>

        {username !== activeUser?.username && (
          <Link
            className={`profile-menu-item flex lg:hidden ${
              section === "communities" ? "selected-item" : ""
            }`}
            href={`/@${username}/communities`}
          >
            {i18next.t(`profile.section-communities`)}
          </Link>
        )}

        <Link
          className={`profile-menu-item flex ${
            ["wallet", "points", "engine", "spk"].includes(section) ? "selected-item" : ""
          }`}
          href={`/@${username}/wallet`}
        >
          {i18next.t(`profile.section-wallet`)}
        </Link>

        {activeUser && activeUser.username === username && (
          <Link
            className={`profile-menu-item flex ${section === "settings" ? "selected-item" : ""}`}
            href={`/@${username}/settings`}
          >
            {i18next.t(`profile.section-settings`)}
          </Link>
        )}
        <div className="kebab-icon entry-index-menu the-menu main-menu hidden lg:flex">
          <Dropdown>
            <DropdownToggle>{kebabMenuHorizontalSvg}</DropdownToggle>
            <DropdownMenu align="left">
              {kebabMenuItems.map((item) => (
                <DropdownItem selected={item.selected} key={item.id}>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="page-tools">
        {ProfileFilter[section as ProfileFilter] && <ListStyleToggle />}
      </div>
    </div>
  );
}
