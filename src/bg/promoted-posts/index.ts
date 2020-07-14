import axios from "axios";
import config from "../../config";

import {Entry} from "../../common/store/entries/types";

import {getPost} from "../../common/api/bridge";
import {setPromotedEntries, getDbPath} from "../../common/helper/promoted";

const client = axios.create({
    baseURL: config.privateApiAddr,
    responseType: "json",
    headers: {
        ...config.privateApiAuth,
    },
});

interface PromotedPost {
    author: string;
    permlink: string
}

const main = async () => {
    const promoted: PromotedPost[] = (await client.get(`/promoted-posts?limit=200`)).data

    const prms = promoted.map(x => getPost(x.author, x.permlink));
    const entries = await Promise.all(prms) as Entry[];
    setPromotedEntries(entries);
    console.log(`👍 Saved to ${getDbPath()}`);
}

main().then()
