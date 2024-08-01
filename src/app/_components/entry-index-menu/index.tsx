"use client";

import React, { useEffect, useState } from "react";
import { EntryIndexMenuDropdown } from "../entry-index-menu-dropdown";
import "./_index.scss";
import { ActiveUser } from "@/entities";
import { ListStyleToggle } from "@/features/shared";
import {
  chevronDownSvgForSlider,
  informationVariantSvg,
  kebabMenuHorizontalSvg,
  menuDownSvg
} from "@ui/svg";
import Link from "next/link";
import { Introduction } from "@/app/_components/introduction";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { apiBase } from "@/api/helper";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, MenuItem } from "@ui/dropdown";
import { usePathname, useRouter } from "next/navigation";
import { EntryFilter } from "@/enums";
import useMount from "react-use/lib/useMount";
import * as ls from "@/utils/local-storage";
import { PREFIX } from "@/utils/local-storage";
import usePrevious from "react-use/lib/usePrevious";
import { Button } from "@ui/button";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { classNameObject } from "@ui/util";

export enum IntroductionType {
  FRIENDS = "FRIENDS",
  TRENDING = "TRENDING",
  HOT = "HOT",
  NEW = "NEW",
  NONE = "NONE"
}

export const isMyPage = (filter: string, tag: string, activeUser: ActiveUser | null) => {
  return (
    activeUser &&
    ((activeUser.username === tag.replace("@", "") && filter === "feed") || tag === "my")
  );
};

export const isActiveUser = (activeUser?: ActiveUser | null) => !!activeUser;

interface Props {
  filter: string;
  tag: string;
}

export function EntryIndexMenu({ filter, tag }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const activeUser = useGlobalStore((s) => s.activeUser);
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  const [noReblog, setNoReblog] = useLocalStorage(PREFIX + "my_reblog", false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [introduction, setIntroduction] = useState(IntroductionType.NONE);

  const prevActiveUser = usePrevious(activeUser);
  const prevFilter = usePrevious(filter);

  const isMy = isMyPage(filter, tag, activeUser);
  const dropdownLabel =
    isMy && filter === "feed"
      ? i18next.t("entry-filter.filter-feed-friends")
      : i18next.t(`entry-filter.filter-${filter}`);
  const isActive = isActiveUser(activeUser);
  const OurVision = apiBase(`/assets/our-vision.${canUseWebp ? "webp" : "png"}`);

  let secondaryMenu = [
    {
      label: i18next.t(`entry-filter.filter-controversial`),
      href: `/controversial/today`,
      selected: filter === "controversial",
      id: "controversial"
    },
    {
      label: i18next.t(`entry-filter.filter-rising`),
      href: `/rising/today`,
      selected: filter === "rising",
      id: "rising"
    }
  ];

  let rising = secondaryMenu.filter((f) => f.id === "rising");
  let controversial = secondaryMenu.filter((f) => f.id === "controversial");

  if (
    pathname.includes("rising") ||
    (!pathname.includes("controversial") && prevFilter === "rising")
  )
    secondaryMenu = [...rising, ...controversial];
  else secondaryMenu = [...controversial, ...rising];

  let menuTagValue = tag ? `/${tag}` : "";

  const menuItems: MenuItem[] = [
    ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
      return {
        label: i18next.t(`entry-filter.filter-${x}`),
        href: isActive
          ? filter === "feed" && !isGlobal
            ? `/${x}/my`
            : filter === "feed" && isGlobal
              ? `/${x}`
              : `/${x}${menuTagValue}`
          : tag[0] === "@"
            ? `/${x}`
            : `/${x}${menuTagValue}`,
        selected: (filter as unknown as EntryFilter) === x || filter === x + "/my",
        id: x,
        flash:
          (x === "trending" && introduction === IntroductionType.TRENDING) ||
          (x === "hot" && introduction === IntroductionType.HOT) ||
          (x === "created" && introduction === IntroductionType.NEW)
      };
    }),
    { ...secondaryMenu[0] }
  ];
  const kebabMenuItems: MenuItem[] = [{ ...secondaryMenu[1] }];

  const introductionOverlayClass =
    introduction === IntroductionType.NONE ? "hidden" : "overlay-for-introduction";
  const mobileItems: MenuItem[] = [
    {
      label: i18next.t(`entry-filter.filter-feed-friends`),
      href: `/@${activeUser?.username}/feed`,
      selected: filter === "feed",
      id: "feed"
    },
    ...menuItems,
    ...kebabMenuItems
  ];

  const onChangeGlobal = (value: string) => {
    setIsGlobal(!value);
    if (value === "my") {
      router.push(`/${filter}/my`);
    } else {
      router.push(`/${filter}/${value}`);
    }
  };

  const getPopupTitle = () => {
    let value = "";
    switch (introduction) {
      case IntroductionType.TRENDING:
        value = "filter-trending";
        break;
      case IntroductionType.HOT:
        value = "filter-hot";
        break;
      case IntroductionType.NEW:
        value = "filter-created";
        break;
      case IntroductionType.FRIENDS:
        value = "filter-feed-friends";
        break;
      default:
        break;
    }
    return i18next.t(`entry-filter.${value}`);
  };

  const onPreviousWeb = () => {
    let value = introduction;
    switch (value) {
      case IntroductionType.NEW:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.TRENDING;
        break;
      case IntroductionType.TRENDING:
        value =
          activeUser && isActiveUser(activeUser) ? IntroductionType.FRIENDS : IntroductionType.NONE;
        break;
      default:
        break;
    }
    setIntroduction(value);
  };

  const onNextMobile = () => {
    let value = introduction;
    switch (value) {
      case IntroductionType.TRENDING:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.NEW;
        break;
      case IntroductionType.FRIENDS:
        value = IntroductionType.TRENDING;
        break;
      case IntroductionType.NEW:
        value = IntroductionType.NONE;
        break;
      default:
        break;
    }
    setIntroduction(value);
  };

  const onNextWeb = () => {
    let value = introduction;
    switch (value) {
      case IntroductionType.TRENDING:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.NEW;
        break;
      case IntroductionType.NEW:
        value = IntroductionType.NONE;
        break;
      default:
        break;
    }
    setIntroduction(value);
  };

  const onClosePopup = () => setIntroduction(IntroductionType.NONE);

  const onPreviousMobile = () => {
    let value = introduction;
    switch (value) {
      case IntroductionType.NEW:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.TRENDING;
        break;
      case IntroductionType.TRENDING:
        value =
          activeUser && isActiveUser(activeUser) ? IntroductionType.FRIENDS : IntroductionType.NONE;
        break;
      case IntroductionType.FRIENDS:
        value = IntroductionType.NONE;
        break;
      default:
        break;
    }
    setIntroduction(value);
  };

  const introductionDescription = (
    <>
      {i18next.t("entry-filter.filter-global-part1")}
      <span className="text-capitalize">{i18next.t(`${getPopupTitle()}`)}</span>
      {introduction === IntroductionType.FRIENDS && i18next.t("entry-filter.filter-global-part4")}
      {introduction === IntroductionType.FRIENDS && (
        <Link className="text-blue-dark-sky" href="/discover">
          {" "}
          {i18next.t("entry-filter.filter-global-discover")}
        </Link>
      )}
      {isGlobal &&
        introduction !== IntroductionType.FRIENDS &&
        i18next.t("entry-filter.filter-global-part2")}
      {!isGlobal &&
        introduction !== IntroductionType.FRIENDS &&
        i18next.t("entry-filter.filter-global-part3")}
      {!isGlobal && introduction !== IntroductionType.FRIENDS && (
        <Link className="text-blue-dark-sky" href="/communities">
          {" "}
          {i18next.t("entry-filter.filter-global-join-communities")}
        </Link>
      )}
    </>
  );

  useMount(() => {
    if (introduction === IntroductionType.NONE) {
      if (typeof window !== "undefined") {
        document.getElementById("overlay") &&
          document.getElementById("overlay")!.classList.remove("overlay-for-introduction");
        document.getElementById("feed") &&
          document.getElementById("feed")!.classList.remove("active");
        document.getElementById(filter) && document.getElementById(filter)!.classList.add("active");
        document.getElementsByTagName("ul") &&
          document.getElementsByTagName("ul")[0] &&
          document.getElementsByTagName("ul")[0]!.classList.remove("flash");
        let entryIndexMenuElements = document.getElementsByClassName("entry-index-menu");
        entryIndexMenuElements &&
          entryIndexMenuElements.length > 1 &&
          entryIndexMenuElements[0] &&
          entryIndexMenuElements[0].classList.remove("entry-index-menu");
      }
    }

    let isGlobal = !pathname.includes("/my");
    if (activeUser && isActiveUser(activeUser) && pathname.includes(activeUser.username)) {
      isGlobal = false;
    }
    let showInitialIntroductionJourney =
      activeUser && isActiveUser(activeUser) && ls.get(`${activeUser.username}HadTutorial`);
    if (
      activeUser &&
      isActiveUser(activeUser) &&
      (showInitialIntroductionJourney === "false" || showInitialIntroductionJourney === null)
    ) {
      showInitialIntroductionJourney = true;
      ls.set(`${activeUser.username}HadTutorial`, "true");
    }
    if (showInitialIntroductionJourney === true) {
      showInitialIntroductionJourney = IntroductionType.FRIENDS;
    } else {
      showInitialIntroductionJourney = IntroductionType.NONE;
    }
    setIsGlobal(isGlobal);
    setIntroduction(showInitialIntroductionJourney);
  });

  useEffect(() => {
    if (pathname.includes("/my") && !isActiveUser(activeUser)) {
      router.push(pathname.replace("/my", ""));
    }
    // else if (!isActiveUser(activeUser) && (filter === 'feed')) {
    //     history.push('/trending')
    // }
    // else if (!isActiveUser(activeUser) && (prevProps.global.filter === 'feed') && (filter === 'trending' || filter === 'hot' || filter === 'created') && (tag.includes('@'))) {
    //     history.push(`/${filter}`)
    // }
    else if (!isActiveUser(prevActiveUser) !== !isActiveUser(activeUser) && filter !== "feed") {
      let isGlobalValue = !(tag.length > 0 && tag === "my");
      setIsGlobal(isGlobalValue);
    } else if (
      prevActiveUser &&
      activeUser &&
      prevActiveUser?.username !== activeUser?.username &&
      filter === "feed"
    ) {
      router.push(`/@${activeUser?.username}/${filter}`);
    } else if (
      ["controversial", "rising"].includes(prevFilter as string) &&
      !["controversial", "rising"].includes(filter)
    ) {
      if (tag && tag.includes("@")) {
        router.push(`/${tag}/${filter}`);
      } else {
        router.push(`/${filter}`);
      }
    } else if (["controversial", "rising"].includes(filter)) {
      const tagValue =
        tag && tag !== "my" && ["today", "week", "month", "year", "all"].includes(tag)
          ? "/" + tag
          : "/today";
      router.push(`/${filter}${tagValue}`);
    }
  }, [activeUser, filter, pathname, prevActiveUser, prevFilter, router, tag]);

  useEffect(() => {
    let showInitialIntroductionJourney =
      activeUser && isActiveUser(activeUser) && ls.get(`${activeUser.username}HadTutorial`);
    if (
      prevActiveUser !== activeUser &&
      activeUser &&
      isActiveUser(activeUser) &&
      (showInitialIntroductionJourney === "false" || showInitialIntroductionJourney === null)
    ) {
      showInitialIntroductionJourney = true;
      ls.set(`${activeUser.username}HadTutorial`, "true");
      setIntroduction(
        showInitialIntroductionJourney ? IntroductionType.FRIENDS : IntroductionType.NONE
      );
    }
    if (
      prevActiveUser !== activeUser &&
      !activeUser &&
      !isActiveUser(activeUser) &&
      ls.get(`${prevActiveUser?.username}HadTutorial`)
    ) {
      setIntroduction(IntroductionType.NONE);
    }
  }, [activeUser, prevActiveUser]);

  return (
    <div>
      <div className={introductionOverlayClass} id="overlay" onClick={onClosePopup} />
      <div className="entry-index-menu flex items-center justify-center md:justify-between p-[10px] border-b dark:border-dark-200">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-3xl lg:px-4 p-2 text-sm flex flex-col-reverse items-center md:flex-row">
          {isActive && (
            <div className="hidden lg:flex items-center mt-3 md:mt-0 md:mr-4 lg:mr-0">
              <ul
                className={`flex flex-wrap relative mb-0 ${
                  introduction === IntroductionType.NONE
                    ? ""
                    : introduction === IntroductionType.FRIENDS
                      ? "flash"
                      : ""
                }`}
              >
                <li>
                  <Link
                    href={`/@${activeUser?.username}/feed`}
                    className={classNameObject({
                      "text-gray-steel hover:text-blue-dark-sky rounded-full flex items-center px-3 py-1.5":
                        true,
                      "bg-blue-dark-sky text-white hover:text-white":
                        filter === "feed" &&
                        (introduction === IntroductionType.NONE ||
                          introduction === IntroductionType.FRIENDS)
                    })}
                    id="feed"
                  >
                    {i18next.t("entry-filter.filter-feed-friends")}
                  </Link>
                </li>
                {introduction !== IntroductionType.NONE &&
                introduction === IntroductionType.FRIENDS ? (
                  <Introduction
                    title={i18next.t("entry-filter.filter-feed-friends")}
                    media={OurVision}
                    onNext={() => {
                      let value = IntroductionType.TRENDING;
                      setIntroduction(value);
                    }}
                    onPrevious={() => {
                      let value = IntroductionType.NONE;
                      setIntroduction(value);
                    }}
                    onClose={onClosePopup}
                    description={introductionDescription}
                  />
                ) : null}
              </ul>
            </div>
          )}
          <div className="flex items-center">
            <div className="main-menu justify-center hidden lg:flex md:mb-0 md:items-center">
              <div className="block md:hidden relative">
                <Dropdown>
                  <DropdownToggle>
                    <Button size="sm" icon={chevronDownSvgForSlider} appearance="gray-link">
                      {dropdownLabel}
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu align="left">
                    {menuItems.map((item, i) => (
                      <DropdownItem key={i} onClick={item.onClick}>
                        {item.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="hidden lg:block">
                <ul className="flex flex-wrap mb-0">
                  {menuItems.map((i, k) => (
                    <li key={k} className={`${i.flash ? "flash" : ""}`}>
                      <Link
                        href={i.href!}
                        className={classNameObject({
                          "text-gray-steel hover:text-blue-dark-sky rounded-full flex items-center px-3 py-1.5":
                            true,
                          "bg-blue-dark-sky text-white hover:text-white":
                            i.selected &&
                            introduction === IntroductionType.NONE &&
                            !i.flash &&
                            i.selected,
                          [`link-${i.id}`]: true
                        })}
                        id={i.id}
                      >
                        {i.label}
                      </Link>
                    </li>
                  ))}
                  {introduction !== IntroductionType.NONE &&
                  introduction !== IntroductionType.FRIENDS &&
                  (introduction === IntroductionType.HOT ||
                    introduction === IntroductionType.TRENDING ||
                    introduction === IntroductionType.NEW) ? (
                    <Introduction
                      title={getPopupTitle()}
                      media={OurVision}
                      placement={
                        introduction === IntroductionType.TRENDING
                          ? "20%"
                          : introduction === IntroductionType.HOT
                            ? "25%"
                            : "30%"
                      }
                      onNext={onNextWeb}
                      onPrevious={onPreviousWeb}
                      onClose={onClosePopup}
                      description={introductionDescription}
                      showFinish={introduction === IntroductionType.NEW}
                    />
                  ) : null}
                </ul>
              </div>
              <div className="kebab-icon flex">
                <Dropdown>
                  <DropdownToggle>
                    <Button size="sm" appearance="gray-link" icon={kebabMenuHorizontalSvg} />
                  </DropdownToggle>
                  <DropdownMenu align="left">
                    {kebabMenuItems.map((item, i) => (
                      <DropdownItem key={i} onClick={item.onClick}>
                        {item.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

            <div className="main-menu justify-center flex lg:hidden md:mb-0 md:items-center">
              <div className="lg:hidden relative">
                <Dropdown>
                  <DropdownToggle>
                    <Button size="sm" icon={menuDownSvg} appearance="gray-link">
                      {dropdownLabel}
                    </Button>
                  </DropdownToggle>
                  <DropdownMenu align="left">
                    {mobileItems.map((item, i) => (
                      <DropdownItem key={i} onClick={item.onClick}>
                        {item.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
                {introduction !== IntroductionType.NONE ? (
                  <Introduction
                    title={getPopupTitle()}
                    media={OurVision}
                    onNext={onNextMobile}
                    onPrevious={onPreviousMobile}
                    onClose={onClosePopup}
                    description={introductionDescription}
                    showFinish={introduction === IntroductionType.NEW}
                  />
                ) : (
                  <></>
                )}
              </div>
              <div className="hidden lg:block">
                <ul className="flex flex-wrap">
                  {mobileItems.map((i, k) => (
                    <li key={k}>
                      <Link
                        href={i.href!}
                        className={classNameObject({
                          "text-gray-steel hover:text-blue-dark-sky rounded-full flex items-center px-3 py-1.5":
                            true,
                          active: i.selected,
                          [`link-${i.id}`]: true
                        })}
                      >
                        {i.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {filter !== "feed" ? (
              <>
                <div className="border-l border-[--border-color] ml-3 dropDown-left-border-height" />
                <span id="check-isGlobal" className="flex items-center pl-3">
                  <EntryIndexMenuDropdown
                    filter={filter}
                    tag={tag}
                    noReblog={noReblog!!}
                    handleFilterReblog={() => setNoReblog((v) => !v)}
                    isActive={isActive}
                    onChangeGlobal={onChangeGlobal}
                  />
                </span>
              </>
            ) : (
              <>
                <div className="border-l border-[--border-color] ml-3 dropDown-left-border-height" />
                <span id="check-isGlobal" className="flex items-center pl-3">
                  <EntryIndexMenuDropdown
                    filter={filter}
                    tag={tag}
                    noReblog={noReblog!!}
                    handleFilterReblog={() => setNoReblog((v) => !v)}
                    isActive={isActive}
                    onChangeGlobal={onChangeGlobal}
                  />
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center ml-auto md:ml-0 pl-3">
          <span
            className="info-icon mr-0 md:mr-2"
            onClick={() =>
              setIntroduction(
                filter === "feed"
                  ? IntroductionType.FRIENDS
                  : filter === "trending"
                    ? IntroductionType.TRENDING
                    : filter === "hot"
                      ? IntroductionType.HOT
                      : filter === "created"
                        ? IntroductionType.NEW
                        : IntroductionType.NONE
              )
            }
          >
            {informationVariantSvg}
          </span>
          <ListStyleToggle />
        </div>
      </div>
    </div>
  );
}
