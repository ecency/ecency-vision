import React, {Component} from "react";

import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {UI, ToggleType} from "../../store/ui/types";

interface Props {
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    children: JSX.Element;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class LoginRequired extends Component<Props> {

    toggle = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    };

    render() {
        const {children, activeUser} = this.props;

        if (activeUser) {
            return children;
        }

        return React.cloneElement(children, {
            onClick: this.toggle,
        });
    }
}
