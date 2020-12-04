import React, {Component} from "react";

import {History} from "history";

import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {Global} from "../../store/global/types";

import ProfileEdit from "../profile-edit";
import Preferences from "../preferences";

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    account: Account;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
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

        if (activeUser) {
            return <>
                {activeUser.data?.profile && <ProfileEdit {...this.props} activeUser={activeUser}/>}
                <Preferences {...this.props}  />
            </>
        }

        return null;
    }
}


export default (p: Props) => {
    const props: Props = {
        history: p.history,
        global: p.global,
        activeUser: p.activeUser,
        account: p.account,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser,
        muteNotifications: p.muteNotifications,
        unMuteNotifications: p.unMuteNotifications
    }

    return <ProfileSettings {...props} />
}
