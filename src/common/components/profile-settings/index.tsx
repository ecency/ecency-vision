import React, {Component} from "react";

import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";

import ProfileEdit from "../profile-edit";

interface Props {
    activeUser: ActiveUser;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
}

export class ProfileSettings extends Component<Props> {
    render() {
        const {activeUser} = this.props;

        return <>
            {activeUser.data?.profile && <ProfileEdit {...this.props} />}
        </>
    }
}


export default (p: Props) => {
    const props: Props = {
        activeUser: p.activeUser,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser
    }

    return <ProfileSettings {...props} />
}
