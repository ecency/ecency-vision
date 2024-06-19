interface GenericDeck<DF extends Record<string, string | number> | null> {
  createdAt: string;
  dataFilters: DF;
  dataParams: string[];
  header: {
    title: string;
    updateIntervalMs: number;
  };
}

export interface OldNotificationDeck extends GenericDeck<{ type: string; group: string }> {}
export interface OldNonDFDeck extends GenericDeck<null> {}

export type OldDeck = OldNotificationDeck | OldNonDFDeck;
