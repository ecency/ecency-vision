import React, {Component} from "react";

import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {UI, ToggleType} from "../../store/ui/types";

import Login from "../login";

interface Props {
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  children: JSX.Element;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  onLogin?: () => void;
}

interface State {
  loginVisible: boolean;
}

export default class LoginRequired extends Component<Props, State> {
  state: State = {
    loginVisible: false,
  };

  toggle = () => {
    const { loginVisible } = this.state;
    this.setState({ loginVisible: !loginVisible });
  };

  render() {
    const { children, activeUser } = this.props;
    const { loginVisible } = this.state;

    if (activeUser) {
      return children;
    }

    const clonedChildren = React.cloneElement(children, {
      onClick: this.toggle,
    });

    return (
      <>
        {clonedChildren}
        {loginVisible && (
          <Login
            {...this.props}
            onHide={this.toggle}
            onLogin={() => {
              this.toggle();

              const { onLogin } = this.props;
              if (onLogin) {
                onLogin();
              }
            }}
          />
        )}
      </>
    );
  }
}
