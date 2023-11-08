import { Event, Kind } from "../../../../../lib/nostr-tools/event";
import { Channel, Message, Profile } from "../../managers/message-manager-types";
import { findTagValue } from "./find-tag-value";
import { filterTagValue } from "./filter-tag-value";
import { decrypt } from "../../../../../lib/nostr-tools/nip04";

export interface EventConverterResult {
  [Kind.ChannelCreation]: Channel;
  [Kind.EncryptedDirectMessage]: Promise<Message>;
  [Kind.ChannelMessage]: Message;
  [Kind.Metadata]: Profile;
  30078: string[];
}

export function convertEvent<KIND extends keyof EventConverterResult>(
  event: Event,
  publicKey?: string,
  privateKey?: string
): EventConverterResult[KIND] | null {
  let content: any = {};
  try {
    content = JSON.parse(event.content);
  } catch (e) {
    content = null;
  }

  switch (event.kind as any) {
    case Kind.ChannelCreation:
      if (!content) {
        console.error(new Error("[Chat][Nostr] – message content is not a JSON"));
        return null;
      }
      return {
        id: event.id,
        creator: event.pubkey,
        created: event.created_at,
        communityName: content.communityName,
        communityModerators: content.communityModerators,
        hiddenMessageIds: content.hiddenMessageIds,
        removedUserIds: content.removedUserIds,
        name: content.name,
        about: content.about,
        picture: content.picture
      } as any;
    case Kind.EncryptedDirectMessage:
      return new Promise<Message>(async (resolve) => {
        const receiver = findTagValue(event, "p")!!;
        const peer = receiver === publicKey ? event.pubkey : receiver;
        const encryptedMessage = {
          id: event.id,
          root: filterTagValue(event, "e").find((tag) => tag[3] === "root")?.[1],
          peer,
          creator: event.pubkey,
          created: event.created_at,
          decrypted: false,
          sent: 1
        };

        if (!privateKey) {
          throw new Error(
            "[Chat][Nostr] – private key is not provided while message is encrypting"
          );
        }

        const decryptedMessageContent = await decrypt(privateKey, peer, event.content);
        resolve({
          ...encryptedMessage,
          content: decryptedMessageContent,
          decrypted: true
        });
      }) as any;
    case Kind.ChannelMessage:
      const eTags = filterTagValue(event, "e");
      const root = eTags.find((x) => x[3] === "root")?.[1];
      const mentions = filterTagValue(event, "p")
        .map((mention) => mention?.[1])
        .filter((mention) => !!mention);
      if (!root) return null;
      return event.content
        ? {
            id: event.id,
            root,
            content: event.content,
            creator: event.pubkey,
            mentions,
            created: event.created_at,
            sent: 1
          }
        : (null as any);
    case Kind.Metadata:
      if (!content) {
        return null;
      }

      return {
        id: event.id,
        creator: event.pubkey,
        created: event.created_at,
        name: content.name || "",
        about: content.about || "",
        picture: content.picture || ""
      } as any;
    case "30078":
      return content;
    default:
      return content;
  }
}
