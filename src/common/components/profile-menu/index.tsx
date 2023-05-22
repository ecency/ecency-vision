import React, { Component } from "react";

import { Link } from "react-router-dom";

import { History, Location } from "history";

import isEqual from "react-fast-compare";

import { ProfileFilter, Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";

import DropDown, { MenuItem } from "../dropdown";
import ListStyleToggle from "../list-style-toggle/index";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";
import { kebabMenuHorizontalSvg, menuDownSvg } from "../../img/svg";
import "./_index.scss";

interface Props {
  history: History;
  location: Location;
  global: Global;
  username: string;
  section: string;
  activeUser: ActiveUser | null;
  toggleListStyle: (view: string | null) => void;
}

export class ProfileMenu extends Component<Props> {
  render() {
    const { username, section, activeUser } = this.props;

    const kebabMenuItems: MenuItem[] = ["trail", "replies", "communities"].map((x) => {
      return {
        label: _t(`profile.section-${x}`),
        href: `/@${username}/${x}`,
        selected: section === x,
        id: x
      };
    });

    const kebabMenuConfig = {
      history: this.props.history,
      label: "",
      icon: kebabMenuHorizontalSvg,
      items: kebabMenuItems.filter((item) => !item.selected)
    };

    const menuItems: MenuItem[] = [
      ...[ProfileFilter.blog, ProfileFilter.posts, ProfileFilter.comments].map((x) => {
        return {
          label: _t(`profile.section-${x}`),
          href: `/@${username}/${x}`,
          selected: section === x,
          id: x
        };
      })
    ];

    const menuConfig: {
      history: History;
      label: string;
      items: MenuItem[];
    } = {
      history: this.props.history,
      label: ProfileFilter[section] ? _t(`profile.section-${section}`) : "",
      items: [...menuItems, ...kebabMenuItems.filter((item) => item.selected)]
    };

    const dropDownMenuItems: MenuItem[] = [
      ...menuItems,
      ...kebabMenuItems.filter((item) => item.id != "communities")
    ];
    const dropDownMenuConfig: {
      history: History;
      label: string;
      items: MenuItem[];
    } = {
      history: this.props.history,
      label:
        dropDownMenuItems.filter((item) => item.id === section).length > 0
          ? _t(`profile.section-${section}`)
          : "",
      items: dropDownMenuItems
    };

    let showDropdown = dropDownMenuConfig.items.filter((item) => item.id === section).length > 0;

    return (
      <div className="profile-menu">
        <div className="profile-menu-items">
          <>
            <span
              className={`d-flex d-lg-none ${
                showDropdown ? "selected-item profile-menu-item" : ""
              }`}
            >
              {showDropdown ? (
                <DropDown {...dropDownMenuConfig} float="left" />
              ) : (
                <Link
                  className={_c(
                    `${!showDropdown ? "profile-menu-item " : ""}${
                      section === "blog" ? "selected-item" : ""
                    }`
                  )}
                  to={`/@${username}/blog`}
                >
                  {_t(`profile.section-blog`)} <span className="menu-down-icon">{menuDownSvg}</span>
                </Link>
              )}
            </span>
            <div className="d-none d-lg-flex align-items-center">
              {menuConfig.items.map((menuItem) => (
                <Link
                  className={_c(`profile-menu-item ${menuItem.selected ? "selected-item" : ""}`)}
                  to={menuItem.href!}
                  key={`profile-menu-item-${menuItem.label}`}
                >
                  {menuItem.label}
                </Link>
              ))}
            </div>
          </>

          <Link
            className={_c(
              `profile-menu-item d-lg-none ${section === "communities" ? "selected-item" : ""}`
            )}
            to={`/@${username}/communities`}
          >
            {_t(`profile.section-communities`)}
          </Link>
          <Link
            className={_c(
              `profile-menu-item ${
                ["wallet", "points", "engine", "spk"].includes(section) ? "selected-item" : ""
              }`
            )}
            to={`/@${username}/wallet`}
          >
            {_t(`profile.section-wallet`)}
          </Link>

          {activeUser && activeUser.username === username && (
            <Link
              className={_c(`profile-menu-item ${section === "settings" ? "selected-item" : ""}`)}
              to={`/@${username}/settings`}
            >
              {_t(`profile.section-settings`)}
            </Link>
          )}
          <div className="kebab-icon entry-index-menu the-menu main-menu d-none d-lg-flex ">
            <DropDown {...kebabMenuConfig} float="left" />
          </div>
        </div>

        <div className="page-tools">
          {ProfileFilter[section] && (
            <ListStyleToggle
              global={this.props.global}
              toggleListStyle={this.props.toggleListStyle}
            />
          )}
        </div>
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    location: p.location,
    global: p.global,
    username: p.username,
    section: p.section,
    activeUser: p.activeUser,
    toggleListStyle: p.toggleListStyle
  };

  return <ProfileMenu {...props} />;
};
