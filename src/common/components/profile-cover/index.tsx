import React, {Component} from "react";
import {Context} from "react-img-webp";

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
const request = {
    headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
    }
}
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

export class ProfileCover extends Component<Props> {
    render() {
        const {global, account, activeUser} = this.props;
        let bgImage = "";
        let bgImageWebp = "";

        if (account.__loaded) {
            bgImage = global.theme === "day" ? coverFallbackDay : coverFallbackNight;
            if (account.profile?.cover_image) {
                bgImage = proxifyImageSrc(account.profile.cover_image);
                bgImageWebp = proxifyImageSrc(account.profile.cover_image, 0, 0, 'webp');
            }
        }

        const hideControls = activeUser && activeUser.username === account.name;

        return (
            <div className="profile-cover">
                <Context.WebP.Consumer>
                    {(value) =>
                        <div className="cover-image" style={bgImage ? {
                            backgroundImage: `url(${value.supportWebP ? bgImageWebp : bgImage})`,
                        }:{}}/>
                    }
                </Context.WebP.Consumer>
                <div className="follow-controls-holder">
                    {!hideControls && <FollowControls {...this.props} targetUsername={account.name}/>}
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
