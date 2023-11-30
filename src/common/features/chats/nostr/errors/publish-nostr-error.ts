import { Event } from "../../../../../lib/nostr-tools/event";

export class PublishNostrError extends Error {
  public event: Event;

  constructor(message: string, event: Event) {
    super(message);
    this.event = event;
  }
}
