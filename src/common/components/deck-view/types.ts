export interface DeckModel {
  data: any;
  dataParams: any[];
  header: {
    title: string;
    icon: JSX.Element | null;
  };
  listItemComponent: any;
  createdAt: Date;
}

export interface IdentifiableDeckModel extends DeckModel {
  id: string;
  content: string;
}
