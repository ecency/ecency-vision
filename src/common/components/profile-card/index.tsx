import React, { Component } from "react";

import { Profile } from "../../store/profiles/types";
import UserAvatar from "../user-avatar";

interface Props {
  profile: Profile;
}

export default class ProfileCard extends Component<Props> {
  render() {
    const { profile } = this.props;
    console.log(profile);
    return (
      <div className="profile-card">
        <div className="profile-avatar">
          <UserAvatar {...this.props} username={profile.name} size="xLarge" />
          <div className="reputation">{Math.floor(profile.reputation)}</div>
        </div>
     
        <div className="username">{profile.name}</div>
      </div>
    );
  }
}
