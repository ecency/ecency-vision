import express from "express";

import React from "react";
import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";

import { Helmet } from "react-helmet";

import serialize from "serialize-javascript";

import App from "../common/app";

import { AppState } from "../common/store/index";

import configureStore from "../common/store/configure";

let assets: any = require(process.env.RAZZLE_ASSETS_MANIFEST || "");

const cssLinksFromAssets = (assets:any, entrypoint:string) => {
  return assets[entrypoint] ? assets[entrypoint].css ?
  assets[entrypoint].css.map((asset:any)=>
    `<link rel="stylesheet" href="${asset}">`
  ).join('') : '' : '';
};

export const render = (req: express.Request, state: AppState) => {
  const store = configureStore(state);

  const context = {};

  const markup = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.originalUrl} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  );

  const finalState = store.getState();

  const helmet = Helmet.renderStatic();
  const headHelmet =
    helmet.meta.toString() + helmet.title.toString() + helmet.link.toString();

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
            </head>
            <body class="${`theme-${state.global.theme}`}">
                <div id="root">${markup}</div>
                <script>
                  window.__PRELOADED_STATE__ = ${serialize(finalState)}
                </script>   
            ${cssLinksFromAssets(assets, 'client')}
            ${
              process.env.NODE_ENV === "production"
                ? `<script src="${assets.client.js}" defer></script>`
                : `<script src="${assets.client.js}" defer crossorigin></script>`
            }
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://ecency.com/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ecency.com/search/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
            </script>
            </body>
        </html>`;
};
