import { Event } from "../../../../../lib/nostr-tools/event";

export function filterTagValue(ev: Event, tag: "e" | "p" | "d") {
  return ev.tags.filter(([t]) => t === tag);
}
