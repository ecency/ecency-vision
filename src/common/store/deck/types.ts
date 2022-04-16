export interface DeckModel {
  data?: any;
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

export enum ActionTypes {
  CREATE = "@deck/CREATE"
}

export interface CreateAction {
  type: ActionTypes.CREATE;
  data: [
    DeckModel['listItemComponent'],
    DeckModel['header']['title'],
    DeckModel['header']['icon'],
    DeckModel['dataParams']
  ];
}

export type DeckState = IdentifiableDeckModel[];
export type Actions = CreateAction;