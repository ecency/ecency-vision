import React, {Component} from "react";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {UI, ToggleType} from "../../store/ui/types";

import defaults from "../../constants/defaults.json";

import {
    proxifyImageSrc,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

import FollowControls from "../follow-controls";

const coverFallbackDay = require("../../img/cover-fallback-day.png");
const coverFallbackNight = require("../../img/cover-fallback-night.png");

interface Props {
    global: Global;
    account: Account;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class ProfileCover extends Component<Props> {
    render() {
        const {global, account, activeUser} = this.props;
        let bgImage = "";

        if (account.__loaded) {
            bgImage = global.theme === "day" ? coverFallbackDay : coverFallbackNight;
            if (account.profile?.cover_image) {
                bgImage = proxifyImageSrc(account.profile.cover_image);
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
                    {!hideControls && <FollowControls {...this.props} targetUsername={account.name}/>}
                </div>
            </div>
        );
    }
}
