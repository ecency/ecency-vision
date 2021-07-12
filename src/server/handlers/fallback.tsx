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

export const iosURI = async (req: express.Request, res: express.Response) => {
    res.send({
        "applinks":{
            "apps":[],
            "details":[
                {
                    "appID":"75B6RXTKGT.app.esteem.mobile.ios",
                    "paths":[
                        "/@*",
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

export const androidURI = async (req: express.Request, res: express.Response) => {
    res.send(
        [{
            "relation": ["delegate_permission/common.handle_all_urls"],
            "target": {
              "namespace": "android_app",
              "package_name": "app.esteem.mobile.android",
              "sha256_cert_fingerprints":
                [
                    "4F:3F:42:16:01:72:6C:0A:BF:F1:49:EE:BE:8D:70:29:20:F4:03:F4:3F:9D:63:81:60:B6:56:34:AD:AB:0A:B2"
                ]
            }
        }]
    )
};
