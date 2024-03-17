import React, { Component } from "react";

import { User } from "../../store/users/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";

interface Props {
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  children: JSX.Element;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export class LoginRequired extends Component<Props> {
  toggle = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("login");
  };

  render() {
    const { children, activeUser } = this.props;

    if (activeUser && activeUser.data.__loaded) {
      return children;
    }

    return React.cloneElement(children, {
      onClick: this.toggle
    });
  }
}

export default (p: Props) => {
  const props: Props = {
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    children: p.children,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp
  };

  return <LoginRequired {...props} />;
};
