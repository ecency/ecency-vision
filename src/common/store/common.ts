export enum CommonActionTypes {
    LOCATION_CHANGE = "@@router/LOCATION_CHANGE",
}

export interface LocationChangeAction {
    type: CommonActionTypes.LOCATION_CHANGE;
    payload: {
        location: {
            pathname: string;
        };
        action?: 'PUSH' | 'POP'
    };
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
