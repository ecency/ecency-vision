import express from "express";

import {AppState} from "../../common/store";

import {makePreloadedState} from "../state";

import {render} from "../template";

export default async (req: express.Request, res: express.Response) => {

    const state = await makePreloadedState(req);

    const preLoadedState: AppState = {
        ...state,
        global: {
            ...state.global,
        }
    }

    res.send(render(req, preLoadedState));
};

export const healthCheck = async (req: express.Request, res: express.Response) => {
    res.send({
        status: 200,
        body: {
            status: 'ok'
        }
    })
};

export const appURI = async (req: express.Request, res: express.Response) => {
    res.send({
        "applinks":{
            "apps":[],
            "details":[
                {
                    "appID":"75B6RXTKGT.app.esteem.mobile.ios",
                    "paths":[
                        "/@*/wallet",
                        "/@*/points",
                        "/@*/comments",
                        "/@*/replies",
                        "/@*/posts",
                        "/@*/communities",
                        "/@*/*",
                        "/@*/",
                        "/*/@*/*",
                        "/hot/*",
                        "/trending/*",
                        "/created/*",
                        "/hot",
                        "/trending",
                        "/created"
                    ]
                }
            ]
        }
    })
};
