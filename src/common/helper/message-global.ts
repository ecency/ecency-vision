import Raven from "./message-helper";
import { Event } from "../../lib/nostr-tools/event";

declare global {
  interface Window {
    raven?: Raven;
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: Event) => Promise<Event>;
      nip04: {
        encrypt: (pubkey: string, content: string) => Promise<string>;
        decrypt: (pubkey: string, content: string) => Promise<string>;
      };
    };
  }
}
