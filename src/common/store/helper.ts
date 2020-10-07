import {Store} from "redux";

import {AppState} from "./index";
import {ActiveUser, UserPoints} from "./active-user/types";
import {updateAct as updateActiveUserAct} from "./active-user";

import {getAccount} from "../api/hive";
import {getPoints} from "../api/private";


export const clone = (o: any) => {
    return JSON.parse(JSON.stringify(o));
};

export const activeUserMaker = (name: string, points: string = "0.000", uPoints: string = "0.000"): ActiveUser => {
    return {
        username: name,
        data: {name},
        points: {
            points,
            uPoints
        }
    }
}


const activeUserUpdater = async (store: Store<AppState>) => {
    const state = store.getState();
    if (state.activeUser) {
        const {username} = state.activeUser;

        let account;
        try {
            account = await getAccount(username);
        } catch (e) {
            return;
        }

        let points: UserPoints;
        try {
            const p = await getPoints(username);
            points = {points: p.points, uPoints: p.unclaimed_points};
        } catch (e) {
            points = {
                points: "0.000",
                uPoints: "0.000"
            };
        }

        store.dispatch(updateActiveUserAct(account, points));
    }
};
