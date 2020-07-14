import path from "path";
import os from "os";
import fs from "fs";

import {Entry} from "../store/entries/types";

export const getDbPath = (): string => path.join(os.tmpdir(), 'promoted-posts.json');

export const getPromotedPosts = (): Entry[] => {
    if (fs.existsSync(getDbPath())) {
        const contents = fs.readFileSync(getDbPath(), 'utf-8');
        return JSON.parse(contents) as Entry[];
    }

    return [];
}

export const setPromotedPosts = (entries: Entry[]) => {
    const data = JSON.stringify(entries)
    fs.writeFileSync(getDbPath(), data);
}

