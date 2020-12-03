import React, {Component} from "react";

import {History} from "history";

import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";

import ProfileEdit from "../profile-edit";


interface Props {
    history: History;
    activeUser: ActiveUser | null;
    account: Account;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
}

export class ProfileSettings extends Component<Props> {
    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        const {activeUser, account, history} = this.props;
        if (!activeUser || activeUser.username !== account.name) {
            history.push(`/@${account.name}`);
        }
    }


    render() {
        const {activeUser} = this.props;

        return <>
            {activeUser && activeUser.data?.profile && <ProfileEdit {...this.props} activeUser={activeUser}/>}
        </>
    }
}


export default (p: Props) => {
    const props: Props = {
        history: p.history,
        activeUser: p.activeUser,
        account: p.account,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser
    }

    return <ProfileSettings {...props} />
}
