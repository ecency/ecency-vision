import moment from "moment";
import { generatePrivateKey, getPublicKey } from "../../lib/nostr-tools/keys";
import {
  Channel,
  DirectMessage,
  Profile,
  PublicMessage
} from "../../providers/message-provider-types";
import { getAccountFull } from "../api/hive";
import { updateProfile } from "../api/operations";
import { GIPHGY } from "../components/chat-box/chat-constants";
import { ActiveUser } from "../store/active-user/types";
import { Chat, directMessagesList, publicMessagesList } from "../store/chat/types";
import * as ls from "../util/local-storage";

export interface NostrKeysType {
  pub: string;
  priv: string;
}

export const getProfileMetaData = async (username: string) => {
  const response = await getAccountFull(username);
  const { posting_json_metadata } = response;
  if (posting_json_metadata) {
    const profile = JSON.parse(posting_json_metadata!).profile;

    return profile;
  }
};

export const resetProfile = (activeUser: ActiveUser | null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const profile = await getProfileMetaData(activeUser?.username!);
      delete profile.nsKey;
      delete profile.channel;
      ls.remove(`${activeUser?.username}_nsPrivKey`);
      const response = await getAccountFull(activeUser?.username!);
      const updatedProfile = await updateProfile(response, { ...profile });
      console.log("Updated profile", updatedProfile);
      resolve(updatedProfile);
    } catch (error) {
      reject(error);
    }
  });
};

export const setProfileMetaData = async (activeUser: ActiveUser | null, noStrPubKey: string) => {
  const response = await getAccountFull(activeUser?.username!);

  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const newProfile = {
    nsKey: noStrPubKey
  };

  const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
  return updatedProfile;
};

export const setChannelMetaData = (username: string, channel: Channel) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await getAccountFull(username!);
      const { posting_json_metadata } = response;
      const profile = JSON.parse(posting_json_metadata!).profile;
      const newProfile = {
        channel: channel
      };
      const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
      resolve(updatedProfile);
    } catch (error) {
      reject(error);
    }
  });
};

export const createNoStrAccount = () => {
  const priv = generatePrivateKey();
  const pub = getPublicKey(priv);
  return { pub, priv };
};

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const formatMessageTime = (unixTs: number) => moment.unix(unixTs).format("h:mm a");

export const formatMessageDate = (unixTs: number) => moment.unix(unixTs).format("dddd, MMMM Do");

export const isSha256 = (s: string) => /^[a-f0-9]{64}$/gi.test(s);

export const getCommunities = (channels: Channel[], leftChannels: string[]) => {
  return channels.filter((item) => !leftChannels.includes(item.id));
};

export const getPrivateKey = (username: string) => {
  return ls.get(`${username}_nsPrivKey`);
};

export const formatFollowers = (count: number | undefined) => {
  if (count) {
    return count >= 1e6
      ? (count / 1e6).toLocaleString() + "M"
      : count >= 1e3
      ? (count / 1e3).toLocaleString() + "K"
      : count.toLocaleString();
  }
  return count;
};

export const formattedName = (username: string, chat: Chat) => {
  if (username && !username.startsWith("@")) {
    const community = chat.channels.find((channel) => channel.communityName === username);
    if (community) {
      return community.name;
    }
  }
  const replacedUserName = username.replace("@", "");
  return replacedUserName;
};

export const formattedUserName = (username: string) => {
  if (username && username.startsWith("@")) {
    return username.replace("@", "");
  }
  return username;
};

export const isChannel = (username: string) => {
  if (username.startsWith("@")) {
    return false;
  }
  return true;
};

export const fetchCommunityMessages = (
  publicMessages: publicMessagesList[],
  currentChannel: Channel,
  hiddenMessageIds?: string[]
) => {
  const hideMessageIds = hiddenMessageIds || currentChannel?.hiddenMessageIds || [];
  for (const item of publicMessages) {
    if (item.channelId === currentChannel.id) {
      const filteredPublicMessages = Object.values(item.PublicMessage).filter(
        (message) => !hideMessageIds.includes(message.id)
      );
      return filteredPublicMessages;
    }
  }
  return [];
};

export const isMessageGif = (content: string) => {
  return content.includes(GIPHGY);
};

export const isMessageImage = (content: string) => {
  return content.includes("https://images.ecency.com");
};

export const getProfileName = (creator: string, profiles: Profile[]) => {
  const profile = profiles.find((x) => x.creator === creator);
  return profile?.name;
};

export const getFormattedDateAndDay = (
  msg: DirectMessage | PublicMessage,
  i: number,
  messagesList: DirectMessage[] | PublicMessage[]
) => {
  const prevMsg = messagesList[i - 1];
  const msgDate = formatMessageDate(msg.created);
  const prevMsgDate = prevMsg ? formatMessageDate(prevMsg.created) : null;
  if (msgDate !== prevMsgDate) {
    return msgDate;
  }
  return null;
};

export const fetchCurrentUserData = async (username: string) => {
  const response = await getAccountFull(username);
  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const { nsKey } = profile || {};
  console.log("nsKey", nsKey);
  return nsKey;
};

export const copyToClipboard = (content: string) => {
  console.log("copy to clipboard run");
  const textField = document.createElement("textarea");
  textField.innerText = content;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand("copy");
  textField.remove();
};

export const getCommunityLastMessage = (
  channelId: string,
  publicMessages: publicMessagesList[]
) => {
  const msgsList = fetchChannelMessages(channelId!, publicMessages);
  const messages = msgsList.sort((a, b) => a.created - b.created);
  const lastMessage = messages.slice(-1);
  return lastMessage[0]?.content;
};

export const fetchChannelMessages = (channelId: string, publicMessages: publicMessagesList[]) => {
  for (const item of publicMessages) {
    if (item.channelId === channelId) {
      return Object.values(item.PublicMessage);
    }
  }
  return [];
};

export const fetchDirectMessages = (peer: string, directMessages: directMessagesList[]) => {
  for (const item of directMessages) {
    if (item.peer === peer) {
      return Object.values(item.chat);
    }
  }
  return [];
};

export const getDirectLastMessage = (pubkey: string, directMessages: directMessagesList[]) => {
  const msgsList = fetchDirectMessages(pubkey, directMessages);
  const messages = msgsList.sort((a, b) => a.created - b.created);
  const lastMessage = messages.slice(-1);
  return lastMessage[0]?.content;
};
