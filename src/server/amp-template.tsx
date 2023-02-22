import express from "express";
import path from "path";
import React from "react";
import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import App from "../common/app";
import { AppState } from "../common/store";
import configureStore from "../common/store/configure";

let assets: any = require(process.env.RAZZLE_ASSETS_MANIFEST || "");

const cssLinksFromAssets = (assets: any, entrypoint: string) => {
  return assets[entrypoint]
    ? assets[entrypoint].css
      ? assets[entrypoint].css
          .map((asset: any) => `<link rel="stylesheet" href="${asset}">`)
          .join("")
      : ""
    : "";
};

export const renderAmp = async (req: express.Request, state: AppState) => {
  const store = configureStore(state);

  const context = {};

  let markup = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.originalUrl} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  );

  const helmet = Helmet.renderStatic();
  const headHelmet = helmet.meta.toString() + helmet.title.toString() + helmet.link.toString();

  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="theme-color" content="#000000"/>
                ${headHelmet}
                <link rel="icon" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/logo192.png" />
                <link rel="manifest" href="/manifest.json" />
                ${cssLinksFromAssets}
            </head>
            <body class="${`theme-${state.global.theme}`}">
                <div id="root">${markup}</div>
            </body>
        </html>`;
};
