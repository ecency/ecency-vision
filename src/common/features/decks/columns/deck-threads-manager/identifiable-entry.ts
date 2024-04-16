import { Entry } from "../../../../store/entries/types";

export interface ThreadItemEntry extends Entry {
  host: string;
  container: IdentifiableEntry;
  // Is this entry had been replied to another one
  parent?: Entry;
}

export type IdentifiableEntry = ThreadItemEntry & Required<Pick<Entry, "id">>;
