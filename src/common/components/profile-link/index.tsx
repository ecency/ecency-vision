import React, {Component} from "react";
import {History} from "history";

import {Account} from "../../store/accounts/types";

export const makePath = (username: string) => `/@${username}`;

interface Props {
    history: History;
    children: JSX.Element;
    username: string;
    addAccount: (data: Account) => void;
    afterClick?: () => void;
}

export class ProfileLink extends Component<Props> {
    public static defaultProps = {};

    clicked = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        const {username, history, addAccount, afterClick} = this.props;

        addAccount({name: username});

        history.push(makePath(username));

        if (afterClick) afterClick();
    };

    render() {
        const {children, username} = this.props;
        const href = makePath(username);

        const props = Object.assign({}, children.props, {
            href,
            onClick: this.clicked,
        });

        return React.createElement("a", props);
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        children: p.children,
        username: p.username,
        addAccount: p.addAccount,
        afterClick: p.afterClick
    }

    return <ProfileLink {...props} />
}
