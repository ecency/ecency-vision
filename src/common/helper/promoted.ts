import path from "path";
import os from "os";
import fs from "fs";

import {Entry} from "../store/entries/types";

export const getDbPath = (): string => path.join(os.tmpdir(), 'promoted.json');

export const getPromotedEntries = (): Entry[] => {
    if (fs.existsSync(getDbPath())) {
        const contents = fs.readFileSync(getDbPath(), 'utf-8');
        return JSON.parse(contents) as Entry[];
    }

    return [];
}

export const setPromotedEntries = (entries: Entry[]) => {
    const data = JSON.stringify(entries)
    fs.writeFileSync(getDbPath(), data);
}

