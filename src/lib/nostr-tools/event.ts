import * as secp256k1 from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

import { utf8Encoder } from "./utils";

/* eslint-disable no-unused-vars */

export enum Kind {
  Metadata = 0,
  Text = 1,
  RecommendRelay = 2,
  Contacts = 3,
  EncryptedDirectMessage = 4,
  EventDeletion = 5,
  Repost = 6,
  Reaction = 7,
  BadgeAward = 8,
  ChannelCreation = 40,
  ChannelMetadata = 41,
  ChannelMessage = 42,
  ChannelHideMessage = 43,
  ChannelMuteUser = 44,
  Report = 1984,
  ZapRequest = 9734,
  Zap = 9735,
  RelayList = 10002,
  BlockList = 16462,
  FlagList = 16463,
  ClientAuth = 22242,
  ReplaceableByTag = 30000,
  BadgeDefinition = 30008,
  ProfileBadge = 30009,
  Article = 30023
}

export type EventTemplate = {
  kind: Kind;
  tags: string[][];
  content: string;
  created_at: number;
};

export type UnsignedEvent = EventTemplate & {
  pubkey: string;
};

export type Event = UnsignedEvent & {
  id: string;
  sig: string;
};

export function getBlankEvent(): EventTemplate {
  return {
    kind: 255,
    content: "",
    tags: [],
    created_at: 0
  };
}

export function serializeEvent(evt: Event): string {
  if (!validateEvent(evt))
    throw new Error("can't serialize event with wrong or missing properties");

  return JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags, evt.content]);
}

export function getEventHash(event: Event): string {
  let eventHash = sha256(utf8Encoder.encode(serializeEvent(event)));
  return secp256k1.utils.bytesToHex(eventHash);
}

export function validateEvent(event: Event): boolean {
  if (typeof event.content !== "string") return false;
  if (typeof event.created_at !== "number") return false;
  if (typeof event.pubkey !== "string") return false;
  if (!event.pubkey.match(/^[a-f0-9]{64}$/)) return false;

  if (!Array.isArray(event.tags)) return false;
  for (let i = 0; i < event.tags.length; i++) {
    let tag = event.tags[i];
    if (!Array.isArray(tag)) return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === "object") return false;
    }
  }

  return true;
}

export async function verifySignature(event: Event & { sig: string }): Promise<boolean> {
  return await secp256k1.schnorr.verify(event.sig, getEventHash(event), event.pubkey);
}

export async function signEvent(event: Event, key: string): Promise<string> {
  const encrypted = await secp256k1.schnorr.sign(getEventHash(event), key);
  return secp256k1.utils.bytesToHex(encrypted);
}