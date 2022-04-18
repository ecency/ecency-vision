export interface SerializedDeckModel {
  dataParams: any[];
  header: {
    title: string;
    updateIntervalMs: number;
  };
  createdAt: Date;
}

export interface DeckModel extends SerializedDeckModel {
  data?: any;
  header: {
    title: string;
    icon: JSX.Element | null;
    reloading: boolean;
    updateIntervalMs: number;
  };
  listItemComponent: any;
}

export interface IdentifiableDeckModel extends DeckModel {
  id: string;
  content: string;
}

export enum ActionTypes {
  CREATE = "@deck/CREATE",
  SET_DATA =  "@deck/FETCH_DATA",
  SET_RELOADING = "@deck/SET_RELOADING",
  REORDER = "@deck/REORDER",
  DELETE = "@deck/DELETE"
}

export interface CreateAction {
  type: ActionTypes.CREATE;
  data: [
    DeckModel['listItemComponent'],
    DeckModel['header']['title'],
    DeckModel['header']['icon'],
    DeckModel['dataParams'],
    DeckModel['createdAt']?,
    DeckModel['header']['updateIntervalMs']?
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

export interface DeleteAction {
  type: ActionTypes.DELETE;
  data: {
    title: string;
  };
}

export type DeckState = {
  items: IdentifiableDeckModel[];
  isContentLoading: boolean;
};

export type Actions = CreateAction | SetDataAction | SetReloadingAction | ReOrderAction | DeleteAction;