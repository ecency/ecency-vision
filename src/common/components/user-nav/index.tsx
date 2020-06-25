import React, { Component } from "react";
import { History, Location } from "history";
import { Link } from "react-router-dom";

import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import ToolTip from "../tooltip";
import UserAvatar from "../user-avatar";
import DropDown from "../dropdown";
import Login from "../login";

import { _t } from "../../i18n";

import { creditCardSvg } from "../../img/svg";

interface Props {
  history: History;
  location: Location;
  users: User[];
  activeUser: ActiveUser;
  setActiveUser: (username: string | null) => void;
  deleteUser: (username: string) => void;
}

interface State {
  login: boolean;
}

export default class UserNav extends Component<Props, State> {
  state: State = {
    login: false,
  };

  toggleLogin = () => {
    const { login } = this.state;
    this.setState({ login: !login });
  };

  render() {
    const { activeUser } = this.props;
    const { login } = this.state;

    const dropDownConfig = {
      label: <UserAvatar username={activeUser.username} size="medium" />,
      items: [
        {
          label: "Profile",
          href: `/@${activeUser.username}`,
        },
        {
          label: "Login As",
          onClick: this.toggleLogin,
        },
        {
          label: "Logout",
          onClick: () => {
            const { setActiveUser } = this.props;
            setActiveUser(null);
          },
        },
      ],
    };

    return (
      <>
        <div className="user-nav">
          <ToolTip content={_t("user-nav.wallet")}>
            <Link to={`/@${activeUser.username}/wallet`} className="user-wallet">
              {creditCardSvg}
            </Link>
          </ToolTip>
          <DropDown {...{ ...this.props, ...dropDownConfig }} float="right" header={`@${activeUser.username}`} />
        </div>
        {login && <Login {...this.props} onHide={this.toggleLogin} onLogin={this.toggleLogin} />}
      </>
    );
  }
}
