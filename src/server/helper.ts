import express from 'express';

import {ListStyle, Theme} from '../common/store/global/types';

import defaults from '../common/constants/defaults.json';

export interface GlobalCookies {
    theme: Theme,
    listStyle: ListStyle,
    intro: boolean
}

export const readGlobalCookies = (req: express.Request): GlobalCookies => {
    const _c = (k: string): any => req.cookies[k];

    const theme = _c('theme') && Object.values(Theme).includes(_c('theme')) ? _c('theme') : defaults.theme;
    const intro = !_c('hide-intro');
    const listStyle = _c('list-style') && Object.values(ListStyle).includes(_c('list-style')) ? _c('list-style') : defaults.listStyle;

    return {theme: Theme[theme], listStyle: ListStyle[listStyle], intro};
};
