import React, { useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { History } from "history";
import { match } from "react-router";
import useDebounce from "react-use/lib/useDebounce";
import { setNostrkeys } from "../../../../providers/message-provider";
import { Channel } from "../../../../providers/message-provider-types";
import { getAccountReputations } from "../../../api/hive";
import accountReputation from "../../../helper/account-reputation";
import { getCommunityLastMessage, getDirectLastMessage, getJoinedCommunities } from "../utils";
import { _t } from "../../../i18n";
import { arrowBackSvg, syncSvg } from "../../../img/svg";
import { Chat, DirectContactsType } from "../../../store/chat/types";
import ChatsScroller from "../chats-scroller";
import LinearProgress from "../../linear-progress";
import Tooltip from "../../tooltip";
import UserAvatar from "../../user-avatar";

import "./index.scss";
import DropDown, { MenuItem } from "../../dropdown";
import { CHAT, DropDownStyle } from "../chat-popup/chat-constants";
import ChatsDropdownMenu from "../chats-dropdown-menu";
import { AccountWithReputation, NostrKeysType } from "../types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-provider";
import { getUserChatPublicKey, formattedUserName } from "../../../components/chats/utils";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}
interface Props {
  match: match<MatchParams>;
  history: History;
  resetChat: () => void;
}
export default function ChatsSideBar(props: Props) {
  const { chat } = useMappedStore();
  const context = useContext(ChatContext);
  const { channels, directContacts, leftChannelsList } = chat;
  const { match, resetChat } = props;

  const {
    activeUserKeys,
    revealPrivKey,
    chatPrivKey,
    setInProgress,
    setRevealPrivKey,
    setReceiverPubKey
  } = context;

  const chatsSideBarRef = React.createRef<HTMLDivElement>();
  const username = match.params.username;

  const [showDivider, setShowDivider] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [userList, setUserList] = useState<AccountWithReputation[]>([]);
  const [isScrollToTop, setIsScrollToTop] = useState(false);
  const [communities, setCommunities] = useState<Channel[]>([]);

  console.log("username in chats sidebar", username);

  useDebounce(
    async () => {
      if (searchText.length !== 0) {
        const resp = await getAccountReputations(searchText, 30);
        const sortedByReputation = resp.sort((a, b) => (a.reputation > b.reputation ? -1 : 1));
        setUserList(sortedByReputation);
        setSearchInProgress(false);
      }
    },
    500,
    [searchText]
  );

  useEffect(() => {
    if (username.startsWith("@")) {
      getReceiverPubKey(formattedUserName(username));
    }
  }, [username]);

  useEffect(() => {
    const communities = getJoinedCommunities(channels, leftChannelsList);
    setCommunities(communities);
    // fetchProfileData();
  }, [channels, leftChannelsList]);

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
    setNostrkeys(activeUserKeys!);
    setInProgress(true);
  };

  const handleRevealPrivKey = () => {
    if (revealPrivKey) {
      setRevealPrivKey(false);
    }
  };

  const getReceiverPubKey = async (username: string) => {
    console.log("Username ha yar", username);
    const peer = directContacts.find((x) => x.name === username)?.pubkey ?? "";
    if (peer) {
      setReceiverPubKey(peer);
    } else {
      const pubkey = await getUserChatPublicKey(username);
      console.log("Pubkey", pubkey);
      if (pubkey === undefined) {
        setReceiverPubKey("");
      } else {
        setReceiverPubKey(pubkey);
      }
    }
  };

  return (
    <div className="chats-sidebar">
      <div className="d-flex justify-content-between chats-title">
        <div className="d-flex chats-content">
          {revealPrivKey && (
            <Tooltip content={_t("chat.back")}>
              <div
                className="back-arrow-image d-flex justify-content-center align-items-center"
                onClick={() => setRevealPrivKey(false)}
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
                  setRevealPrivKey(!revealPrivKey);
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
              setSearchInProgress(true);
              if (e.target.value.length === 0) {
                setSearchInProgress(false);
                setUserList([]);
              }
            }}
          />
        </Form.Group>
      </div>
      {showDivider && <div className="divider" />}
      {searchInProgress && <LinearProgress />}
      <div className="chats-list" onScroll={handleScroll} ref={chatsSideBarRef}>
        {searchText ? (
          <div className="searched-users">
            {userList.map((user) => (
              <Link
                to={`/chats/@${user.account}`}
                onClick={() => setSearchText("")}
                key={user.account}
              >
                <div
                  className="d-flex user-info"
                  key={user.account}
                  onClick={() => {
                    handleRevealPrivKey();
                    getReceiverPubKey(user.account);
                  }}
                >
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
              <Link
                to={`/chats/@${contact.name}`}
                key={contact.pubkey}
                onClick={() => setReceiverPubKey(contact.pubkey)}
              >
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
