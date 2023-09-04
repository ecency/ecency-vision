import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { History } from "history";
import { match } from "react-router";
import useDebounce from "react-use/lib/useDebounce";
import { setNostrkeys } from "../../../providers/message-provider";
import { Channel } from "../../../providers/message-provider-types";
import { getAccountReputations } from "../../api/hive";
import accountReputation from "../../helper/account-reputation";
import {
  getCommunities,
  getCommunityLastMessage,
  getDirectLastMessage,
  NostrKeysType
} from "../../helper/chat-utils";
import { _t } from "../../i18n";
import { arrowBackSvg, chatKeySvg, KebabMenu, syncSvg } from "../../img/svg";
import { Chat, DirectContactsType } from "../../store/chat/types";
import { AccountWithReputation } from "../chat-box";
import ChatsScroller from "../chats-scroller";
import LinearProgress from "../linear-progress";
import Tooltip from "../tooltip";
import UserAvatar from "../user-avatar";

import "./index.scss";
import DropDown, { MenuItem } from "../dropdown";
import { CHAT, DropDownStyle } from "../chat-box/chat-constants";
import ChatsDropdownMenu from "../chats-dropdown-menu";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}
interface Props {
  match: match<MatchParams>;
  channels: Channel[];
  directContacts: DirectContactsType[];
  activeUserKeys: NostrKeysType;
  chatPrivKey: string;
  chat: Chat;
  history: History;
  revelPrivateKey: boolean;
  inProgressSetter: (d: boolean) => void;
  revealPrivateKeySetter: (d: boolean) => void;
  resetChat: () => void;
}
export default function ChatsSideBar(props: Props) {
  const {
    channels,
    chat,
    directContacts,
    activeUserKeys,
    match,
    revelPrivateKey,
    chatPrivKey,
    resetChat,
    inProgressSetter,
    revealPrivateKeySetter
  } = props;

  const chatsSideBarRef = React.createRef<HTMLDivElement>();
  const username = match.params.username;

  const [showDivider, setShowDivider] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [communities, setCommunities] = useState<Channel[]>([]);

  // console.log("username in chats sidebar", username);

  useDebounce(
    async () => {
      if (searchText.length !== 0) {
        const resp = await getAccountReputations(searchText, 30);
        const sortedByReputation = resp.sort((a, b) => (a.reputation > b.reputation ? -1 : 1));
        setUserList(sortedByReputation);
        setInProgress(false);
      }
    },
    500,
    [searchText]
  );

  // useEffect(() => {
  //   if (isScrollToTop) {
  //     // console.log("Hurrah");
  //   }
  // }, [isScrollToTop]);

  useEffect(() => {
    const communities = getCommunities(props.chat.channels, props.chat.leftChannelsList);
    setCommunities(communities);
    // fetchProfileData();
  }, [props.chat.channels, props.chat.leftChannelsList]);

  // const communities = [
  //   {
  //     id: "dewf3efq3",
  //     name: "Best Community"
  //   },
  //   {
  //     id: "kefkjehdewjk",
  //     name: "Cars Forum"
  //   },
  //   {
  //     id: "hj3fhkl3flk",
  //     name: "Hive BlockChaiin"
  //   },
  //   {
  //     id: "dewddefq3",
  //     name: "Devsinc"
  //   },
  //   {
  //     id: "kefksahdewjk",
  //     name: "Rolustech"
  //   },
  //   {
  //     id: "hj3fdl3flk",
  //     name: "Stack Overflow"
  //   },
  //   {
  //     id: "kefkjehdsewjk",
  //     name: "Cars Forum"
  //   },
  //   {
  //     id: "hj3fhkls3flk",
  //     name: "Hive BlockChain"
  //   },
  //   {
  //     id: "dewddesfq3",
  //     name: "Devsinc"
  //   },
  //   {
  //     id: "kefksahsdewjk",
  //     name: "Rolustech"
  //   },
  //   {
  //     id: "hj3fdls3flk",
  //     name: "Stack Overflow"
  //   }
  // ];

  const DMS = [
    {
      id: "dewf3efq3",
      name: "ahmed"
    },
    {
      id: "kefkjehdewjk",
      name: "hive-189310"
    },
    {
      id: "hj3fhkl3flk",
      name: "demo.com"
    },
    {
      id: "dewddefq3",
      name: "good-karma"
    },
    {
      id: "kefksahdewjk",
      name: "mtsaeed"
    },
    {
      id: "hj3fdl3flk",
      name: "testers"
    },
    {
      id: "dewf3sefq3",
      name: "ahmed"
    },
    {
      id: "kefkjeshdewjk",
      name: "hive-189310"
    },
    {
      id: "hj3fhskl3flk",
      name: "demo.com"
    },
    {
      id: "dewddesfq3",
      name: "good-karma"
    },
    {
      id: "kefksashdewjk",
      name: "mtsaeed"
    },
    {
      id: "hj3fdsl3flk",
      name: "hive-198973"
    }
  ];

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    var element = event.currentTarget;
    console.log("element.scrollTop", element.scrollTop);
    if (element.scrollTop > 2) {
      setShowDivider(true);
    } else {
      if (showDivider) {
        setShowDivider(false);
      }
    }
    let srollHeight: number = (element.scrollHeight / 100) * 25;
    const isScrollToTop = element.scrollTop >= srollHeight;
    setIsScrollToTop(isScrollToTop);
  };

  const handleRefreshChat = () => {
    resetChat();
    setNostrkeys(activeUserKeys);
    inProgressSetter(true);
  };

  const handleRevealPrivKey = () => {
    if (revelPrivateKey) {
      revealPrivateKeySetter(false);
    }
  };

  return (
    <div className="chats-sidebar">
      <div className="d-flex justify-content-between chats-title">
        <div className="d-flex chats-content">
          {revelPrivateKey && (
            <Tooltip content={_t("chat.back")}>
              <div
                className="back-arrow-image d-flex justify-content-center align-items-center"
                onClick={() => revealPrivateKeySetter(false)}
              >
                <span className="back-arrow-svg"> {arrowBackSvg}</span>
              </div>
            </Tooltip>
          )}

          <p className="chats">Chats</p>
        </div>

        <div className="chat-actions d-flex">
          <div className="refresh-button">
            <Tooltip content={_t("chat.refresh")}>
              <p className="refresh-svg" onClick={handleRefreshChat}>
                {syncSvg}
              </p>
            </Tooltip>
          </div>
          {chatPrivKey && (
            <div className="chat-menu">
              <ChatsDropdownMenu
                onManageChatKey={() => {
                  revealPrivateKeySetter(!revelPrivateKey);
                }}
                {...props}
              />
            </div>
          )}
        </div>
      </div>
      <div className="chats-search">
        <Form.Group className="w-100">
          <Form.Control
            type="text"
            placeholder={_t("chat.search")}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setInProgress(true);
              if (e.target.value.length === 0) {
                setInProgress(false);
                setUserList([]);
              }
            }}
          />
        </Form.Group>
      </div>
      {showDivider && <div className="divider" />}
      {inProgress && <LinearProgress />}
      <div className="chats-list" onScroll={handleScroll} ref={chatsSideBarRef}>
        {searchText ? (
          <div className="searched-users">
            {userList.map((user) => (
              <Link
                to={`/chats/@${user.account}`}
                onClick={() => setSearchText("")}
                key={user.account}
              >
                <div className="d-flex user-info" key={user.account} onClick={handleRevealPrivKey}>
                  <span>
                    <UserAvatar username={user.account} size="medium" />
                  </span>
                  <span className="user-name">{user.account}</span>
                  <span className="user-reputation">({accountReputation(user.reputation)})</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <>
            {communities.length !== 0 && <p className="community-title">Communities</p>}
            {communities.map((channel) => (
              <Link to={`/chats/${channel.communityName}`} key={channel.id}>
                <div
                  className={`community ${username === channel.communityName ? "selected" : ""}`}
                  key={channel.id}
                  onClick={handleRevealPrivKey}
                >
                  <UserAvatar username={channel.communityName!} size="medium" />
                  <div className="community-info">
                    <p className="community-name">{channel.name}</p>
                    <p className="community-last-message">
                      {getCommunityLastMessage(channel.id, chat.publicMessages)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {directContacts.length !== 0 && <p className="dm-title">DMs</p>}
            {directContacts.map((contact) => (
              <Link to={`/chats/@${contact.name}`} key={contact.pubkey}>
                <div
                  className={`dm ${username && username === `@${contact.name}` ? "selected" : ""}`}
                  onClick={handleRevealPrivKey}
                >
                  <UserAvatar username={contact.name} size="medium" />
                  <div className="dm-info">
                    <p className="dm-name">{contact.name}</p>
                    <p className="dm-last-message">
                      {getDirectLastMessage(contact.pubkey, chat.directMessages)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
      {isScrollToTop && (
        <ChatsScroller
          bodyRef={chatsSideBarRef}
          isScrollToTop={isScrollToTop}
          isScrollToBottom={false}
          marginRight={"5%"}
        />
      )}
    </div>
  );
}
