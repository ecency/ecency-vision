import { Event } from "../../../../../lib/nostr-tools/event";

export function findTagValue(ev: Event, tag: "e" | "p" | "d") {
  return ev.tags.find(([t]) => t === tag)?.[1];
}
