import {Entry} from "../store/entries/types";

import apps from "@hiveio/hivescript/apps.json";

import defaults from "../../common/constants/defaults.json";

export default (entry: Entry): string | null => {
    if (entry.json_metadata?.canonical_url) {
        return entry.json_metadata?.canonical_url;
    }

    let scheme = `${defaults.base}/{category}/@{username}/{permlink}`;

    if (entry.json_metadata?.app) {
        const identifier = entry.json_metadata.app.split("/")[0];

        if (apps[identifier]) {
            scheme = apps[identifier].url_scheme;
        }
    }

    if (!scheme) {
        return null;
    }

    return scheme
        .replace("{category}", entry.category)
        .replace("{username}", entry.author)
        .replace("{permlink}", entry.permlink);
};
