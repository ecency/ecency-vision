export enum CommonActionTypes {
  INIT = "@@INIT",
  LOCATION_CHANGE = "@@router/LOCATION_CHANGE",
}

export interface LocationChangeAction {
  type: CommonActionTypes.LOCATION_CHANGE;
  payload: {
    location: {
      pathname: string;
    };
  };
}

export interface InitAction {
  type: CommonActionTypes.INIT;
}

export const locationChangeAct = (pathname: string): LocationChangeAction => {
  return {
    type: CommonActionTypes.LOCATION_CHANGE,
    payload: {
      location: {
        pathname,
      },
    },
  };
};
