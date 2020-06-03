import React, { Component } from "react";

import { Link } from "react-router-dom";

import isEqual from "react-fast-compare";

import { State as GlobalState } from "../../store/global/types";

import ListStyleToggle from "../list-style-toggle/index";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

interface Props {
  global: GlobalState;
  username: string;
  section: string;
  toggleListStyle: () => void;
}

export default class ProfileMenu extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return (
      !isEqual(this.props.username, nextProps.username) ||
      !isEqual(this.props.section, nextProps.section) ||
      !isEqual(this.props.global, nextProps.global)
    );
  }

  render() {
    const { username, section } = this.props;
    return (
      <div className="profile-menu">
        <div className="profile-menu-items">
          {["blog", "comments", "replies", "wallet"].map((s, k) => {
            return (
              <Link key={k} className={`menu-item ${section === s && "selected-item"}`} to={`/@${username}/${s}`}>
                {_t(`profile.section-${s}`)}
              </Link>
            );
          })}
        </div>

        <div className="page-tools">{section !== "wallet" && <ListStyleToggle {...this.props} />}</div>
      </div>
    );
  }
}
