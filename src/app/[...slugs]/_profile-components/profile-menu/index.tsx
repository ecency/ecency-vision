"use client";

import React from "react";
import { ListStyleToggle } from "@/features/shared";
import { ProfileFilter } from "@/enums";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import i18next from "i18next";
import { kebabMenuHorizontalSvg } from "@ui/svg";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import { PageMenu, PageMenuItems, PageMenuLink, PageMenuMobileDropdown } from "@/features/ui";

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
    })
  ];

  const dropDownMenuItems = [
    ...menuItems,
    ...(username === activeUser?.username
      ? kebabMenuItems
      : kebabMenuItems.filter((item) => item.id != "communities"))
  ];

  return (
    <PageMenu className="pb-4 pt-4 md:pt-0">
      <PageMenuMobileDropdown
        label={
          dropDownMenuItems.filter((item) => item.id === section).length > 0
            ? i18next.t(`profile.section-${section}`)
            : i18next.t(`profile.section-${dropDownMenuItems[0].id}`)
        }
        isSelected={false}
      >
        {dropDownMenuItems.map((item) => (
          <DropdownItem selected={item.selected} key={item.id}>
            <Link href={item.href}>{item.label}</Link>
          </DropdownItem>
        ))}
      </PageMenuMobileDropdown>
      <PageMenuItems>
        {menuItems.map((menuItem) => (
          <PageMenuLink
            href={menuItem.href!}
            key={`profile-menu-item-${menuItem.label}`}
            label={menuItem.label}
            isSelected={menuItem.selected}
          />
        ))}
        {username !== activeUser?.username && (
          <PageMenuLink
            isSelected={section === "communities"}
            href={`/@${username}/communities`}
            label={i18next.t(`profile.section-communities`)}
          />
        )}

        <PageMenuLink
          isSelected={["wallet", "points", "engine", "spk"].includes(section)}
          href={`/@${username}/wallet`}
          label={i18next.t(`profile.section-wallet`)}
        />

        {activeUser && activeUser.username === username && (
          <PageMenuLink
            isSelected={section === "settings"}
            href={`/@${username}/settings`}
            label={i18next.t(`profile.section-settings`)}
          />
        )}
        <Dropdown>
          <DropdownToggle>
            <Button
              noPadding={true}
              icon={kebabMenuHorizontalSvg}
              size="sm"
              appearance="gray-link"
            />
          </DropdownToggle>
          <DropdownMenu align="left">
            {kebabMenuItems.map((item) => (
              <DropdownItem selected={item.selected} key={item.id}>
                <Link href={item.href}>{item.label}</Link>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </PageMenuItems>
      {ProfileFilter[section as ProfileFilter] && <ListStyleToggle float="right" />}
    </PageMenu>
  );
}
