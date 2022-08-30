export interface SerializedDeckModel {
  dataParams: any[];
  header: {
    title: string;
    updateIntervalMs: number;
  };
  dataFilters: any;
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

export interface WalletDeckModel extends IdentifiableDeckModel {
  dataFilters: {
    group: string;
  };
}

export enum ActionTypes {
  CREATE = "@deck/CREATE",
  SET_DATA =  "@deck/FETCH_DATA",
  SET_RELOADING = "@deck/SET_RELOADING",
  REORDER = "@deck/REORDER",
  DELETE = "@deck/DELETE",
  DELETE_ALL = "@deck/DELETE_ALL",
  UPDATE_INTERVAL = "@deck/UPDATE_INTERVAL",
  SET_DATA_FILTERS = "@deck/SET_DATA_FILTERS"
}

export interface CreateAction {
  type: ActionTypes.CREATE;
  data: [
    DeckModel['listItemComponent'],
    DeckModel['header']['title'],
    DeckModel['header']['icon'],
    DeckModel['dataParams'],
    DeckModel['createdAt']?,
    DeckModel['header']['updateIntervalMs']?,
    DeckModel['dataFilters']?
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

export interface DeleteAllAction {
  type: ActionTypes.DELETE_ALL;
}

export interface UpdateIntervalAction {
  type: ActionTypes.UPDATE_INTERVAL;
  data: {
    title: string;
    updateIntervalMs: DeckModel['header']['updateIntervalMs'];
  }
}

export interface SetDataFiltersAction {
  type: ActionTypes.SET_DATA_FILTERS;
  data: {
    title: string;
    username: string;
    dataFilters: any;
  }
}

export type DeckState = {
  items: IdentifiableDeckModel[];
  isContentLoading: boolean;
};

export type Actions = CreateAction | SetDataAction | SetReloadingAction | ReOrderAction | DeleteAction
  | UpdateIntervalAction | SetDataFiltersAction | DeleteAllAction;