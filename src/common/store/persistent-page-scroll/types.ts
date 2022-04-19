export interface PersistentPageScrollState {
  [page: string]: {
    scroll: number;
  };
}

export enum ActionTypes {
  SAVE_PAGE_SCROLL
}

export interface SavePageScrollAction {
  type: ActionTypes.SAVE_PAGE_SCROLL;
  data: SavePageScrollData;
}

export interface SavePageScrollData {
  pageName: string;
  scrollValue: number;
}

export type Actions = SavePageScrollAction;