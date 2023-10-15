import React, { useEffect, useState } from "react";
import { History, Location } from "history";
import { Link } from "react-router-dom";
import { match } from "react-router";
import { EntryFilter, Global } from "../../store/global/types";
import { Community } from "../../store/communities";
import ListStyleToggle from "../list-style-toggle/index";
import DropDown from "../dropdown";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import "./_index.scss";

interface MatchParams {
  filter: string;
  name: string;
}

interface Props {
  history: History;
  location: Location;
  match: match<MatchParams>;
  global: Global;
  community: Community;
  toggleListStyle: (view: string | null) => void;
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
    const { filter } = props.match.params;
    let newLabel: string | undefined;

    if (filter === EntryFilter.trending) {
      newLabel = _t("community.posts");
    } else if (menuItems.some((item) => item === filter)) {
      newLabel = _t(`entry-filter.filter-${filter}`);
    } else if (label && !newLabel) {
      newLabel = label;
    } else {
      newLabel = _t(`entry-filter.filter-${menuItems[0]}`);
    }
    setLabel(newLabel);
  }, [props.match.params]);

  const isFilterInItems = () => menuItems.some((item) => props.match.params.filter === item);

  return (
    <div className="community-menu">
      <div className="menu-items">
        <>
          <span
            className={
              "flex community-menu-item lg:hidden " + (isFilterInItems() ? "selected-item" : "")
            }
          >
            <DropDown
              history={props.history}
              label={label}
              items={menuItems.map((x) => ({
                label: _t(`entry-filter.filter-${x}`),
                href: `/${x}/${props.community.name}`,
                selected: props.match.params.filter === x
              }))}
              float="left"
            />
          </span>
          <div className="hidden lg:flex items-center">
            {menuItems
              .map((x) => ({
                label: _t(`entry-filter.filter-${x}`),
                href: `/${x}/${props.community.name}`,
                selected: props.match.params.filter === x
              }))
              .map((menuItem) => (
                <Link
                  className={_c(
                    `community-menu-item flex ${menuItem.selected ? "selected-item" : ""}`
                  )}
                  to={menuItem.href!}
                  key={`community-menu-item-${menuItem.label}`}
                >
                  {menuItem.label}
                </Link>
              ))}
          </div>
        </>

        <Link
          to={`/subscribers/${props.match.params.name}`}
          className={_c(
            `community-menu-item flex ${
              props.match.params.filter === "subscribers" ? "selected-item" : ""
            }`
          )}
        >
          {_t("community.subscribers")}
        </Link>
        <Link
          to={`/activities/${props.match.params.name}`}
          className={_c(
            `community-menu-item flex ${
              props.match.params.filter === "activities" ? "selected-item" : ""
            }`
          )}
        >
          {_t("community.activities")}
        </Link>
      </div>

      {EntryFilter[props.match.params.filter] && (
        <div className="page-tools">
          <ListStyleToggle global={props.global} toggleListStyle={props.toggleListStyle} />
        </div>
      )}
    </div>
  );
};
