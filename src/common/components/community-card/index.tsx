import React, {Component} from "react";

import {History} from "history";

import isEqual from "react-fast-compare";

import moment from "moment";

import {Button} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {Community} from "../../store/communities/types";

import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import {Followers, Following} from "../friends";
import ProfileEdit from "../profile-edit";

import accountReputation from "../../helper/account-reputation";

import formattedNumber from "../../util/formatted-number";

import defaults from "../../constants/defaults.json";

import {vpMana} from "../../api/hive";
import ln2list from "../../util/nl2list";

import {_t} from "../../i18n";

import {
   informationSvg
} from "../../img/svg";

interface Props {
    global: Global;
    community: Community
}

interface State {

}

export class CommunityCard extends Component<Props, State> {
    state: State = {};

    /*
    componentDidUpdate(prevProps: Readonly<Props>): void {
        // Hide dialogs when account change
        if (this.props.account.name !== prevProps.account.name) {
            this.setState({followersList: false});
            this.setState({followingList: false});
        }
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.account, nextProps.account)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.state, nextState);
    }

    toggleFollowers = () => {
        const {followersList} = this.state;
        this.setState({followersList: !followersList});
    };
     */


    render() {
        const {community} = this.props;

        return (
            <div className="community-card">
                <div className="community-avatar">
                    {UserAvatar({
                        ...this.props,
                        username: community.name,
                        size: "xLarge"
                    })}
                </div>
                <div className="community-info">
                    <div className="title">
                        {community.title}
                    </div>
                    <div className="about">
                        {community.about}
                    </div>
                </div>
                <div className="community-section">
                    <div className="section-header">
                        {informationSvg}  Description
                    </div>

                    <div className="section-content">
                        {ln2list(community.description).map((x, i) => (
                            <p key={i}>{x}</p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        community: p.community
    }

    return <CommunityCard {...props} />;
}

