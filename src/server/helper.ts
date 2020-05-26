import express from 'express';

import themes from '../common/constants/themes.json';
import defaults from '../common/constants/defaults.json';

export interface GlobalCookies {
    theme: string,
    intro: boolean
}

export const readGlobalCookies = (req: express.Request): GlobalCookies => {
    const theme = req.cookies['theme'] && themes.includes(req.cookies['theme']) ? req.cookies['theme'] : defaults.theme;
    const intro = !req.cookies['hide-intro'];

    return {theme, intro}
};
