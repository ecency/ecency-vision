import axios from "axios";

import {Entry} from "../common/store/entries/types";
import {DynamicProps} from "../common/store/dynamic-props/types";

import {initialState as dynamicPropsInitialState} from "../common/store/dynamic-props";

import * as hiveApi from "../common/api/hive";

import {cache} from "./cache";

export const optimizeEntries = (entries: Entry[]): Entry[] => {
    return entries;
    /* Optimization disabled for now
    return entries.map((x) => {
        return {
            ...x,
            ...{active_votes: []}, // remove active votes
        };
    }); */
};

export const getSearchIndexCount = async (): Promise<number> => {
    let indexCount: number | undefined = cache.get("index-count");
    if (indexCount === undefined) {
        try {
            indexCount = (await axios.get('https://hivesearcher.com/api/count').then(r => r.data)) as number
        } catch (e) {
            indexCount = 0;
        }

        cache.set("index-count", indexCount, 86400);
    }

    return indexCount;
}

export const getDynamicProps = async (): Promise<DynamicProps> => {
    let props: DynamicProps | undefined = cache.get("dynamic-props");
    if (props === undefined) {
        try {
            props = await hiveApi.getDynamicProps();
            cache.set("dynamic-props", props, 120);
        } catch (e) {
            props = {...dynamicPropsInitialState};
        }
    }

    return props;
}
