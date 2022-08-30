import {
  ActionTypes,
  CreateAction,
  DeleteAction,
  DeleteAllAction,
  ReOrderAction,
  SetDataAction,
  SetDataFiltersAction,
  SetReloadingAction,
  UpdateIntervalAction
} from './types';

export const createAct = (data: CreateAction['data']): CreateAction => ({
  type: ActionTypes.CREATE,
  data,
});

export const setDataAct = (data: SetDataAction['data']): SetDataAction => ({
  type: ActionTypes.SET_DATA,
  data,
});

export const setReloadingAct = (data: SetReloadingAction['data']): SetReloadingAction => ({
  type: ActionTypes.SET_RELOADING,
  data,
});

export const reorderAct = (data: ReOrderAction['data']): ReOrderAction => ({
  type: ActionTypes.REORDER,
  data,
});

export const deleteAct = (data: DeleteAction['data']): DeleteAction => ({
  type: ActionTypes.DELETE,
  data,
});

export const updateIntervalAct = (data: UpdateIntervalAction['data']): UpdateIntervalAction => ({
  type: ActionTypes.UPDATE_INTERVAL,
  data,
});

export const setDataFiltersAct = (data: SetDataFiltersAction['data']): SetDataFiltersAction => ({
  type: ActionTypes.SET_DATA_FILTERS,
  data,
});

export const deleteAllAct = (): DeleteAllAction => ({
  type: ActionTypes.DELETE_ALL
});
