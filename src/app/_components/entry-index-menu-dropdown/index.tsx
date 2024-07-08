import React from "react";
import { useGlobalStore } from "@/core/global-store";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, MenuItem } from "@ui/dropdown";
import i18next from "i18next";
import { menuDownSvg } from "@ui/svg";

interface Props {
  isActive: boolean;
  isGlobal: boolean;
  onChangeGlobal: (v: string) => void;
  noReblog: boolean;
  handleFilterReblog: () => void;
}

// const feedUrlParams : string = window.location.pathname;
// const feedByUsername : string = feedUrlParams.substring(1, (feedUrlParams.length - 5));

export const EntryIndexMenuDropdown = ({
  isActive,
  noReblog,
  handleFilterReblog,
  onChangeGlobal,
  isGlobal
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const filter = useGlobalStore((s) => s.filter);
  const tag = useGlobalStore((s) => s.tag);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);

  let dropDownItems: MenuItem[] = [
    {
      label: <span>{i18next.t("entry-filter.filter-global")}</span>,
      selected: tag === "",
      onClick: () => onTagValueClick("")
    },
    {
      label: <span>{i18next.t("entry-filter.filter-community")}</span>,
      selected: tag === "my",
      onClick: () => onTagValueClick("my")
    }
  ];

  // if (filter === 'created') {
  //   dropDownItems = [
  //     ...dropDownItems,
  //     for adding new menu items - example shown below
  //     {
  //       label: <span>Now</span>,
  //       active: tag === "right_now",
  //       onClick: () => console.log('right_now clicked'),
  //     },
  //   ]
  // }

  if (filter === "rising") {
    dropDownItems = [
      {
        label: <span>{i18next.t("entry-filter.filter-today")}</span>,
        selected: tag === "today",
        onClick: () => onTagValueClick("today")
      },
      {
        label: <span>{i18next.t("entry-filter.filter-week")}</span>,
        selected: tag === "week",
        onClick: () => onTagValueClick("week")
      },
      {
        label: <span>{i18next.t("entry-filter.filter-month")}</span>,
        selected: tag === "month",
        onClick: () => onTagValueClick("month")
      },
      {
        label: <span>{i18next.t("entry-filter.filter-year")}</span>,
        selected: tag === "year",
        onClick: () => onTagValueClick("year")
      },
      {
        label: <span>{i18next.t("entry-filter.filter-alltime")}</span>,
        selected: tag === "all",
        onClick: () => onTagValueClick("all")
      }
    ];
  }
  if (filter === "controversial") {
    dropDownItems = [
      {
        label: <span>{i18next.t("entry-filter.filter-week")}</span>,
        selected: tag === "week",
        onClick: () => onTagValueClick("week")
      },
      {
        label: <span>{i18next.t("entry-filter.filter-month")}</span>,
        selected: tag === "month",
        onClick: () => onTagValueClick("month")
      },
      {
        label: <span>{i18next.t("entry-filter.filter-year")}</span>,
        selected: tag === "year",
        onClick: () => onTagValueClick("year")
      },
      {
        label: <span>{i18next.t("entry-filter.filter-alltime")}</span>,
        selected: tag === "all",
        onClick: () => onTagValueClick("all")
      }
    ];
  }

  if (filter === "feed") {
    dropDownItems = [
      {
        label: (
          <span>
            {noReblog
              ? i18next.t("entry-filter.filter-with-reblog")
              : i18next.t("entry-filter.filter-no-reblog")}
          </span>
        ),
        selected: tag === "no_reblog",
        onClick: () => onTagValueClick("no_reblog")
      }
    ];
  }

  const onTagValueClick = (key: string) => {
    if (key === "my" && !isActive) {
      toggleUIProp("login");
    } else if (key === "no_reblog") {
      handleFilterReblog();
    } else {
      onChangeGlobal(key);
    }
  };

  return (
    <Dropdown>
      <DropdownToggle>
        <div className="tagDropDown">
          <span className="pl-2" />
          {tag === ""
            ? i18next.t("entry-filter.filter-global")
            : tag === "my"
              ? i18next.t("entry-filter.filter-community")
              : tag === "today"
                ? i18next.t("entry-filter.filter-today")
                : tag === "week"
                  ? i18next.t("entry-filter.filter-week")
                  : tag === "month"
                    ? i18next.t("entry-filter.filter-month")
                    : tag === "year"
                      ? i18next.t("entry-filter.filter-year")
                      : tag === "all"
                        ? i18next.t("entry-filter.filter-alltime")
                        : tag === `@${activeUser?.username}` || tag.startsWith("@")
                          ? noReblog
                            ? i18next.t("entry-filter.filter-no-reblog")
                            : i18next.t("entry-filter.filter-with-reblog")
                          : tag}{" "}
          {menuDownSvg}
        </div>
        <DropdownMenu align="left">
          {dropDownItems.map((item, i) => (
            <DropdownItem key={i} onClick={item.onClick}>
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownToggle>
    </Dropdown>
  );
};
