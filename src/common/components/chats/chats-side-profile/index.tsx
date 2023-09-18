import React, { useContext, useEffect, useState } from "react";
import UserAvatar from "../../user-avatar";
import { ChatContext } from "../chat-context-provider";
import { formattedUserName } from "../utils";

import "./index.scss";

interface Props {
  username: string;
}
export const ChatsSideProfile = (props: Props) => {
  const { currentChannel } = useContext(ChatContext);
  const { username } = props;
  console.log("Current channel in chats side profile", currentChannel);
  console.log("Username in profile sidebar", props.username);
  return (
    <div className="profile-side-bar">
      <p className="side-profile">
        <UserAvatar username={formattedUserName(username)} size="large" />
      </p>
    </div>
  );
};
