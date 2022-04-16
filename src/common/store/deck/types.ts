export interface DeckModel {
  data?: any;
  dataParams: any[];
  header: {
    title: string;
    icon: JSX.Element | null;
    reloading: boolean;
  };
  listItemComponent: any;
  createdAt: Date;
  // TODO: Add owner
}

export interface IdentifiableDeckModel extends DeckModel {
  id: string;
  content: string;
}

export enum ActionTypes {
  CREATE = "@deck/CREATE",
  SET_DATA =  "@deck/FETCH_DATA",
  SET_RELOADING = "@deck/SET_RELOADING",
  REORDER = "@deck/REORDER"
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

export interface SetDataAction {
  type: ActionTypes.SET_DATA;
  data: {
    title: string;
    data: any;
  };
}

export interface SetReloadingAction {
  type: ActionTypes.SET_RELOADING;
  data: {
    title: string;
    isReloading: boolean;
  };
}

export interface ReOrderAction {
  type: ActionTypes.REORDER;
  data: {
    startIndex: number;
    endIndex: number;
  }
}

export type DeckState = {
  items: IdentifiableDeckModel[];
  isContentLoading: boolean;
};
export type Actions = CreateAction | SetDataAction | SetReloadingAction;