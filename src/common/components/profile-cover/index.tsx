import React, {Component} from "react";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {UI, ToggleType} from "../../store/ui/types";

import defaults from "../../constants/defaults.json";

import {proxifyImageSrc, setProxyBase} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import FollowControls from "../follow-controls";
import FavoriteBtn from "../favorite-btn";

const coverFallbackDay = require("../../img/cover-fallback-day.png");
const coverFallbackNight = require("../../img/cover-fallback-night.png");

interface Props {
    global: Global;
    account: Account;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export class ProfileCover extends Component<Props> {

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.global, nextProps.global)
            || !isEqual(this.props.account, nextProps.account)
            || !isEqual(this.props.users, nextProps.users)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.props.ui, nextProps.ui)
    }

    render() {
        const {global, account, activeUser} = this.props;
        let bgImage = "";

        if (account.__loaded) {
            bgImage = global.theme === "day" ? coverFallbackDay : coverFallbackNight;
            if (account.profile?.cover_image) {
                bgImage = proxifyImageSrc(account.profile.cover_image, 0, 0, global.canUseWebp ? 'webp' : 'match');
            }
        }

        let style = {};
        if (bgImage) {
            style = {backgroundImage: `url('${bgImage}')`};
        }

        const hideControls = activeUser && activeUser.username === account.name;

        return (
            <div className="profile-cover">
                <div className="cover-image" style={style}/>
                <div className="follow-controls-holder">
                    {!hideControls && <>
                      <FollowControls {...this.props} targetUsername={account.name}/>
                      <FavoriteBtn {...this.props} targetUsername={account.name}/>
                    </>}
                </div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        account: p.account,
        users: p.users,
        activeUser: p.activeUser,
        ui: p.ui,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        toggleUIProp: p.toggleUIProp
    }

    return <ProfileCover {...props} />
}
