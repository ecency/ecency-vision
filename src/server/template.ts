import {Helmet} from 'react-helmet';
import {AppState} from '../common/store/index';
import serialize from 'serialize-javascript';

let assets: any;

const syncLoadAssets = () => {
    assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();


export const render  = (markup:string, state: AppState) => {
    const helmet = Helmet.renderStatic();
    const headHelmet = helmet.meta.toString() + helmet.title.toString() + helmet.link.toString();

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
                <meta name="theme-color" content="#000000" />
                <link rel="apple-touch-icon" href="/logo192.png" />
                <link rel="manifest" href="/manifest.json" />
                ${headHelmet}
                ${assets.client.css ? `<link rel="stylesheet" href="${assets.client.css}">` : ''}
                ${process.env.NODE_ENV === 'production' ? `<script src="${assets.client.js}" defer></script>` : `<script src="${assets.client.js}" defer crossorigin></script>`}
            </head>
            <body class="${`theme-${state.global.theme}`}">
                <div id="root">${markup}</div>
                <script>
                  window.__PRELOADED_STATE__ = ${serialize(state)}
                </script>
            </body>
        </html>`;
};
