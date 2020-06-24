import React, { Component } from "react";
import { History, Location } from "history";
import { Link } from "react-router-dom";

import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import ToolTip from "../tooltip";
import UserAvatar from "../user-avatar";
import DropDown from "../dropdown";

import { _t } from "../../i18n";

import { creditCardSvg } from "../../img/svg";

interface Props {
  history: History;
  location: Location;
  users: User[];
  activeUser: ActiveUser;
  setActiveUser: (name?: string) => void;
}

export default class UserNav extends Component<Props> {
  render() {
    const { activeUser } = this.props;

    const dropDownConfig = {
      label: <UserAvatar username={activeUser.name} size="medium" />,
      items: [
        {
          label: "Profile",
          href: `/@${activeUser.name}`,
        },
        {
          label: "Login As",
          onClick: () => {},
        },
        {
          label: "Logout",
          onClick: () => {},
        },
      ],
    };

    return (
      <div className="user-nav">
        <ToolTip content={_t("user-nav.wallet")}>
          <Link to={`/@${activeUser.name}/wallet`} className="user-wallet">
            {creditCardSvg}
          </Link>
        </ToolTip>
        <DropDown {...{ ...this.props, ...dropDownConfig }} float="right" header={`@${activeUser.name}`} />
      </div>
    );
  }
}
